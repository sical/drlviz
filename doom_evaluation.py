#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 14:31:17 2018

@author: edward
"""
if __name__ == '__main__':  # changes backend for animation tests
    import matplotlib

    matplotlib.use("Agg")

import numpy as np
from collections import deque
from moviepy.editor import ImageSequenceClip
from environments import DoomEnvironment
import torch
from torch import Tensor
from torch.autograd import Variable
from arguments import parse_game_args
from multi_env import MultiEnvs
from models import CNNPolicy
import matplotlib.pyplot as plt


class BaseAgent(object):
    def __init__(self, model, params):
        self.model = model

        self.cuda = params.cuda
        self.gradients = None
        self.step = 0
        # self.update_relus()

        if params.num_stack > 1:
            self.exp_size = params.num_stack
            self.short_term_memory = deque()

        self.state = Variable(torch.zeros(1, model.state_size), volatile=True)
        self.mask = Variable(Tensor([1.0]), volatile=True)

        print(self.mask)
        if params.cuda:
            self.state = self.state.cuda()
            self.mask = self.mask.cuda()

    def get_action(self, observation, epsilon=0.0):
        if hasattr(self, 'short_term_memory'):
            observation = self._prepare_observation(observation)

        observation = Variable(torch.from_numpy(observation), volatile=True).unsqueeze(0)
        if self.cuda:
            print('la>')
            observation = observation.cuda()
        _, action, _, self.state = self.model.act(observation, self.state, self.mask, deterministic=True)

        return action.cpu().data.numpy()[0, 0]

    def get_action_value_and_probs(self, observation, epsilon=0.0):

        if hasattr(self, 'short_term_memory'):
            observation = self._prepare_observation(observation)

        observation = Variable(torch.from_numpy(observation).unsqueeze(0), requires_grad=True)

        if self.cuda:
            observation = observation.cuda()
        value, action, probs, self.state, x = self.model.get_action_value_and_probs(observation, self.state, self.mask, [], deterministic=True)
        self.model.zero_grad()
        te = probs.cpu().data.numpy()

        one_hot_output = torch.cuda.FloatTensor(1, x.size()[-1]).zero_()
        one_hot_output[0][te.argmax()] = 1

        probs = Variable(probs.data, requires_grad=True)
        x.backward(gradient=one_hot_output)

        x.detach_()

        grads = observation.grad.data.clamp(min=0)

        grads.squeeze_()
        grads.transpose_(0, 1)
        grads.transpose_(1, 2)
        grads = np.amax(grads.cpu().numpy(), axis=2)

        grads -= grads.min()
        grads /= grads.max()

        grads *= 254
        grads = grads.astype(np.int8)

        return action.cpu().data.numpy()[0, 0], value.cpu().data.numpy(), probs.cpu().data.numpy(), grads

    def get_action_value_and_probs_zeroes(self, observation, mask2, epsilon=0.0):

        if hasattr(self, 'short_term_memory'):
            observation = self._prepare_observation(observation)

        observation = Variable(torch.from_numpy(observation).unsqueeze(0), requires_grad=True)

        if self.cuda:
            observation = observation.cuda()

        value, action, probs, self.state, x = self.model.get_action_value_and_probs(observation, self.state, self.mask, mask2, deterministic=True)

        self.model.zero_grad()

        # te = probs.cpu().data.numpy()

        # one_hot_output = torch.cuda.FloatTensor(1, x.size()[-1]).zero_()
        # one_hot_output[0][te.argmax()] = 1

        # probs = Variable(probs.data, requires_grad=True)

        x.backward(gradient=x)
        x.detach_()

        grads = observation.grad.data.clamp(min=0)

        grads.squeeze_()
        grads.transpose_(0, 1)
        grads.transpose_(1, 2)
        grads = np.amax(grads.cpu().numpy(), axis=2)

        grads -= grads.min()
        grads /= grads.max()

        grads *= 254
        grads = grads.astype(np.int8)

        return action.cpu().data.numpy()[0, 0], value.cpu().data.numpy(), probs.cpu().data.numpy(), grads

    def reset(self):
        """
            reset the models hidden layer when starting a new rollout
        """
        if hasattr(self, 'short_term_memory'):
            self.short_term_memory = deque()
        self.state = Variable(torch.zeros(1, self.model.state_size), volatile=True)
        if self.cuda:
            self.state = self.state.cuda()

        self.step = 0

    def _prepare_observation(self, observation):
        """
           As the network expects an input of n frames, we must store a small
           short term memory of frames. At input this is completely empty so 
           I pad with the first observations 4 times
        """
        if len(self.short_term_memory) == 0:
            for _ in range(self.exp_size):
                self.short_term_memory.append(observation)

        self.short_term_memory.popleft()
        self.short_term_memory.append(observation)

        return np.vstack(self.short_term_memory)

    def get_step(self):

        return self.step


def eval_model(model, params, logger, step, train_iters, num_games):
    env = DoomEnvironment(params)
    agent = BaseAgent(model, params)

    eval_agent(agent, env, logger, params, step, train_iters, num_games)


def eval_agent(agent, env, logger, params, step, train_iters, num_games=10):
    """
        Evaluates an agents performance in an environment Two metrics are
        computed: number of games suceeded and average total reward.
    """

    # TODO: Back up the enviroment so the agent can start where it left off    
    best_obs = None
    worst_obs = None
    best_reward = -10000
    worst_reward = 100000
    accumulated_rewards = 0.0
    reward_list = []
    time_list = []

    for game in range(num_games):
        env.reset()
        agent.reset()
        k = 0
        rewards = []
        obss = []
        while not env.is_episode_finished():
            obs = env.get_observation()

            action = agent.get_action(obs, epsilon=0.0)
            reward = env.make_action(action)
            rewards.append(reward)
            if not params.norm_obs:
                obs = obs * (1.0 / 255.0)
            obss.append(obs)
            k += 1
        time_list.append(k)

        reward_list.append(env.get_total_reward())
        if env.get_total_reward() > best_reward:
            best_obs = obss
            best_reward = env.get_total_reward()
        if env.get_total_reward() < worst_reward:
            worst_obs = obss
            worst_reward = env.get_total_reward()

        accumulated_rewards += env.get_total_reward()
    write_movie(params, logger, best_obs, step, best_reward)
    write_movie(params, logger, worst_obs, step + 1, worst_reward)

    logger.write('Step: {:0004}, Iter: {:000000008} Eval mean reward: {:0003.3f}'.format(step, train_iters, accumulated_rewards / num_games))
    logger.write('Step: {:0004}, Game rewards: {}, Game times: {}'.format(step, reward_list, time_list))


def write_movie(params, logger, observations, step, score):
    observations = [o.transpose(1, 2, 0) * 255.0 for o in observations]
    clip = ImageSequenceClip(observations, fps=int(30 / params.frame_skip))
    output_dir = logger.get_eval_output()
    clip.write_videofile('{}eval{:0004}_{:00005.0f}.mp4'.format(output_dir, step, score * 100))


if __name__ == '__main__':
    # Test to improve movie with action probs, values etc

    params = parse_game_args()
    params.norm_obs = False
    params.recurrent_policy = True
    envs = MultiEnvs(params.simulator, 1, 1, params)
    obs_shape = envs.obs_shape
    obs_shape = (obs_shape[0] * params.num_stack, *obs_shape[1:])
    model = CNNPolicy(obs_shape[0], envs.num_actions, params.recurrent_policy, obs_shape)
    env = DoomEnvironment(params)
    agent = BaseAgent(model, params)

    env.reset()
    agent.reset()

    rewards = []
    obss = []
    actions = []
    action_probss = []
    values = []

    while not env.is_episode_finished():
        obs = env.get_observation()
        # action = agent.get_action(obs, epsilon=0.0)
        action, value, action_probs = agent.get_action_value_and_probs(obs, epsilon=0.0)
        # print(action)
        reward = env.make_action(action)
        rewards.append(reward)
        obss.append(obs)
        actions.append(actions)
        action_probss.append(action_probs)
        values.append(value)

    value_queue = deque()
    reward_queue = deque()
    for i in range(64):
        value_queue.append(0.0)
        reward_queue.append(0.0)

    import matplotlib.animation as manimation

    FFMpegWriter = manimation.writers['ffmpeg']
    metadata = dict(title='Movie Test', artist='Edward Beeching',
                    comment='First movie with data')
    writer = FFMpegWriter(fps=7.5, metadata=metadata)

    # plt.style.use('seaborn-paper')
    fig = plt.figure(figsize=(16, 9))

    ax1 = plt.subplot2grid((6, 6), (0, 0), colspan=6, rowspan=4)
    ax2 = plt.subplot2grid((6, 6), (4, 3), colspan=3, rowspan=2)
    ax3 = plt.subplot2grid((6, 6), (4, 0), colspan=3, rowspan=1)
    ax4 = plt.subplot2grid((6, 6), (5, 0), colspan=3, rowspan=1)
    # World plot
    im = ax1.imshow(obs.transpose(1, 2, 0) / 255.0)
    ax1.axis('off')

    # Action plot
    bar_object = ax2.bar('L, R, F, B, L + F, L + B, R + F, R + B'.split(','), action_probs.tolist()[0])
    ax2.set_title('Action Probabilities', position=(0.5, 0.85))

    # plt.title('Action probabilities')
    # ax2.axis('on')
    ax2.set_ylim([-0.01, 1.01])
    # values
    values_ob, = ax3.plot(value_queue)
    ax3.set_title('State Values', position=(0.1, 0.05))
    ax3.set_ylim([np.min(np.stack(values)) - 0.2, np.max(np.stack(values)) + 0.2])
    ax3.get_xaxis().set_visible(False)
    # plt.title('State values')
    rewards_ob, = ax4.plot(reward_queue)
    ax4.set_title('Rewards', position=(0.07, 0.05))
    # plt.title('Reward values')
    ax4.set_ylim([-0.01, 1.0])
    fig.tight_layout()

    print('writing')
    with writer.saving(fig, "writer_test.mp4", 100):
        for observation, action_probs, value, reward in zip(obss, action_probss, values, rewards):
            im.set_array(observation.transpose(1, 2, 0) / 255.0)
            for b, v in zip(bar_object, action_probs.tolist()[0]):
                b.set_height(v)
            value_queue.popleft()
            value_queue.append(value[0, 0])
            reward_queue.popleft()
            reward_queue.append(reward)
            values_ob.set_ydata(value_queue)
            rewards_ob.set_ydata(reward_queue)

            writer.grab_frame()
