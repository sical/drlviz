# DRLViz

DRLViz is an interactive tool visualizing the hidden recurrent state of an RL agent and its effect on affordances and policy. 



[DRLViz: Understanding Decisions and Memory in Deep Reinforcement Learning](https://arxiv.org/abs/1909.02982)

Authors: Theo Jaunet, Romain Vuillemot, Christian Wolf


This repository contains the front-end of DRLViz, a visual analytics tool to explore the memory of agents trained with Deep Reinforcement learning.

<p align="center">
<img src="https://github.com/sical/drlviz/blob/master/static/assets/item.png" height="450">
</p>

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

Then, you can either:

Change line#64 in [main.html](https://github.com/sical/drlviz/blob/master/main.html) and add your on file as it follows: 

```

 let datafile = "mydata.json" // Change "mydata.json" with your own dataset
 
```
Each episode must be at the JSON's root, and their key name must start with "episode" concatened with their incremented id (e.g. 'episode0', then, 'episode1' and so on ..). Your file must contain attributes as presented bellow.


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


## Memory Reductions

In order to produce your own memory reductions, you can can use the script [reduce.py](https://github.com/sical/drlviz/blob/master/reduce.py). Such a script, is designed to work on python >= 3.5 and linux, it requires some python dependencies you can install with the following command.

```

pip install -r requirements.txt

```

This script allows you to select the memory order you want, and the number of elements to preserve. The outcome of this script is a file 'result.json' which you can then use in DRLViz.


## Citation

If you find this usefull, consider citing the following:
```
Theo Jaunet, Romain Vuillemot, Christian Wolf DRLViz: Understanding Decisions and Memory
in Deep Reinforcement Learning url: https://diglib.eg.org/handle/10.1111/cgf13962
```


```
@article {10.1111:cgf.13962,
journal = {Computer Graphics Forum},
title = {{DRLViz: Understanding Decisions and Memory in Deep Reinforcement Learning}},
author = {Jaunet, Theo and Vuillemot, Romain and Wolf, Christian},
year = {2020},
publisher = {The Eurographics Association and John Wiley & Sons Ltd.},
ISSN = {1467-8659},
DOI = {10.1111/cgf.13962}
}

```

