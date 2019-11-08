#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 09:54:26 2018

@author: edward

A class that can be used to implement many parallel environments

"""
import multiprocessing as mp
import numpy as np
try:
    from gym.spaces.box import Box
    from baselines.common.atari_wrappers import make_atari, wrap_deepmind
except ImportError:
    print('Unable to import gym / OpenAI baselines, I assume you are running the doom env')

from arguments import parse_game_args


from environments import DoomEnvironment

def worker(in_queue, out_queue, params):
    env = DoomEnvironment(params)
    while True:
        action = in_queue.get()
        if action is None:
            break
        elif action == 'reset':
            out_queue.put(env.reset())
        elif action == 'depth_trim':
            out_queue.put(env.get_depth()[2:-2,2:-2])
        elif action == 'depth':
            out_queue.put(env.get_depth())
        else:
            obs, reward, done, info = env.step(action)
            out_queue.put((obs, reward, done, info))
    

class MultiEnvsMP(object):
    def __init__(self, env_id, num_envs, num_processes, params):
      
        self.in_queues = [mp.Queue() for _ in range(num_envs)]
        self.out_queues = [mp.Queue() for _ in range(num_envs)]
        self.workers = []
        
        for in_queue, out_queue in zip(self.in_queues, self.out_queues):
            print('Creating environment')
            process = mp.Process(target=worker, args=(in_queue, out_queue, params))
            self.workers.append(process)
            process.start()
            
        #print('There are {} workers'.format(len(self.workers)))
    
        assert env_id == 'doom', 'Multiprocessing only implemented for doom envirnment'           
        tmp_env = DoomEnvironment(params)
        self.num_actions = tmp_env.num_actions
        self.obs_shape = (3, params.screen_height, params.screen_width)
        self.prep = False # Observations already in CxHxW order    

    def reset(self):
        new_obs = []
        for queue in self.in_queues:
            queue.put('reset')
        for queue in self.out_queues:
            obs = queue.get()       
            new_obs.append(self.prep_obs(obs))
            
        return np.stack(new_obs)
    
    def get_depths(self, trim=True):
        depths = []
        command = 'depth'
        if trim: command = 'depth_trim'
            
        for queue in self.in_queues:
            queue.put(command)
        
        for queue in self.out_queues:
            depths.append(queue.get())

        return np.stack(depths)                
                    
    def prep_obs(self, obs):
        if self.prep:
            return obs.transpose(2,0,1)
        else: 
            return obs
    
    def step(self, actions):
        new_obs = []
        rewards = []
        dones = []
        infos = []
 
        for action, queue in zip(actions, self.in_queues):
            queue.put(action)
        
        for queue in self.out_queues:
            obs, reward, done, info = queue.get()
            new_obs.append(self.prep_obs(obs))
            rewards.append(reward)
            dones.append(done)
            infos.append(infos)
        
        return np.stack(new_obs), rewards, dones, infos                
       
        
class MultiEnvs(object):
    
    def __init__(self, env_id, num_envs, num_processes, params):  
        if env_id == 'doom':
            # for the doom scenarios
            self.envs = [DoomEnvironment(params) for i in range(num_envs)]
            self.num_actions = self.envs[0].num_actions
            self.obs_shape = (3, params.screen_height, params.screen_width)
            self.prep = False # Observations already in CxHxW order
        elif env_id == 'home':
            assert 0, 'HoME has not been implemented yet'
        else:
            # if testing on Atari games such as Pong etc
            self.envs = [wrap_deepmind(make_atari(env_id)) for i in range(num_envs)]
            observation_space = self.envs[0].observation_space
            obs_shape = observation_space.shape
            observation_space = Box(
                observation_space.low[0,0,0],
                observation_space.high[0,0,0],
                [obs_shape[2], obs_shape[1], obs_shape[0]]
            )
            action_space  = self.envs[0].action_space
        
            self.num_actions = action_space.n
            self.obs_shape = observation_space.shape
            self.prep = True
        
    
    def reset(self):
        return np.stack([self.prep_obs(env.reset()) for env in self.envs])
    
    def get_depths(self, trim=True):
        if trim:
            return np.stack([env.get_depth()[2:-2,2:-2] for env in self.envs])
        else:
            return np.stack([env.get_depth() for env in self.envs])
    
    def prep_obs(self, obs):
        if self.prep:
            return obs.transpose(2,0,1)
        else: 
            return obs
    
    def step(self, actions):
        new_obs = []
        rewards = []
        dones = []
        infos = []
        
        
        for env, action in zip(self.envs, actions):
            obs, reward, done, info = env.step(action)
#            if done: 
#                obs = env.reset()
            new_obs.append(self.prep_obs(obs))
            rewards.append(reward)
            dones.append(done)
            infos.append(infos)
        
        return np.stack(new_obs), rewards, dones, infos
    

if __name__ == '__main__':
    
    params = parse_game_args()
    params.scenario_dir = '../resources/scenarios/'
    
    mp_test_envs = MultiEnvsMP(params.simulator, params.num_environments, 1, params)
    mp_test_envs.reset()
    actions = [2]*16
    
    for i in range(10):
        new_obs, rewards, dones, infos = mp_test_envs.step(actions)
        print(mp_test_envs.get_depths().shape)
        print(rewards, np.stack(rewards))    
    
    envs = MultiEnvs(params.simulator, params.num_environments, 1, params)
    envs.reset()
    
    
    
    for i in range(10):
        new_obs, rewards, dones, infos = envs.step(actions)
        print(envs.get_depths().shape)
        print(rewards, np.stack(rewards))


    def test_mp_reset():
        mp_test_envs.reset()
    
    def test_mp_get_obs():
        actions = [2]*16
        new_obs, rewards, dones, infos = mp_test_envs.step(actions)
    
    def test_sp_reset():
        envs.reset()
    
    def test_sp_get_obs():
        actions = [2]*16
        new_obs, rewards, dones, infos = envs.step(actions)        


    print('#'*80)
    print('#'*80)
    print('--- Running timing tests ---')
    print('#'*80)
    print('Multiprocessing')
    print('MP Reset test 1000 trials', timeit.timeit("test_mp_reset()", number=10))

    print('#'*80)
    print('Multiprocessing')









