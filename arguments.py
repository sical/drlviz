#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 10:37:33 2018

@author: edward


PongNoFrameskip-v4

"""

import argparse
def parse_game_args():
    """ Defines the arguments used for both training and testing the network"""
    
    parser = argparse.ArgumentParser(description='Parameters')

    # =========================================================================
    #               Environment Parameters
    # =========================================================================
    parser.add_argument('--simulator', type=str, default="doom", help='The environment')
    parser.add_argument('--scenario', type=str, default='health_gathering.cfg', help='The scenario')
    parser.add_argument('--screen_size', type=str, default='320X180', help='Size of Screen, width x height')
    parser.add_argument('--screen_height', type=int, default=64, help='Height of the screen')
    parser.add_argument('--screen_width', type=int, default=112, help='Width of the screen')
    parser.add_argument('--num_environments', type=int, default=16, help='the number of parallel enviroments')
    parser.add_argument('--limit_actions', default=False, action='store_true', help='limited the size of the action space to F, L, R, F+L, F+R')
    parser.add_argument('--use_depth', type=bool, default=False,  help='Use the Depth Buffer') 
    parser.add_argument('--scenario_dir', type=str, default='scenarios/', help='location of game scenarios')
    parser.add_argument('--show_window', type=bool, default=False, help='Show the game window')
    #parser.add_argument('--decimate', type=bool, default=True, help='Subsample the observations')
    parser.add_argument('--resize', type=bool, default=True, help='Use resize for decimation rather ran downsample')
    parser.add_argument('--norm_obs', dest='norm_obs',default=False, action='store_false', help='Divide the obs by 255.0')
    # =========================================================================
    #               Model Parameters
    # =========================================================================
    parser.add_argument('--hidden_size', type=int, default=512, help='LSTM hidden size')
    parser.add_argument('--conv_filters', type=int, default=32, help='Number of convolutional filters' )   
    parser.add_argument('--predict_depth', default=False, action='store_true', help='make depth predictions')
    parser.add_argument('--reload_model', type=str, default='', help='directory and iter of model to load dir,iter')
    parser.add_argument('--model_checkpoint', type=str, default='', help='the name of a specific model to evaluate, used when making videos')
    # =========================================================================
    #               Training Parameters 
    # =========================================================================    
    parser.add_argument('--learning_rate', type=float, default=7e-4, help='training learning rate') 
    parser.add_argument('--gamma', type=float, default=0.99, help='reward discount factor')
    parser.add_argument('--frame_skip', type=int, default=4, help='number of frames to repeat last action')
    parser.add_argument('--train_freq', type=int, default=4, help='how often the model is updated')
    parser.add_argument('--train_report_freq', type=int, default=100, help='how often to report the train loss')
    parser.add_argument('--max_iters', type=int, default=5000000, help='maximum number of traning iterations')
    parser.add_argument('--eval_freq', type=int, default=5000, help='how often the model is evaluated, in games')
    parser.add_argument('--eval_games', type=int, default=10, help='how often the model is evaluated, in games')
    parser.add_argument('--cuda', type=bool, default=False, help='Use the GPU?')
    parser.add_argument('--model_save_rate', type=int, default=10000, help='How often to save the model in iters')
    parser.add_argument('--pretrained_head',type=str, default='', help='Name of pretrained convolutional head')
    parser.add_argument('--freeze_pretrained', type=bool, default=True, help='Whether to freeze the weights in pretrained head')
    parser.add_argument('--eps', type=float, default=1e-5, help='RMSprop optimizer epsilon (default: 1e-5)')
    parser.add_argument('--alpha', type=float, default=0.99, help='RMSprop optimizer alpha (default: 0.99)')    
    parser.add_argument('--use-gae', action='store_true', default=False, help='use generalized advantage estimation')
    parser.add_argument('--tau', type=float, default=0.95, help='gae parameter (default: 0.95)')
    parser.add_argument('--entropy_coef', type=float, default=0.01, help='entropy term coefficient (default: 0.01)')
    parser.add_argument('--value_loss_coef', type=float, default=0.5, help='value loss coefficient (default: 0.5)')
    parser.add_argument('--max_grad_norm', type=float, default=0.5, help='max norm of gradients (default: 0.5)')    
    parser.add_argument('--num_steps', type=int, default=5, help='number of forward steps in A2C (default: 5)')
    parser.add_argument('--num_stack', type=int, default=1,help='number of frames to stack (default: 4)')
    parser.add_argument('--recurrent_policy', action='store_true', default=True, help='use a recurrent policy')
    parser.add_argument('--num_frames', type=int, default=10000000, help='total number of frames')          
    parser.add_argument('--depth_coef', type=float, default=0.01, help='weighting for depth loss')
    parser.add_argument('--no_reward_average', default=False, action='store_true', help='switch of reward averaging during frame skip')
    parser.add_argument('--use_em_loss', default=False, action='store_true', help='Use the discrete EM loss, optimal transport for depth preds')
    # =========================================================================
    #               Logging Parameters 
    # =========================================================================
    parser.add_argument('--user_dir', type=str, default='theo', help='Users home dir name')
    parser.add_argument('--log_interval', type=int, default=100, help='How often to log')

    return parser.parse_args()
       
    
    
if __name__ == '__main__':
    params = parse_game_args()
    print(params)
    print(params.action_size)
    import os
    print(os.listdir(params.scenario_dir))
    print(params.scenario)
 