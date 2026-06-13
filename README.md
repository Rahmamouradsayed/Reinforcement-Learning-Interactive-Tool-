Interactive Reinforcement Learning 
📌 Project Overview

This project is an interactive reinforcement learning framework that implements and compares multiple RL algorithms within a unified environment. It demonstrates both model-based and model-free approaches to study how agents learn optimal policies through interaction and reward feedback.

⚙️ Implemented Algorithms
Value Iteration
Policy Iteration
Monte Carlo Control
Temporal Difference Learning
Q-Learning
SARSA
🧠 Core Concept

The project focuses on training an agent to learn decision-making policies by maximizing cumulative rewards. Each algorithm updates value estimates or Q-values differently, allowing a clear comparison of learning strategies and convergence behavior.

🧩 System Architecture
State Representation: Encoded using structured keys
Environment Interaction: Step-based transitions with rewards
Learning Mechanism: Value updates based on algorithm logic
Policy Extraction: Derived from value/Q-function after training
Exploration Strategy: Epsilon-greedy for model-free methods
🔄 Training Workflow
Initialize environment and learning structures
Agent interacts with environment
Receive reward and next state
Update value function or Q-table
Improve policy based on learned values
Repeat until convergence or max iterations
📊 Outputs
Learned policy for each algorithm
State-value function (V)
Action-value function (Q)
Performance comparison across methods
🎯 Objective

To provide a clear, educational, and comparative implementation of reinforcement learning algorithms, helping to understand their behavior, strengths, and differences in solving sequential decision-making problems.
