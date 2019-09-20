# DRLViz

DRLViz is an interactive tool visualizing the hidden recurrent state of an RL agent and its effect on affordances and policy. 

[DRLViz: Understanding Decisions and Memory in Deep Reinforcement Learning](https://arxiv.org/abs/1909.02982)

Theo Jaunet, Romain Vuillemot, Christian Wolf


This repository contains the front-end of DRLViz, a visual analytics tool to explore the memory of agents trained with Deep Reinforcement learning.


<img src="https://github.com/sical/drlviz/blob/master/screenshot%20(1).png">


# Live Demo
(Designed to work with google Chrome)

This tool is accessible using the following link: https://sical.github.io/drlviz/


# Running it Locally


To run this interface locally, download or clone this repository

```
git clone https://github.com/sical/drlviz.git
``` 


Open the downloaded directory and start any server. For demonstration sake we used: [SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html)

```
python -m SimpleHTTPServer 8000
```
You can now access DRLViz at: http://localhost:8000/.


