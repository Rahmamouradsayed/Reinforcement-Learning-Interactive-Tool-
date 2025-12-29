
const ENV_ALGO_MAP = {
    'gridworld': ['value-iteration', 'policy-iteration', 'monte-carlo', 'td', 'sarsa', 'q-learning'],
    'mountaincar': ['monte-carlo', 'td', 'sarsa', 'q-learning'],
};

//algorithm-Parameter Map
const ALGO_PARAMS_MAP = {
    'value-iteration': ['gamma'],
    'policy-iteration': ['gamma'],
    'monte-carlo': ['gamma', 'epsilon', 'episodes'],
    'td': ['alpha', 'gamma', 'episodes'],
    'sarsa': ['alpha', 'gamma', 'epsilon', 'episodes'],
    'q-learning': ['alpha', 'gamma', 'epsilon', 'episodes']
};

//defult values
let state = {
    environment: null,
    algorithm: null,
    params: {
        gamma: 0.9,
        alpha: 0.1,
        epsilon: 0.1,
        nsteps: 3,
        episodes: 100
    },
    training: false,
    episodeCount: 0,
    stepCount: 0,
    totalReward: 0,
    rewardHistory: [],
    values: {},
    policy: {},
    qTable: {}
};

window.state = state;

document.addEventListener('DOMContentLoaded', () => {
    console.log('RL Learning Tool Initialized');
    state.environment = new GridWorld();
    state.algorithm = new ValueIteration(state.environment, state.params.gamma);

    state.environment.draw(document.getElementById('env-canvas'));

    setupParameterListeners();
    setupControlListeners();
    setupAlgorithmSelector();
    
    //initialize UI
    updateAlgorithmInfo('value-iteration');
    updateAlgorithmOptions('gridworld');
    updateParameterVisibility('value-iteration');
    updateStats();
    
    console.log('%c RL Learning Tool', 'color: #667eea; font-size: 24px; font-weight: bold;');
    console.log('%c✓ All systems ready', 'color: #4CAF50; font-size: 14px;');
});

function updateAlgorithmOptions(envType) {
    const algoSelect = document.getElementById('algorithm');
    const allOptions = algoSelect.querySelectorAll('option');
    const compatibleAlgos = ENV_ALGO_MAP[envType];
    
    // Reset to first compatible option
    let firstCompatible = null;
    
    allOptions.forEach(option => {
        const algoValue = option.value;
        if (compatibleAlgos.includes(algoValue)) {
            option.disabled = false;
            option.style.display = 'block';
            if (!firstCompatible) firstCompatible = algoValue;
        } else {
            option.disabled = true;
            option.style.display = 'none';
        }
    });
    
    if (firstCompatible) {
        algoSelect.value = firstCompatible;
        updateAlgorithmInfo(firstCompatible);
        updateParameterVisibility(firstCompatible);
    }
    
    showCompatibilityMessage(envType);
}

function updateParameterVisibility(algoType) {
    const requiredParams = ALGO_PARAMS_MAP[algoType];
    const allParams = ['gamma', 'alpha', 'epsilon', 'nsteps', 'episodes'];
    
    allParams.forEach(param => {
        const container = document.querySelector(`[data-param="${param}"]`);
        if (container) {
            if (requiredParams.includes(param)) {
                container.style.display = 'block';
                container.classList.remove('param-disabled');
                container.classList.add('param-enabled');
            } else {
                container.style.display = 'none';
                container.classList.add('param-disabled');
                container.classList.remove('param-enabled');
            }
        }
    });
    
    //parameter explin
    showParameterExplanation(algoType, requiredParams);
}

function showCompatibilityMessage(envType) {
    const messageDiv = document.getElementById('compatibility-message');
    if (!messageDiv) return;
    
    const envNames = {
        'gridworld': 'GridWorld',
        'mountaincar': 'MountainCar'
    };
    
    const algoCount = ENV_ALGO_MAP[envType].length;
    messageDiv.innerHTML = `
        <div class="info-box">
            <strong> ${envNames[envType]}</strong> supports <strong>${algoCount} algorithms</strong>
        </div>
    `;
    messageDiv.style.display = 'block';
}

function showParameterExplanation(algoType, params) {
    const explanationDiv = document.getElementById('param-explanation');
    if (!explanationDiv) return;
    
    const paramNames = {
        'gamma': 'Discount Factor (γ) - Future reward importance',
        'alpha': 'Learning Rate (α) - Step size for updates',
        'epsilon': 'Epsilon (ε) - Exploration vs exploitation',
        'nsteps': 'N-Steps - Lookahead steps',
        'episodes': 'Episodes - Training iterations'
    };
    
    const paramList = params.map(p => `<li>${paramNames[p]}</li>`).join('');
    
    explanationDiv.innerHTML = `
        <div class="param-info-box">
            <strong>Active Parameters:</strong>
            <ul>${paramList}</ul>
        </div>
    `;
    explanationDiv.style.display = 'block';
}

function setupParameterListeners() {
    //gamma(discount Factor)
    document.getElementById('gamma').addEventListener('input', (e) => {
        state.params.gamma = parseFloat(e.target.value);
        document.getElementById('gamma-value').textContent = e.target.value;
        reinitializeAlgorithm();
    });
    
    //alpha(learning Rate)
    document.getElementById('alpha').addEventListener('input', (e) => {
        state.params.alpha = parseFloat(e.target.value);
        document.getElementById('alpha-value').textContent = e.target.value;
        reinitializeAlgorithm();
    });
    
    //epsilon(Exploration Rate)
    document.getElementById('epsilon').addEventListener('input', (e) => {
        state.params.epsilon = parseFloat(e.target.value);
        document.getElementById('epsilon-value').textContent = e.target.value;
        reinitializeAlgorithm();
    });
    
    //N-Steps
    document.getElementById('nsteps').addEventListener('input', (e) => {
        state.params.nsteps = parseInt(e.target.value);
        document.getElementById('nsteps-value').textContent = e.target.value;
        reinitializeAlgorithm();
    });
    
    //Episodes
    document.getElementById('episodes').addEventListener('input', (e) => {
        state.params.episodes = parseInt(e.target.value);
        document.getElementById('episodes-value').textContent = e.target.value;
    });
}

function setupControlListeners() {
    //environment select
    document.getElementById('environment').addEventListener('change', (e) => {
        state.environment = initializeEnvironment(e.target.value);
        updateAlgorithmOptions(e.target.value);
        reinitializeAlgorithm();
        resetEnvironment();
    });
    
    //algorithm select
    document.getElementById('algorithm').addEventListener('change', (e) => {
        updateParameterVisibility(e.target.value);
        reinitializeAlgorithm();
        updateAlgorithmInfo(e.target.value);
        resetEnvironment();
    });
    
    document.getElementById('train-btn').addEventListener('click', trainAgent);
    document.getElementById('run-btn').addEventListener('click', runPolicy);
    document.getElementById('step-btn').addEventListener('click', stepAgent);
    document.getElementById('reset-btn').addEventListener('click', resetEnvironment);
}

function setupAlgorithmSelector() {
    const algoSelect = document.getElementById('algorithm');
    algoSelect.addEventListener('change', (e) => {
        updateAlgorithmInfo(e.target.value);
    });
}

function initializeEnvironment(envType) {
    switch(envType) {
        case 'gridworld':
            return new GridWorld();
        case 'mountaincar':
            return new MountainCar();
        default:
            return new GridWorld();
    }
}

function initializeAlgorithm(algoType, env) {
    const { gamma, alpha, epsilon, nsteps } = state.params;
    
    switch(algoType) {
        case 'value-iteration':
            return new ValueIteration(env, gamma);
        case 'policy-iteration':
            return new PolicyIteration(env, gamma);
        case 'monte-carlo':
            return new MonteCarlo(env, gamma, epsilon);
        case 'td':
            return new TDLearning(env, alpha, gamma);
        case 'sarsa':
            return new SARSA(env, alpha, gamma, epsilon);
        case 'q-learning':
            return new QLearning(env, alpha, gamma, epsilon);
        default:
            return new ValueIteration(env, gamma);
    }
}

function reinitializeAlgorithm() {
    const algoType = document.getElementById('algorithm').value;
    state.algorithm = initializeAlgorithm(algoType, state.environment);
}

function updateAlgorithmInfo(algoType) {
    const infoDiv = document.getElementById('algorithm-info');
    const descriptions = {
        'value-iteration': `
            <p><strong>Value Iteration</strong></p>
            <p><strong>Equation:</strong> V(s) = max<sub>a</sub>[R(s,a) + γV(s')]</p>
            <p><strong>Method:</strong> Dynamic Programming - iteratively updates value for each state.</p>
            <p><strong>Best for:</strong> GridWorld, FrozenLake (small discrete spaces).</p>
            <p><strong>Expected:</strong> Fast convergence, stable values, clear policy arrows.</p>
            <p><strong>Parameters Used:</strong> Only Gamma (γ)</p>
        `,
        
        'policy-iteration': `
            <p><strong>Policy Iteration</strong></p>
            <p><strong>Equations:</strong><br>
            1. Evaluation: V(s) = R(s,π(s)) + γV(s')<br>
            2. Improvement: π(s) = argmax<sub>a</sub>[R(s,a) + γV(s')]</p>
            <p><strong>Method:</strong> Alternates between policy evaluation and improvement.</p>
            <p><strong>Best for:</strong> GridWorld, FrozenLake.</p>
            <p><strong>Expected:</strong> Fewer iterations than Value Iteration, stable convergence.</p>
            <p><strong>Parameters Used:</strong> Only Gamma (γ)</p>
        `,
        
        'monte-carlo': `
            <p><strong>Monte Carlo (MC)</strong></p>
            <p><strong>Equations:</strong><br>
            G = r₁ + γr₂ + γ²r₃ + ...<br>
            V(s) = V(s) + α[G - V(s)]</p>
            <p><strong>Method:</strong> Learns from complete episodes by averaging returns.</p>
            <p><strong>Best for:</strong> Episodic tasks (GridWorld, FrozenLake, CartPole).</p>
            <p><strong>Expected:</strong> High variance initially, then stabilizes. Needs many episodes.</p>
            <p><strong>Parameters Used:</strong> Gamma (γ), Epsilon (ε), Episodes</p>
        `,
        
        'td': `
            <p><strong>Temporal Difference (TD)</strong></p>
            <p><strong>Equation:</strong> V(s) = V(s) + α[r + γV(s') - V(s)]</p>
            <p><strong>Method:</strong> Bootstrapping - updates after each step.</p>
            <p><strong>Best for:</strong> All environments, especially continuous tasks.</p>
            <p><strong>Expected:</strong> Fast initial learning, smooth reward curve.</p>
            <p><strong>Parameters Used:</strong> Alpha (α), Gamma (γ), Episodes</p>
        `,
        
        'sarsa': `
            <p><strong>SARSA (On-Policy)</strong></p>
            <p><strong>Equation:</strong> Q(s,a) = Q(s,a) + α[r + γQ(s',a') - Q(s,a)]</p>
            <p><strong>Method:</strong> On-policy - learns from actions actually taken.</p>
            <p><strong>Best for:</strong> All environments, safe exploration (FrozenLake).</p>
            <p><strong>Expected:</strong> More stable than Q-Learning, conservative policy.</p>
            <p><strong>Parameters Used:</strong> Alpha (α), Gamma (γ), Epsilon (ε), Episodes</p>
        `,
        
        'q-learning': `
            <p><strong>Q-Learning (Off-Policy)</strong></p>
            <p><strong>Equation:</strong> Q(s,a) = Q(s,a) + α[r + γ max<sub>a'</sub>Q(s',a') - Q(s,a)]</p>
            <p><strong>Method:</strong> Off-policy - learns optimal policy while exploring.</p>
            <p><strong>Best for:</strong> All environments. Most popular RL algorithm.</p>
            <p><strong>Expected:</strong> Noisy initially (exploration), converges to optimal.</p>
            <p><strong>Parameters Used:</strong> Alpha (α), Gamma (γ), Epsilon (ε), Episodes</p>
        `
    };
    
    infoDiv.innerHTML = descriptions[algoType] || descriptions['value-iteration'];
}

async function trainAgent() {
    if (state.training) return;
    
    state.training = true;
    document.getElementById('status').textContent = 'Training...';
    document.getElementById('train-btn').disabled = true;
    document.getElementById('train-btn').textContent = 'Training...';
    
    state.rewardHistory = [];
    state.episodeCount = 0;
    state.totalReward = 0;
    
    const algoType = document.getElementById('algorithm').value;
    
    try {
        if (algoType === 'value-iteration' || algoType === 'policy-iteration' || algoType === 'policy-evaluation') {
            // DP algorithms
            const result = state.algorithm.train(50);
            state.values = result.values;
            state.policy = result.policy;
            state.episodeCount = 50;
            
            updateStats();
            state.environment.draw(document.getElementById('env-canvas'));
            drawValueFunction(document.getElementById('value-canvas'), state.values);
            
        } else {
            for (let i = 0; i < state.params.episodes; i++) {
                const reward = state.algorithm.trainEpisode();
                state.rewardHistory.push(reward);
                state.episodeCount = i + 1;
                state.totalReward = reward;
            
                if (i % 5 === 0 || i === state.params.episodes - 1) {
                    state.values = state.algorithm.getValues();
                    state.policy = state.algorithm.getPolicy();
                    
                    updateStats();
                    state.environment.draw(document.getElementById('env-canvas'));
                    drawValueFunction(document.getElementById('value-canvas'), state.values);
                    drawRewardChart(document.getElementById('reward-canvas'), state.rewardHistory);
                    
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            state.values = state.algorithm.getValues();
            state.policy = state.algorithm.getPolicy();
        }
        
        updateStats();
        state.environment.draw(document.getElementById('env-canvas'));
        drawValueFunction(document.getElementById('value-canvas'), state.values);
        if (state.rewardHistory.length > 0) {
            drawRewardChart(document.getElementById('reward-canvas'), state.rewardHistory);
        }
        
        document.getElementById('status').textContent = 'Training Complete ✓';
        document.getElementById('status').style.color = '#4CAF50';
        
    } catch (error) {
        console.error('Training error:', error);
        document.getElementById('status').textContent = 'Training Error ✗';
        document.getElementById('status').style.color = '#f44336';
    }
    
    state.training = false;
    document.getElementById('train-btn').disabled = false;
    document.getElementById('train-btn').textContent = 'Train Agent';
}

async function runPolicy() {
    if (state.training || !state.policy || Object.keys(state.policy).length === 0) {
        alert('Please train the agent first!');
        return;
    }
    
    document.getElementById('status').textContent = 'Running Policy...';
    document.getElementById('status').style.color = '#2196F3';
    
    state.environment.reset();
    state.stepCount = 0;
    state.totalReward = 0;
    
    for (let step = 0; step < 100; step++) {
        const currentStateKey = state.environment.getStateKey 
            ? state.environment.getStateKey(state.environment.currentState)
            : state.environment.getStateKey();
        
        const action = state.policy[currentStateKey];
        
        if (!action) break;
        
        const result = state.environment.step(action);
        state.totalReward += result.reward;
        state.stepCount++;
        
        updateStats();
        state.environment.draw(document.getElementById('env-canvas'));
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (result.done) break;
    }
    
    document.getElementById('status').textContent = 'Policy Run Complete ✓';
    document.getElementById('status').style.color = '#4CAF50';
}

function stepAgent() {
    if (state.training) return;
    
    const currentStateKey = state.environment.getStateKey 
        ? state.environment.getStateKey(state.environment.currentState)
        : state.environment.getStateKey();
    
    const action = state.policy[currentStateKey] || state.environment.actions[0];
    
    const result = state.environment.step(action);
    state.totalReward += result.reward;
    state.stepCount++;
    
    updateStats();
    state.environment.draw(document.getElementById('env-canvas'));
    
    if (result.done) {
        document.getElementById('status').textContent = 'Episode Complete ✓';
        document.getElementById('status').style.color = '#4CAF50';
    }
}

function resetEnvironment() {
    state.training = false;
    state.episodeCount = 0;
    state.stepCount = 0;
    state.totalReward = 0;
    state.rewardHistory = [];
    state.values = {};
    state.policy = {};
    
    const envType = document.getElementById('environment').value;
    state.environment = initializeEnvironment(envType);
    reinitializeAlgorithm();
    
    updateStats();
    state.environment.draw(document.getElementById('env-canvas'));
    drawValueFunction(document.getElementById('value-canvas'), {});
    drawRewardChart(document.getElementById('reward-canvas'), []);
    
    document.getElementById('status').textContent = 'Ready';
    document.getElementById('status').style.color = '#667eea';
    document.getElementById('train-btn').disabled = false;
    document.getElementById('train-btn').textContent = 'Train Agent';
}

function updateStats() {
    document.getElementById('episode-count').textContent = state.episodeCount;
    document.getElementById('step-count').textContent = state.stepCount;
    document.getElementById('total-reward').textContent = state.totalReward.toFixed(2);
}