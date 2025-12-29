class ValueIteration {
    constructor(env, gamma = 0.9) {
        this.env = env;
        this.gamma = gamma;
        this.values = {};
        this.policy = {};
        this.initializeValues();
    }

    initializeValues() {
        const states = this.env.getAllStates();
        states.forEach(s => {
            this.values[s] = 0;
            this.policy[s] = this.env.actions[0];
        });
    }

    iterate() {
        const states = this.env.getAllStates();
        let delta = 0;

        states.forEach(stateKey => {
            const oldValue = this.values[stateKey];
            const actions = this.env.getValidActions(stateKey);
            
            let maxValue = -Infinity;
            let bestAction = actions[0];

            actions.forEach(action => {
                const value = this.computeActionValue(stateKey, action);
                if (value > maxValue) {
                    maxValue = value;
                    bestAction = action;
                }
            });

            this.values[stateKey] = maxValue;
            this.policy[stateKey] = bestAction;
            delta = Math.max(delta, Math.abs(oldValue - maxValue));
        });

        return delta;
    }

    computeActionValue(stateKey, action) {
        const stateParts = stateKey.split(',').map(Number);
        const savedState = [...this.env.currentState];
        
        this.env.currentState = stateParts;
        const result = this.env.step(action);
        this.env.currentState = savedState;

        return result.reward + this.gamma * (this.values[result.state] || 0);
    }

    train(iterations = 50) {
        for (let i = 0; i < iterations; i++) {
            const delta = this.iterate();
            if (delta < 0.001) break;
        }
        return { values: this.values, policy: this.policy };
    }
}

class PolicyIteration {
    constructor(env, gamma = 0.9) {
        this.env = env;
        this.gamma = gamma;
        this.values = {};
        this.policy = {};
        this.initializePolicy();
    }

    initializePolicy() {
        const states = this.env.getAllStates();
        states.forEach(s => {
            this.values[s] = 0;
            const actions = this.env.getValidActions(s);
            this.policy[s] = actions[Math.floor(Math.random() * actions.length)];
        });
    }

    policyEvaluation(iterations = 10) {
        for (let i = 0; i < iterations; i++) {
            const states = this.env.getAllStates();
            const newValues = {};

            states.forEach(stateKey => {
                const action = this.policy[stateKey];
                newValues[stateKey] = this.computeActionValue(stateKey, action);
            });

            this.values = newValues;
        }
    }

    policyImprovement() {
        const states = this.env.getAllStates();
        let policyStable = true;

        states.forEach(stateKey => {
            const oldAction = this.policy[stateKey];
            const actions = this.env.getValidActions(stateKey);
            
            let bestAction = actions[0];
            let bestValue = -Infinity;

            actions.forEach(action => {
                const value = this.computeActionValue(stateKey, action);
                if (value > bestValue) {
                    bestValue = value;
                    bestAction = action;
                }
            });

            this.policy[stateKey] = bestAction;
            if (oldAction !== bestAction) {
                policyStable = false;
            }
        });

        return policyStable;
    }

    computeActionValue(stateKey, action) {
        const stateParts = stateKey.split(',').map(Number);
        const savedState = [...this.env.currentState];
        
        this.env.currentState = stateParts;
        const result = this.env.step(action);
        this.env.currentState = savedState;

        return result.reward + this.gamma * (this.values[result.state] || 0);
    }

    train(maxIterations = 20) {
        for (let i = 0; i < maxIterations; i++) {
            this.policyEvaluation();
            const stable = this.policyImprovement();
            if (stable) break;
        }
        return { values: this.values, policy: this.policy };
    }
}

class MonteCarlo {
    constructor(env, gamma = 0.9, epsilon = 0.1) {
        this.env = env;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.qTable = {};
        this.returns = {};
        this.initializeQTable();
    }

    initializeQTable() {
        const states = this.env.getAllStates();
        const actions = this.env.actions;
        
        states.forEach(s => {
            this.qTable[s] = {};
            this.returns[s] = {};
            actions.forEach(a => {
                this.qTable[s][a] = 0;
                this.returns[s][a] = [];
            });
        });
    }

    chooseAction(stateKey) {
        if (Math.random() < this.epsilon) {
            const actions = this.env.getValidActions(stateKey);
            return actions[Math.floor(Math.random() * actions.length)];
        }
        return this.getBestAction(stateKey);
    }

    getBestAction(stateKey) {
        if (!this.qTable[stateKey]) return this.env.actions[0];
        
        const actions = this.env.getValidActions(stateKey);
        let bestAction = actions[0];
        let bestValue = this.qTable[stateKey][bestAction];

        actions.forEach(action => {
            if (this.qTable[stateKey][action] > bestValue) {
                bestValue = this.qTable[stateKey][action];
                bestAction = action;
            }
        });

        return bestAction;
    }

    trainEpisode() {
        const episode = [];
        let currentState = this.env.reset();
        let totalReward = 0;
        const maxSteps = 200;

        for (let step = 0; step < maxSteps; step++) {
            const action = this.chooseAction(currentState);
            const result = this.env.step(action);
            
            episode.push({ state: currentState, action: action, reward: result.reward });
            totalReward += result.reward;
            currentState = result.state;

            if (result.done) break;
        }

        let G = 0;
        for (let t = episode.length - 1; t >= 0; t--) {
            const { state, action, reward } = episode[t];
            G = this.gamma * G + reward;

            if (!this.returns[state]) this.returns[state] = {};
            if (!this.returns[state][action]) this.returns[state][action] = [];
            
            this.returns[state][action].push(G);
            
            if (!this.qTable[state]) this.qTable[state] = {};
            const returns = this.returns[state][action];
            this.qTable[state][action] = returns.reduce((a, b) => a + b, 0) / returns.length;
        }

        return totalReward;
    }

    getValues() {
        const values = {};
        Object.keys(this.qTable).forEach(stateKey => {
            const actions = Object.keys(this.qTable[stateKey]);
            if (actions.length > 0) {
                values[stateKey] = Math.max(...actions.map(a => this.qTable[stateKey][a]));
            }
        });
        return values;
    }

    getPolicy() {
        const policy = {};
        Object.keys(this.qTable).forEach(stateKey => {
            policy[stateKey] = this.getBestAction(stateKey);
        });
        return policy;
    }
}

class TDLearning {
    constructor(env, alpha = 0.1, gamma = 0.9) {
        this.env = env;
        this.alpha = alpha;
        this.gamma = gamma;
        this.values = {};
        this.policy = {};
        this.initializeValues();
    }

    initializeValues() {
        const states = this.env.getAllStates();
        states.forEach(s => {
            this.values[s] = 0;
            this.policy[s] = this.env.actions[0];
        });
    }

    trainEpisode() {
        let currentState = this.env.reset();
        let totalReward = 0;
        const maxSteps = 200;

        for (let step = 0; step < maxSteps; step++) {
            const actions = this.env.getValidActions(currentState);
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            const result = this.env.step(action);
            
            const currentValue = this.values[currentState] || 0;
            const nextValue = result.done ? 0 : (this.values[result.state] || 0);
            
            this.values[currentState] = currentValue + this.alpha * (result.reward + this.gamma * nextValue - currentValue);
            
            totalReward += result.reward;
            currentState = result.state;

            if (result.done) break;
        }

        this.updatePolicy();
        return totalReward;
    }

    updatePolicy() {
        const states = this.env.getAllStates();
        states.forEach(stateKey => {
            const actions = this.env.getValidActions(stateKey);
            let bestAction = actions[0];
            let bestValue = -Infinity;

            actions.forEach(action => {
                const value = this.computeActionValue(stateKey, action);
                if (value > bestValue) {
                    bestValue = value;
                    bestAction = action;
                }
            });

            this.policy[stateKey] = bestAction;
        });
    }

    computeActionValue(stateKey, action) {
        const stateParts = stateKey.split(',').map(Number);
        const savedState = [...this.env.currentState];
        
        this.env.currentState = stateParts;
        const result = this.env.step(action);
        this.env.currentState = savedState;

        return result.reward + this.gamma * (this.values[result.state] || 0);
    }

    getValues() {
        return this.values;
    }

    getPolicy() {
        return this.policy;
    }
}

class QLearning {
    constructor(env, alpha = 0.1, gamma = 0.9, epsilon = 0.1) {
        this.env = env;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.qTable = {};
        this.initializeQTable();
    }

    initializeQTable() {
        const states = this.env.getAllStates();
        const actions = this.env.actions;
        
        states.forEach(s => {
            this.qTable[s] = {};
            actions.forEach(a => {
                this.qTable[s][a] = 0;
            });
        });
    }

    chooseAction(stateKey) {
        if (Math.random() < this.epsilon) {
            const actions = this.env.getValidActions(stateKey);
            return actions[Math.floor(Math.random() * actions.length)];
        } else {
            return this.getBestAction(stateKey);
        }
    }

    getBestAction(stateKey) {
        if (!this.qTable[stateKey]) return this.env.actions[0];
        
        const actions = this.env.getValidActions(stateKey);
        let bestAction = actions[0];
        let bestValue = this.qTable[stateKey][bestAction];

        actions.forEach(action => {
            if (this.qTable[stateKey][action] > bestValue) {
                bestValue = this.qTable[stateKey][action];
                bestAction = action;
            }
        });

        return bestAction;
    }

    update(stateKey, action, reward, nextState, done) {
        if (!this.qTable[stateKey]) this.qTable[stateKey] = {};
        if (!this.qTable[stateKey][action]) this.qTable[stateKey][action] = 0;

        const currentQ = this.qTable[stateKey][action];
        let maxNextQ = 0;

        if (!done && this.qTable[nextState]) {
            const nextActions = this.env.getValidActions(nextState);
            maxNextQ = Math.max(...nextActions.map(a => this.qTable[nextState][a] || 0));
        }

        const newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);
        this.qTable[stateKey][action] = newQ;
    }

    trainEpisode() {
        let currentState = this.env.reset();
        let totalReward = 0;
        let steps = 0;
        const maxSteps = 200;

        while (steps < maxSteps) {
            const action = this.chooseAction(currentState);
            const result = this.env.step(action);
            
            this.update(currentState, action, result.reward, result.state, result.done);
            
            totalReward += result.reward;
            currentState = result.state;
            steps++;

            if (result.done) break;
        }

        return totalReward;
    }

    getValues() {
        const values = {};
        Object.keys(this.qTable).forEach(stateKey => {
            const actions = Object.keys(this.qTable[stateKey]);
            if (actions.length > 0) {
                values[stateKey] = Math.max(...actions.map(a => this.qTable[stateKey][a]));
            }
        });
        return values;
    }

    getPolicy() {
        const policy = {};
        Object.keys(this.qTable).forEach(stateKey => {
            policy[stateKey] = this.getBestAction(stateKey);
        });
        return policy;
    }
}

class SARSA {
    constructor(env, alpha = 0.1, gamma = 0.9, epsilon = 0.1) {
        this.env = env;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.qTable = {};
        this.initializeQTable();
    }

    initializeQTable() {
        const states = this.env.getAllStates();
        const actions = this.env.actions;
        
        states.forEach(s => {
            this.qTable[s] = {};
            actions.forEach(a => {
                this.qTable[s][a] = 0;
            });
        });
    }

    chooseAction(stateKey) {
        if (Math.random() < this.epsilon) {
            const actions = this.env.getValidActions(stateKey);
            return actions[Math.floor(Math.random() * actions.length)];
        } else {
            return this.getBestAction(stateKey);
        }
    }

    getBestAction(stateKey) {
        if (!this.qTable[stateKey]) return this.env.actions[0];
        
        const actions = this.env.getValidActions(stateKey);
        let bestAction = actions[0];
        let bestValue = this.qTable[stateKey][bestAction];

        actions.forEach(action => {
            if (this.qTable[stateKey][action] > bestValue) {
                bestValue = this.qTable[stateKey][action];
                bestAction = action;
            }
        });

        return bestAction;
    }

    trainEpisode() {
        let currentState = this.env.reset();
        let action = this.chooseAction(currentState);
        let totalReward = 0;
        let steps = 0;
        const maxSteps = 200;

        while (steps < maxSteps) {
            const result = this.env.step(action);
            const nextAction = this.chooseAction(result.state);

            if (!this.qTable[currentState]) this.qTable[currentState] = {};
            if (!this.qTable[currentState][action]) this.qTable[currentState][action] = 0;

            const currentQ = this.qTable[currentState][action];
            const nextQ = result.done ? 0 : (this.qTable[result.state] && this.qTable[result.state][nextAction] ? this.qTable[result.state][nextAction] : 0);

            const newQ = currentQ + this.alpha * (result.reward + this.gamma * nextQ - currentQ);
            this.qTable[currentState][action] = newQ;

            totalReward += result.reward;
            currentState = result.state;
            action = nextAction;
            steps++;

            if (result.done) break;
        }

        return totalReward;
    }

    getValues() {
        const values = {};
        Object.keys(this.qTable).forEach(stateKey => {
            const actions = Object.keys(this.qTable[stateKey]);
            if (actions.length > 0) {
                values[stateKey] = Math.max(...actions.map(a => this.qTable[stateKey][a]));
            }
        });
        return values;
    }

    getPolicy() {
        const policy = {};
        Object.keys(this.qTable).forEach(stateKey => {
            policy[stateKey] = this.getBestAction(stateKey);
        });
        return policy;
    }
}