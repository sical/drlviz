#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 10:53:06 2018

@author: edward
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from distributions import Categorical


# A temporary solution from the master branch.


# https://github.com/pytorch/pytorch/blob/7752fe5d4e50052b3b0bbc9109e599f8157febc0/torch/nn/init.py#L312
# Remove after the next version of PyTorch gets release.
def orthogonal(tensor, gain=1):
    if tensor.ndimension() < 2:
        raise ValueError("Only tensors with 2 or more dimensions are supported")

    rows = tensor.size(0)
    cols = tensor[0].numel()
    flattened = torch.Tensor(rows, cols).normal_(0, 1)

    if rows < cols:
        flattened.t_()

    # Compute the qr factorization
    q, r = torch.qr(flattened)
    # Make Q uniform according to https://arxiv.org/pdf/math-ph/0609050.pdf
    d = torch.diag(r, 0)
    ph = d.sign()
    q *= ph.expand_as(q)

    if rows < cols:
        q.t_()

    tensor.view_as(q).copy_(q)
    tensor.mul_(gain)
    return tensor


def weights_init(m):
    classname = m.__class__.__name__
    if classname.find('Conv') != -1 or classname.find('Linear') != -1:
        orthogonal(m.weight.data)
        if m.bias is not None:
            m.bias.data.fill_(0)


class FFPolicy(nn.Module):
    def __init__(self):
        super(FFPolicy, self).__init__()

    def forward(self, inputs, states, masks, masktry):
        raise NotImplementedError

    def act(self, inputs, states, masks, deterministic=False):
        value, x, states = self(inputs, states, masks)
        action = self.dist.sample(x, deterministic=deterministic)
        action_log_probs, dist_entropy = self.dist.logprobs_and_entropy(x, action)
        return value, action, action_log_probs, states

    def evaluate_actions(self, inputs, states, masks, actions, pred_depths=False):
        if pred_depths:
            value, x, states, depths = self(inputs, states, masks, pred_depths)
            action_log_probs, dist_entropy = self.dist.logprobs_and_entropy(x, actions)
            return value, action_log_probs, dist_entropy, states, depths
        else:
            value, x, states = self(inputs, states, masks)
            action_log_probs, dist_entropy = self.dist.logprobs_and_entropy(x, actions)
            return value, action_log_probs, dist_entropy, states, None

    def get_action_value_and_probs(self, inputs, states, masks, masktry, deterministic=False):

        value, x, states = self(inputs, states, masks, masktry)
        action = self.dist.sample(x, deterministic=deterministic)
        action_log_probs, dist_entropy = self.dist.logprobs_and_entropy(x, action)
        return value, action, F.softmax(self.dist(x), dim=1), states, x


class CNNPolicy(FFPolicy):
    def __init__(self, num_inputs, num_actions, use_gru, input_shape):
        super(CNNPolicy, self).__init__()
        # self.conv1 = nn.Conv2d(num_inputs, 32, 8, stride=4)
        # self.relu1 = nn.ReLU(True)
        # self.conv2 = nn.Conv2d(32, 64, 4, stride=2)
        # self.relu2 = nn.ReLU(True)
        # self.conv3 = nn.Conv2d(64, 32, 3, stride=1)
        # self.relu3 = nn.ReLU()
        self.h = None
        self.conv_head = nn.Sequential(nn.Conv2d(num_inputs, 32, 8, stride=4),
                                       nn.ReLU(True),
                                       nn.Conv2d(32, 64, 4, stride=2),
                                       nn.ReLU(True),
                                       nn.Conv2d(64, 32, 3, stride=1),
                                       nn.ReLU())

        conv_input = torch.autograd.Variable(torch.randn((1,) + input_shape))
        self.conv_out_size = self.conv_head(conv_input).nelement()
        self.hidden_size = 512
        self.linear1 = nn.Linear(self.conv_out_size, self.hidden_size)

        if use_gru:
            self.gru = nn.GRUCell(512, 512)

        self.critic_linear = nn.Linear(512, 1)

        self.dist = Categorical(512, num_actions)

        self.eval()
        self.reset_parameters()

    @property
    def state_size(self):
        if hasattr(self, 'gru'):
            return 512
        else:
            return 1

    def reset_parameters(self):
        self.apply(weights_init)

        relu_gain = nn.init.calculate_gain('relu')
        for i in range(0, 6, 2):
            self.conv_head[i].weight.data.mul_(relu_gain)
        self.linear1.weight.data.mul_(relu_gain)

        if hasattr(self, 'gru'):
            orthogonal(self.gru.weight_ih.data)
            orthogonal(self.gru.weight_hh.data)
            self.gru.bias_ih.data.fill_(0)
            self.gru.bias_hh.data.fill_(0)

        if self.dist.__class__.__name__ == "DiagGaussian":
            self.dist.fc_mean.weight.data.mul_(0.01)

    def forward(self, inputs, states, masks, masktry, pred_depth=False):

        x = self.conv_head(inputs * (1.0 / 255.0))
        x = x.view(-1, self.conv_out_size)
        x = self.linear1(x)
        x = F.relu(x)

        if hasattr(self, 'gru'):
            if inputs.size(0) == states.size(0):
                x = states = self.gru(x, states * masks)

                if len(masktry) > 0:
                    x = states = states * masktry

                self.h = x
            else:
                x = x.view(-1, states.size(0), x.size(1))
                masks = masks.view(-1, states.size(0), 1)
                outputs = []
                for i in range(x.size(0)):
                    hx = states = self.gru(x[i], states * masks[i])
                    outputs.append(hx)

                x = torch.cat(outputs, 0)

        return self.critic_linear(x), x, states

    #
    # def get_cnn_w(self):
    #     a = self.conv1.cpu().weight.data
    #     b = self.conv2.cpu().weight.data
    #     c = self.conv3.cpu().weight.data
    #
    #     self.conv1.cuda()
    #     self.conv2.cuda()
    #     self.conv3.cuda()
    #     return [a, b, c]
    #
    # def get_cnn_f(self):
    #     a = self.x1.cpu().data.numpy()
    #     b = self.x2.cpu().data.numpy()
    #     c = self.x3.cpu().data.numpy()
    #
    #     return [a, b, c]
    #
    def get_gru_h(self):
        return [self.h.cpu().data.numpy()]


class CNNDepthPolicy(FFPolicy):
    def __init__(self, num_inputs, num_actions, use_gru, input_shape):
        super(CNNDepthPolicy, self).__init__()

        self.conv_head = nn.Sequential(nn.Conv2d(num_inputs, 32, 8, stride=4),
                                       nn.ReLU(True),
                                       nn.Conv2d(32, 64, 4, stride=2),
                                       nn.ReLU(True),
                                       nn.Conv2d(64, 32, 3, stride=1),
                                       nn.ReLU())

        self.depth_head = nn.Conv2d(32, 8, 1, 1)

        conv_input = torch.autograd.Variable(torch.randn((1,) + input_shape))
        print(conv_input.size(), self.conv_head(conv_input).size())
        self.conv_out_size = self.conv_head(conv_input).nelement()
        self.linear1 = nn.Linear(self.conv_out_size, 512)

        if use_gru:
            self.gru = nn.GRUCell(512, 512)

        self.critic_linear = nn.Linear(512, 1)
        self.dist = Categorical(512, num_actions)

        self.train()
        self.reset_parameters()

    @property
    def state_size(self):
        if hasattr(self, 'gru'):
            return 512
        else:
            return 1

    def reset_parameters(self):
        self.apply(weights_init)

        relu_gain = nn.init.calculate_gain('relu')
        for i in range(0, 6, 2):
            self.conv_head[i].weight.data.mul_(relu_gain)
        self.linear1.weight.data.mul_(relu_gain)

        if hasattr(self, 'gru'):
            orthogonal(self.gru.weight_ih.data)
            orthogonal(self.gru.weight_hh.data)
            self.gru.bias_ih.data.fill_(0)
            self.gru.bias_hh.data.fill_(0)

        if self.dist.__class__.__name__ == "DiagGaussian":
            self.dist.fc_mean.weight.data.mul_(0.01)

    def forward(self, inputs, states, masks, pred_depth=False):
        x = self.conv_head(inputs * (1.0 / 255.0))
        if pred_depth:
            depth = self.depth_head(x)
        x = x.view(-1, self.conv_out_size)
        x = self.linear1(x)
        x = F.relu(x)

        if hasattr(self, 'gru'):
            if inputs.size(0) == states.size(0):
                x = states = self.gru(x, states * masks)
            else:
                x = x.view(-1, states.size(0), x.size(1))
                masks = masks.view(-1, states.size(0), 1)
                outputs = []
                for i in range(x.size(0)):
                    hx = states = self.gru(x[i], states * masks[i])
                    outputs.append(hx)
                x = torch.cat(outputs, 0)
        if pred_depth:
            return self.critic_linear(x), x, states, depth
        else:
            return self.critic_linear(x), x, states


if __name__ == '__main__':
    depth_model = CNNDepthPolicy(3, 8, False, (3, 64, 112))
    example_input = torch.autograd.Variable(torch.randn(1, 3, 64, 112))
    c, x, s, d = depth_model(example_input, None, torch.autograd.Variable(torch.Tensor([1])), True)

    d.size()

    conv_head = nn.Sequential(nn.Conv2d(3, 32, 8, stride=4),
                              nn.ReLU(True),
                              nn.Conv2d(32, 64, 4, stride=2),
                              nn.ReLU(True),
                              nn.Conv2d(64, 32, 3, stride=1),
                              nn.ReLU())

    step1 = nn.Conv2d(3, 32, 8, stride=4)(example_input)
    step2 = nn.Sequential(nn.Conv2d(3, 32, 8, stride=4),
                          nn.ReLU(True),
                          nn.Conv2d(32, 64, 4, stride=2))(example_input)
    step3 = nn.Sequential(nn.Conv2d(3, 32, 8, stride=4),
                          nn.ReLU(True),
                          nn.Conv2d(32, 64, 4, stride=2),
                          nn.ReLU(True),
                          nn.Conv2d(64, 32, 3, stride=1),
                          nn.ReLU())(example_input)

    print('Step1', step1.size())
    print('Step2', step2.size())
    print('Step3', step3.size())
