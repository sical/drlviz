# DRLViz

DRLViz is an interactive tool visualizing the hidden recurrent state of an RL agent and its effect on affordances and policy. 



[DRLViz: Understanding Decisions and Memory in Deep Reinforcement Learning](https://arxiv.org/abs/1909.02982)

Authors: Theo Jaunet, Romain Vuillemot, Christian Wolf


This repository contains the front-end of DRLViz, a visual analytics tool to explore the memory of agents trained with Deep Reinforcement learning.


<img src="https://github.com/sical/drlviz/blob/master/teaser.png">


## Live Demo
(Designed to work on Google Chrome, at 1920*1080)

This tool is accessible using the following link: https://sical.github.io/drlviz/


## Running it Locally


To run this interface locally, download or clone this repository

```
git clone https://github.com/sical/drlviz.git
``` 


Open the downloaded directory and start any server. For demonstration sake we used: [SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html)

```
python -m SimpleHTTPServer 8000
```

Once the server is launched, you should be able to access DRLViz at: http://localhost:8000/.


## Running it with your own data

To use DRLViz with your own data, you must first down setup a local instance of DRLViz as described in the previous section.

Then, you should edit the file: data.json, to fill it with your own data. This data set is strutured to store episode per episodes, and then step per step across attributes. Thus, to reach the actions which occured at step 5 in episode0, one must use the following code: `data['episode0].actions[5]`. Each episode must be at the JSON's root, and their key name must start with "episode" concatened with their incremented id (e.g. 'episode0', then, 'episode1' and so on ..). 


```
{
episode0: {
 
  actions: [0,4,5,...],  # interger [0-7] corresponding to the index in ['left','Right','Forward','Backward','Left + Forward','Left + Backward', 'Right + forward','Right + backward']
  
  fov: [ # array of objects corresponding to the objects in the agent's field of view
          [
            {object_position_y:320.3, # float indicating Y position of the observed object in the environment
              object_position_x: 310.2, # float indicating X position of the observed object in the environment
              object_id:,  # interger indicating the object's id one per object
              object_x:, # position X in pixels of the object in the current observation (e.g. 0 if it is on the left)
              object_name:"" }, # String indicating the agent's type (e.g. health pack)
            {..}
          ],
          [
            {...}
          ]
       ],
  
  health: [100.0,90.0,52.6,...], # float indicating the agent's health status 
  hiddens: [[0.95456,0.6446,...],[1.0,0.544,...],...] , Array of floats corresponding to a hidden state.
  inputs: ['','',...], # Image corresponding to the agent's observation. Those images are encoded in base64 strings.
  orientations[270.3,285.6,...], # float indicating the agent's orientation scaled on 360 degrees
  positions [[680.5,210.3],[682.3,215.6]], # array of float corresponding to the agent's position in the environment.
  probabilities [[,],[,]], # float correpsoning the actions probabilities with index matching those of actions.
  saliencies: ['','',...], # Image encoded in base64 strings, they will be used as background of inputs.
  scores: [0.0,1.0,...] # float corresponding to either the agent's performance or its reward. This value must be accumalated.
  

},

episode1: {...}

}


```

## Citation

If you find this usefull, consider citing the following:

```
@article{jaunet2019drlviz,
    title={DRLViz: Understanding Decisions and Memory in Deep Reinforcement Learning},
    author={Theo Jaunet and Romain Vuillemot and Christian Wolf},
    year={2019},
    eprint={1909.02982},
    archivePrefix={arXiv},
    primaryClass={cs.LG}
}

```

