#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Feb  8 11:03:06 2018

@author: edward
"""

from vizdoom import DoomGame, ScreenResolution, GameVariable, Button, AutomapMode
import numpy as np
from cv2 import resize
import cv2


class DoomEnvironment():
    """
        A wrapper class for the Doom Maze Environment
    """

    def __init__(self, params):
        self.game = DoomGame()

        VALID_SCENARIOS = ['my_way_home.cfg',
                           'health_gathering.cfg',
                           'health_gathering_supreme.cfg',
                           'health_gathering_supreme_no_death_penalty.cfg',
                           'custom_maze_001.cfg',
                           'custom_maze_002.cfg',
                           'take_cover.cfg']

        if params.scenario in VALID_SCENARIOS:
            self.game.load_config(params.scenario_dir + params.scenario)
        else:
            assert 0, 'Invalid environment {}'.format(params.scenario)

        if params.screen_size == '320X180':
            self.game.set_screen_resolution(ScreenResolution.RES_640X360)
        else:
            assert 0, 'Invalid screen_size {}'.format(params.screen_size)

        if params.use_depth or params.predict_depth:
            self.game.set_depth_buffer_enabled(True)

        self.game.set_labels_buffer_enabled(True)

        self.game.set_automap_buffer_enabled(False)
        # self.game.set_automap_mode(AutomapMode.OBJECTS)
        # self.game.set_automap_rotate(False)
        # self.game.set_automap_render_textures(False)
        self.predict_depth = params.predict_depth
        self.screen_width = params.screen_width
        self.screen_height = params.screen_height
        self.no_reward_average = params.no_reward_average
        self.game.set_window_visible(params.show_window)
        self.game.set_render_hud(False)
        self.game.init()
        if GameVariable.HEALTH in self.game.get_available_game_variables():
            self.previous_health = self.game.get_game_variable(GameVariable.HEALTH)

        self.resize = params.resize
        self.frame_skip = params.frame_skip
        self.norm_obs = params.norm_obs

        self.action_map = self._gen_actions(self.game, params.limit_actions, params.scenario)
        params.num_actions = len(self.action_map)
        self.num_actions = len(self.action_map)
        # print('Environment initialized')

    def _gen_actions(self, game, limit_action_space, sc):
        buttons = game.get_available_buttons()
        # if buttons == [Button.TURN_LEFT, Button.TURN_RIGHT, Button.MOVE_FORWARD, Button.MOVE_BACKWARD]:

        if sc == 'take_cover.cfg':
            feasible_actions = [[True, False], [False, True]]
        else:
            if limit_action_space:

                feasible_actions = [[True, False, False, False],  # Left
                                    [False, True, False, False],  # Right
                                    [False, False, True, False],  # Forward
                                    [True, False, True, False],  # Left + Forward
                                    [False, True, True, False]]  # Right + forward
            else:
                feasible_actions = [[True, False, False, False],  # Left
                                    [False, True, False, False],  # Right
                                    [False, False, True, False],  # Forward
                                    [False, False, False, True],  # Backward
                                    [True, False, True, False],  # Left + Forward
                                    [True, False, False, True],  # Left + Backward
                                    [False, True, True, False],  # Right + forward
                                    [False, True, False, True]]  # Right + backward

        action_map = {i: act for i, act in enumerate(feasible_actions)}
        # print(action_map)
        return action_map

    def reset(self):
        self.game.new_episode()
        if GameVariable.HEALTH in self.game.get_available_game_variables():
            self.previous_health = self.game.get_game_variable(GameVariable.HEALTH)
        return self.get_observation()

    def is_episode_finished(self):
        return self.game.is_episode_finished()

    def get_observation(self):

        self.state = self.game.get_state()
        observation = self.state.screen_buffer

        if self.resize:
            # cv2 resize is 10x faster than skimage 1.37 ms -> 126 us

            observation = resize(
                observation.transpose(1, 2, 0),
                (self.screen_width, self.screen_height), cv2.INTER_AREA
            ).transpose(2, 0, 1)

        return self._normalize_observation(observation[:])

    def get_depth(self):
        assert self.predict_depth, 'Trying to predict depth but this option was not enabled in arguments'
        depth = self.state.depth_buffer
        return self._prepare_depth(depth)

    def _prepare_depth(self, depth_buffer):
        """
            resize the depth buffer so it is the same size as the output of the models conv head
            discretize the values in range 0-7 so we can predict the depth in as a classification
        """
        resized_depth = resize(depth_buffer, (self.screen_width // 8, self.screen_height // 8), cv2.INTER_AREA).astype(
            np.float32) * (1.0 / 255.0)
        return np.clip(np.floor((10 ** resized_depth - 1.0) * 5.0), 0.0, 7.0).astype(np.uint8)

    def _normalize_observation(self, observation):
        """
            Normalize the observation by making it in the range 0.0-1.0
            type conversion first is 2x faster
            multiplication is 4x faster than division
        """
        if self.norm_obs:
            return observation.astype(np.float32) * (1.0 / 255.0)
        else:
            return observation.astype(np.float32)

    def make_action(self, action):
        """
            perform an action, includes an option to skip frames but repeat
            the same action.
            
            TODO: Is normalization of the reward by the count required here?
        """

        reward = self.game.make_action(self.action_map[action])
        reward += self._check_health()
        count = 1.0
        for skip in range(1, self.frame_skip):
            if self.is_episode_finished():
                break
            reward += self.game.make_action(self.action_map[action])
            reward += self._check_health()
            count += 1.0
        if self.no_reward_average:
            count = 1.0

        return reward / count

    def step(self, action):
        reward = self.make_action(action)
        done = self.is_episode_finished()
        if done:
            obs = self.reset()
        else:
            obs = self.get_observation()

        return obs, reward, done, None

    def _check_health(self):
        """
            Modification to reward function in order to reward the act of finding a health pack
        
        """
        health_reward = 0.0

        if GameVariable.HEALTH not in self.game.get_available_game_variables():
            self.previous_health = self.game.get_game_variable(GameVariable.HEALTH)
            return health_reward

        if self.game.get_game_variable(GameVariable.HEALTH) > self.previous_health:
            # print('found healthkit')
            health_reward = 1.0
        self.previous_health = self.game.get_game_variable(GameVariable.HEALTH)
        return health_reward

    def get_total_reward(self):
        return self.game.get_total_reward()

    def get_pos(self):
        return [self.game.get_game_variable(GameVariable.POSITION_X), self.game.get_game_variable(GameVariable.POSITION_Y)]

    def get_map(self):

        if self.game.get_state().automap_buffer is not None:
            return self.game.get_state().automap_buffer
        else:
            return 'nope'

    def set_seed(self, seed):
        self.game.set_seed(seed)

    def get_seed(self):
        return self.game.get_seed()

    def get_health(self):
        return self.game.get_game_variable(GameVariable.HEALTH)

    def get_ori(self):
        return self.game.get_game_variable(GameVariable.ANGLE)

    def get_secret(self):
        return self.game.get_game_variable(GameVariable.SECRETCOUNT)

    def get_item(self):
        return self.game.get_game_variable(GameVariable.ITEMCOUNT)

    def get_velo(self):
        return [self.game.get_game_variable(GameVariable.VELOCITY_X), self.game.get_game_variable(GameVariable.VELOCITY_Y)]

    def get_fov(self):
        res = []
        if len(self.game.get_state().labels) > 0:

            for i in range(len(self.game.get_state().labels)):
                lab = self.game.get_state().labels[i]
                res.append({"object_id": lab.object_id, "object_name": lab.object_name, "object_position_x": lab.object_position_x, "object_position_y": lab.object_position_y, "object_x": lab.x})
        return res


def test():
    def simulate_rollout(env):
        from random import choice
        buffer = []
        env.reset()
        k = 0
        while not env.is_episode_finished():
            k += 1
            obs = env.get_observation()
            buffer.append(obs)

            # Makes a random action and save the reward.
            reward = env.make_action(choice(list(range(env.num_actions))))
        print('Game finished in {} steps'.format(k))
        print('Total rewards = {}'.format(env.get_total_reward()))
        return k, buffer

    # =============================================================================
    #   Test the environment
    # =============================================================================

    from arguments import parse_game_args
    params = parse_game_args()
    env = DoomEnvironment(params)
    print(env.num_actions)
    print(env.game.get_available_buttons())
    print(len(env.action_map))
    print(env.game.get_screen_height(), env.game.get_screen_width())

    print(env.get_observation().shape)

    import matplotlib.pyplot as plt

    plt.imshow(env.get_observation().transpose(1, 2, 0))
    plt.figure()
    plt.imshow(env.get_observation().transpose(1, 2, 0))

    env.decimate = False

    def resize_obs(observation):
        observation = observation.transpose(1, 2, 0)
        observation = resize(observation, (observation.shape[0] / 2, observation.shape[1] / 2))
        observation = observation.transpose(2, 0, 1)
        return observation

    data = env.get_observation().transpose(1, 2, 0)
    from skimage.transform import rescale, resize, downscale_local_mean

    data_resized = resize(data, (data.shape[0] / 2, data.shape[1] / 2))

    plt.figure()
    plt.imshow(data_resized)

    obs = env.get_observation()
    obs_rs = resize_obs(obs)

    assert 0
    for action in env.action_map.keys():
        reward = env.make_action(action)
        print(reward, env.is_episode_finished())

    for i in range(100):
        k, b = simulate_rollout(env)

    print(env.game.get_available_game_variables())
    print(env.game.get_game_variable(GameVariable.HEALTH))


def test_label_buffer():
    import matplotlib.pyplot as plt
    import random
    from doom_rdqn.arguments import parse_game_args
    params = parse_game_args()
    params.decimate = False
    env = DoomEnvironment(params)
    for i in range(10):
        env.make_action(random.choice(list(range(8))))

    state = env.game.get_state()
    labels_buffer = state.labels_buffer
    label = state.labels

    plt.subplot(1, 2, 1)
    plt.imshow(env.get_observation().transpose(1, 2, 0))
    plt.subplot(1, 2, 2)
    plt.imshow(labels_buffer)
    plt.figure()
    plt.imshow(resize(labels_buffer, (56, 32), cv2.INTER_AREA))

    plt.figure()
    plt.imshow(resize(env.get_observation().transpose(1, 2, 0), (112, 64), cv2.INTER_AREA))

    data = env.get_observation()

    def resize_test(image):
        return resize(image.transpose(1, 2, 0), (112, 64)).transpose(2, 0, 1)


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import random
    from doom_rdqn.arguments import parse_game_args

    params = parse_game_args()

    env = DoomEnvironment(params)

    state = env.game.get_state()
