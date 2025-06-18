// 获取DOM元素
const liquid = document.getElementById('liquid');
const object = document.getElementById('object');
const densitySlider = document.getElementById('densitySlider');
const objectDensitySlider = document.getElementById('objectDensitySlider');
const densityValue = document.getElementById('densityValue');
const objectDensityValue = document.getElementById('objectDensityValue');
const buoyancyValue = document.getElementById('buoyancyValue');
const volumeValue = document.getElementById('volumeValue');
const statusValue = document.getElementById('statusValue');
const resetBtn = document.getElementById('resetBtn');

// 物理常量
const gravity = 9.8; // m/s²
const objectVolume = 100; // cm³
let liquidDensity = 1.0; // g/cm³ (水)
let objectDensity = 0.8; // g/cm³ (小于水密度)

// 初始化图表
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '浮力 (N)',
            data: [],
            borderColor: 'blue',
            fill: false
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: '液体密度 (g/cm³)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: '浮力 (N)'
                }
            }
        }
    }
});

// 更新液体颜色（基于密度）
function updateLiquidColor(density) {
    // 密度越高颜色越深
    const blueValue = Math.min(255, Math.floor(150 + density * 50));
    liquid.style.background = `linear-gradient(to top, rgb(52, 152, ${blueValue}), rgb(41, 128, ${blueValue - 30}))`;
}

// 计算浮力并更新物体位置
function calculateBuoyancy() {
    // 阿基米德原理：F = ρ * g * V
    const buoyancyForce = (liquidDensity / 1000) * gravity * (objectVolume / 1000000); // 转换为N
    
    // 物体重量
    const objectWeight = (objectDensity / 1000) * gravity * (objectVolume / 1000000); // 转换为N
    
    // 确定物体状态
    let status;
    if (objectDensity < liquidDensity) {
        status = "漂浮";
    } else if (objectDensity > liquidDensity) {
        status = "沉底";
    } else {
        status = "悬浮";
    }
    
    // 更新物体位置（简化模拟）
    const liquidHeight = liquid.clientHeight;
    let objectPosition;
    
    if (objectDensity < liquidDensity) {
        // 漂浮：部分露出水面
        const submergedFraction = objectDensity / liquidDensity;
        objectPosition = liquidHeight * (1 - submergedFraction);
    } else if (objectDensity > liquidDensity) {
        // 沉底
        objectPosition = 0;
    } else {
        // 悬浮
        objectPosition = liquidHeight / 2;
    }
    
    object.style.bottom = `${objectPosition}px`;
    
    // 更新显示
    buoyancyValue.textContent = buoyancyForce.toFixed(4);
    volumeValue.textContent = (objectVolume * Math.min(1, objectDensity / liquidDensity)).toFixed(2);
    statusValue.textContent = status;
    
    // 更新图表（仅当改变密度时）
    return buoyancyForce;
}

// 初始化
function init() {
    updateLiquidColor(liquidDensity);
    calculateBuoyancy();
    
    // 事件监听
    densitySlider.addEventListener('input', () => {
        liquidDensity = parseFloat(densitySlider.value);
        densityValue.textContent = liquidDensity.toFixed(1);
        updateLiquidColor(liquidDensity);
        
        // 更新图表
        const buoyancy = calculateBuoyancy();
        updateChart(liquidDensity, buoyancy);
    });
    
    objectDensitySlider.addEventListener('input', () => {
        objectDensity = parseFloat(objectDensitySlider.value);
        objectDensityValue.textContent = objectDensity.toFixed(1);
        calculateBuoyancy();
    });
    
    resetBtn.addEventListener('click', () => {
        densitySlider.value = 1.0;
        objectDensitySlider.value = 0.8;
        liquidDensity = 1.0;
        objectDensity = 0.8;
        densityValue.textContent = '1.0';
        objectDensityValue.textContent = '0.8';
        updateLiquidColor(liquidDensity);
        calculateBuoyancy();
        resetChart();
    });
}

// 更新图表
function updateChart(density, buoyancy) {
    chart.data.labels.push(density.toFixed(1));
    chart.data.datasets[0].data.push(buoyancy);
    
    // 限制最多显示10个数据点
    if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    chart.update();
}

// 重置图表
function resetChart() {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
}

// 启动应用
window.onload = init;