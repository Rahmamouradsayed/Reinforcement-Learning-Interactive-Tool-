//vISUALIZATION 

function drawValueFunction(canvas, values) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const states = Object.keys(values);
    if (states.length === 0) return;

    const vals = Object.values(values);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const range = maxVal - minVal || 1;

    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = Math.min(chartWidth / states.length, 40);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    states.forEach((stateKey, i) => {
        const value = values[stateKey];
        const normalizedHeight = Math.abs(value - minVal) / range * chartHeight;
        const x = padding + i * barWidth + 5;
        const y = canvas.height - padding - normalizedHeight;

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding);
        if (value >= 0) {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#81C784');
        } else {
            gradient.addColorStop(0, '#FF5722');
            gradient.addColorStop(1, '#FF8A65');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 10, normalizedHeight);
        
        // Draw bar border
        ctx.strokeStyle = value >= 0 ? '#388E3C' : '#D84315';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth - 10, normalizedHeight);
    });

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('State Value Function V(s)', canvas.width / 2, 25);
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Value V(s)', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('States', canvas.width / 2, canvas.height - 10);
    
    // Value range labels
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.fillText(maxVal.toFixed(2), padding - 10, padding + 5);
    ctx.fillText('0', padding - 10, canvas.height - padding + 5);
    if (minVal < 0) {
        ctx.fillText(minVal.toFixed(2), padding - 10, canvas.height - padding + 5);
    }
}

function drawRewardChart(canvas, rewardHistory) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rewardHistory.length === 0) return;

    const maxReward = Math.max(...rewardHistory);
    const minReward = Math.min(...rewardHistory);
    const range = maxReward - minReward || 1;

    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    if (rewardHistory.length < 2) return;

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Draw line chart with gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    gradient.addColorStop(0, 'rgba(33, 150, 243, 0.3)');
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.05)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    rewardHistory.forEach((reward, i) => {
        const x = padding + (i / (rewardHistory.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((reward - minReward) / range) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, canvas.height - padding);
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw main line
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();

    rewardHistory.forEach((reward, i) => {
        const x = padding + (i / (rewardHistory.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((reward - minReward) / range) * chartHeight;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw points on the line
    ctx.fillStyle = '#2196F3';
    rewardHistory.forEach((reward, i) => {
        if (i % Math.ceil(rewardHistory.length / 20) === 0 || i === rewardHistory.length - 1) {
            const x = padding + (i / (rewardHistory.length - 1)) * chartWidth;
            const y = canvas.height - padding - ((reward - minReward) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw value label for last point
            if (i === rewardHistory.length - 1) {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(reward.toFixed(1), x + 8, y - 5);
            }
        }
    });

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Training Progress - Reward per Episode', canvas.width / 2, 25);
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Total Reward', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Episode Number', canvas.width / 2, canvas.height - 10);
    
    // Y-axis value labels
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.fillText(maxReward.toFixed(1), padding - 10, padding + 5);
    ctx.fillText(((maxReward + minReward) / 2).toFixed(1), padding - 10, (padding + canvas.height - padding) / 2);
    ctx.fillText(minReward.toFixed(1), padding - 10, canvas.height - padding + 5);
    
    // X-axis value labels
    ctx.textAlign = 'center';
    ctx.fillText('1', padding, canvas.height - padding + 20);
    ctx.fillText(Math.floor(rewardHistory.length / 2).toString(), canvas.width / 2, canvas.height - padding + 20);
    ctx.fillText(rewardHistory.length.toString(), canvas.width - padding, canvas.height - padding + 20);

    // Draw moving average if enough data
    if (rewardHistory.length > 10) {
        const windowSize = Math.min(10, Math.floor(rewardHistory.length / 5));
        const movingAvg = [];
        
        for (let i = 0; i < rewardHistory.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = rewardHistory.slice(start, i + 1);
            const avg = window.reduce((a, b) => a + b, 0) / window.length;
            movingAvg.push(avg);
        }

        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        movingAvg.forEach((avg, i) => {
            const x = padding + (i / (movingAvg.length - 1)) * chartWidth;
            const y = canvas.height - padding - ((avg - minReward) / range) * chartHeight;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
        ctx.setLineDash([]);

        // Legend
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(canvas.width - 150, 45, 20, 3);
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Reward', canvas.width - 125, 50);

        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width - 150, 65);
        ctx.lineTo(canvas.width - 130, 65);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('Moving Avg', canvas.width - 125, 68);
    }
}

// Helper function to get color based on value
function getValueColor(value, maxVal, minVal) {
    const normalized = (value - minVal) / (maxVal - minVal || 1);
    const r = Math.floor(255 * (1 - normalized));
    const g = Math.floor(255 * normalized);
    return `rgb(${r}, ${g}, 100)`;
}

// Export functions for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        drawValueFunction,
        drawRewardChart,
        getValueColor
    };
}