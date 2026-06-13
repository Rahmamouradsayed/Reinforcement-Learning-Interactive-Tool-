Interactive Reinforcement Learning Toolkit
Project Description

This project implements multiple reinforcement learning algorithms in a single framework to study and compare their behavior in the same environment. It supports both model-based and model-free methods and focuses on learning optimal policies through interaction with an environment.

Implemented Algorithms
Value Iteration
Policy Iteration
Monte Carlo Control
Temporal Difference Learning
Q-Learning
SARSA
Core Idea

The system trains an agent to make decisions by learning from rewards. Each algorithm updates either value functions or Q-values to improve the policy over time until it reaches an optimal or near-optimal strategy.

How It Works
Initialize states, values, or Q-tables
Interact with the environment step by step or through episodes
Receive rewards after each action
Update values based on the algorithm logic
Improve the policy using learned values
Repeat until convergence or max iterations
Key Features
Multiple RL algorithms in one system
Support for both value-based and policy-based learning
Epsilon-greedy exploration for randomness
Episode-based training for learning from experience
Policy extraction after training
Value and Q-function estimation
Output

After training, the system provides:

Optimal or learned policy for each algorithm
State-value function (V-values)
Action-value function (Q-values for model-free methods)
Comparison between different learning approaches
Goal of the Project

To understand and compare how different reinforcement learning algorithms learn and perform under the same environment and conditions.
