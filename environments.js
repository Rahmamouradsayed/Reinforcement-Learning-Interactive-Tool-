
class GridWorld {
    constructor() {
        this.rows = 5;
        this.cols = 5;
        this.startState = [0, 0];
        this.goalState = [4, 4];
        this.obstacles = [[1, 1], [2, 2], [3, 1]];
        this.currentState = [...this.startState];
        this.actions = ['up', 'down', 'left', 'right'];
    }

    reset() {
        this.currentState = [...this.startState];
        return this.getStateKey(this.currentState);
    }

    getStateKey(stateArr) {
        return `${stateArr[0]},${stateArr[1]}`;
    }

    step(action) {
        let [row, col] = this.currentState;
        let newRow = row, newCol = col;

        if (action === 'up') newRow = Math.max(0, row - 1);
        else if (action === 'down') newRow = Math.min(this.rows - 1, row + 1);
        else if (action === 'left') newCol = Math.max(0, col - 1);
        else if (action === 'right') newCol = Math.min(this.cols - 1, col + 1);

        const isObstacle = this.obstacles.some(obs => obs[0] === newRow && obs[1] === newCol);
        if (!isObstacle) {
            this.currentState = [newRow, newCol];
        }

        const isGoal = this.currentState[0] === this.goalState[0] && this.currentState[1] === this.goalState[1];
        const reward = isGoal ? 10 : -0.1;
        const done = isGoal;

        return {
            state: this.getStateKey(this.currentState),
            reward: reward,
            done: done
        };
    }

    getAllStates() {
        const states = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                states.push(this.getStateKey([r, c]));
            }
        }
        return states;
    }

    getValidActions(stateKey) {
        return this.actions;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        const cellSize = canvas.width / this.cols;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * cellSize;
                const y = r * cellSize;
                const isObs = this.obstacles.some(obs => obs[0] === r && obs[1] === c);

                if (isObs) {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(x, y, cellSize, cellSize);
                } else if (r === this.goalState[0] && c === this.goalState[1]) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(x, y, cellSize, cellSize);
                } else {
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }

                ctx.strokeStyle = '#999';
                ctx.strokeRect(x, y, cellSize, cellSize);

                
                const stateKey = this.getStateKey([r, c]);
                if (window.state && window.state.values && window.state.values[stateKey] !== undefined && !isObs) {
                    ctx.fillStyle = '#333';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(window.state.values[stateKey].toFixed(1), x + cellSize/2, y + 15);
                }
            }
        }
        // Draw Agent
        const [ar, ac] = this.currentState;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(ac * cellSize + cellSize/2, ar * cellSize + cellSize/2, cellSize/3, 0, Math.PI*2);
        ctx.fill();
    }
}

class MountainCar {
    constructor() {
        this.actions = ['left', 'none', 'right'];
        this.reset();
    }

    reset() {
        this.position = -0.5;
        this.velocity = 0;
        this.currentStep = 0;
        this.maxSteps = 200;
        return this.getStateKey();
    }

    getStateKey() {
        const posBin = Math.floor((this.position + 1.2) * 10);
        const velBin = Math.floor((this.velocity + 0.07) * 100);
        return `${posBin},${velBin}`;
    }

    step(action) {
        let force = 0;
        if (action === 'left') force = -1;
        else if (action === 'right') force = 1;

        this.velocity += 0.001 * force - 0.0025 * Math.cos(3 * this.position);
        this.velocity = Math.max(-0.07, Math.min(0.07, this.velocity));
        this.position += this.velocity;
        this.position = Math.max(-1.2, Math.min(0.6, this.position));

        if (this.position === -1.2 && this.velocity < 0) this.velocity = 0;

        this.currentStep++;
        const done = this.position >= 0.5 || this.currentStep >= this.maxSteps;
        const reward = this.position >= 0.5 ? 0 : -1;

        return { state: this.getStateKey(), reward, done };
    }

    getAllStates() { return []; }
    getValidActions() { return this.actions; }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const p = (x / canvas.width) * 1.8 - 1.2;
            const y = 150 - Math.sin(3 * p) * 50;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const carX = (this.position + 1.2) / 1.8 * canvas.width;
        const carY = 150 - Math.sin(3 * this.position) * 50;
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(carX - 10, carY - 5, 20, 10);
    }
}