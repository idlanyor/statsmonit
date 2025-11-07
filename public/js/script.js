const socket = io();
let cpuChart, ramChart, diskChart, cpuTimelineChart, memoryTimelineChart, networkTimelineChart, heapChart;
let isConnected = false;
let isDarkTheme = true; // Default to dark theme
let updateInterval = 3000;

// Initialize theme on load
function initializeTheme() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('statsmonit-theme') || 'dark';
    isDarkTheme = savedTheme === 'dark';

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update theme toggle icon
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    if (isDarkTheme) {
        icon.className = 'fas fa-moon text-yellow-400 text-sm sm:text-base';
        themeToggle.title = 'Switch to Light Mode';
    } else {
        icon.className = 'fas fa-sun text-yellow-400 text-sm sm:text-base';
        themeToggle.title = 'Switch to Dark Mode';
    }
}

// Enhanced theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        const newTheme = isDarkTheme ? 'dark' : 'light';

        // Apply theme transition
        document.documentElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        document.documentElement.setAttribute('data-theme', newTheme);

        // Save preference
        localStorage.setItem('statsmonit-theme', newTheme);

        // Update icon
        updateThemeIcon();

        // Show notification
        showToast(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info', 2000);

        // Remove transition after animation
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    });
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas ${getToastIcon(type)} text-lg"></i>
            <div class="flex-1">
                <p class="font-medium">${message}</p>
            </div>
            <button onclick="removeToast(this)" class="text-secondary hover:text-primary">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Trigger show animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => removeToast(toast), duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function removeToast(element) {
    const toast = element.closest ? element.closest('.toast') : element;
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
}

// Loading screen management
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hide');
    setTimeout(() => loadingScreen.style.display = 'none', 500);
}
function initFullscreenToggle() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const icon = fullscreenToggle.querySelector('i');
    
    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                icon.className = 'fas fa-compress text-gray-400';
                showToast('Entered fullscreen mode', 'info', 2000);
            });
        } else {
            document.exitFullscreen().then(() => {
                icon.className = 'fas fa-expand text-gray-400';
                showToast('Exited fullscreen mode', 'info', 2000);
            });
        }
    });
}

// Settings functionality
function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    
    settingsBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Dashboard Settings',
            html: `
                <div class="text-left space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Update Interval (ms)</label>
                        <input type="number" id="update-interval" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                               value="${updateInterval}" min="1000" max="10000" step="500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Notifications</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="high-cpu-alert" class="mr-2" checked>
                                Alert on high CPU usage (>80%)
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="high-memory-alert" class="mr-2" checked>
                                Alert on high memory usage (>85%)
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="high-temp-alert" class="mr-2" checked>
                                Alert on high temperature (>70°C)
                            </label>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Settings',
            cancelButtonText: 'Cancel',
            didOpen: () => {
                // Load saved preferences
                const savedSettings = localStorage.getItem('statsmonit-settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    document.getElementById('update-interval').value = settings.updateInterval || updateInterval;
                    document.getElementById('high-cpu-alert').checked = settings.highCpuAlert !== false;
                    document.getElementById('high-memory-alert').checked = settings.highMemoryAlert !== false;
                    document.getElementById('high-temp-alert').checked = settings.highTempAlert !== false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Save settings
                const settings = {
                    updateInterval: parseInt(document.getElementById('update-interval').value),
                    highCpuAlert: document.getElementById('high-cpu-alert').checked,
                    highMemoryAlert: document.getElementById('high-memory-alert').checked,
                    highTempAlert: document.getElementById('high-temp-alert').checked
                };
                
                localStorage.setItem('statsmonit-settings', JSON.stringify(settings));
                updateInterval = settings.updateInterval;
                
                showToast('Settings saved successfully!', 'success');
            }
        });
    });
}

// Clear history functionality
function initClearHistory() {
    const clearHistoryBtn = document.getElementById('clear-history');
    
    clearHistoryBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Clear History',
            text: 'Are you sure you want to clear all timeline data?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Clear All Data'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear all timeline charts
                clearTimelineData();
                showToast('Timeline data cleared', 'success');
            }
        });
    });
}

function clearTimelineData() {
    if (cpuTimelineChart) {
        cpuTimelineChart.data.labels = [];
        cpuTimelineChart.data.datasets[0].data = [];
        cpuTimelineChart.update();
    }
    
    if (memoryTimelineChart) {
        memoryTimelineChart.data.labels = [];
        memoryTimelineChart.data.datasets[0].data = [];
        memoryTimelineChart.update();
    }
    
    if (networkTimelineChart) {
        networkTimelineChart.data.labels = [];
        networkTimelineChart.data.datasets[0].data = [];
        networkTimelineChart.data.datasets[1].data = [];
        networkTimelineChart.update();
    }
}

function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    };

    const doughnutConfig = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            ...chartOptions,
            cutout: '75%',
            hover: { mode: null },
            elements: { arc: { borderWidth: 0 } }
        }
    };

    // Initialize doughnut charts with improved styling
    cpuChart = new Chart(document.getElementById('cpu-chart').getContext('2d'), {
        ...doughnutConfig,
        data: {
            ...doughnutConfig.data,
            datasets: [{ ...doughnutConfig.data.datasets[0], backgroundColor: ['#3B82F6', '#1F2937'] }]
        }
    });
    cpuChart.originalColor = '#3B82F6';

    ramChart = new Chart(document.getElementById('ram-chart').getContext('2d'), {
        ...doughnutConfig,
        data: {
            ...doughnutConfig.data,
            datasets: [{ ...doughnutConfig.data.datasets[0], backgroundColor: ['#10B981', '#1F2937'] }]
        }
    });
    ramChart.originalColor = '#10B981';

    diskChart = new Chart(document.getElementById('disk-chart').getContext('2d'), {
        ...doughnutConfig,
        data: {
            ...doughnutConfig.data,
            datasets: [{ ...doughnutConfig.data.datasets[0], backgroundColor: ['#8B5CF6', '#1F2937'] }]
        }
    });
    diskChart.originalColor = '#8B5CF6';

    // Enhanced timeline charts
    const timelineConfig = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#3B82F6',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxTicksLimit: 8,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            if (typeof label === 'string' && label.includes('T')) {
                                return label.split('T')[1].substr(0, 5);
                            }
                            return label;
                        }
                    }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };

    // CPU Timeline Chart
    cpuTimelineChart = new Chart(document.getElementById('cpu-timeline-chart').getContext('2d'), {
        ...timelineConfig,
        data: {
            ...timelineConfig.data,
            datasets: [{
                ...timelineConfig.data.datasets[0],
                label: 'CPU Usage %',
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                pointBackgroundColor: '#3B82F6'
            }]
        },
        options: {
            ...timelineConfig.options,
            scales: {
                ...timelineConfig.options.scales,
                y: {
                    ...timelineConfig.options.scales.y,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Usage %',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });

    // Memory Timeline Chart
    memoryTimelineChart = new Chart(document.getElementById('memory-timeline-chart').getContext('2d'), {
        ...timelineConfig,
        data: {
            ...timelineConfig.data,
            datasets: [{
                ...timelineConfig.data.datasets[0],
                label: 'Memory Usage %',
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                pointBackgroundColor: '#10B981'
            }]
        },
        options: {
            ...timelineConfig.options,
            scales: {
                ...timelineConfig.options.scales,
                y: {
                    ...timelineConfig.options.scales.y,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Usage %',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });

    // Network Timeline Chart
    networkTimelineChart = new Chart(document.getElementById('network-timeline-chart').getContext('2d'), {
        ...timelineConfig,
        data: {
            ...timelineConfig.data,
            datasets: [
                {
                    label: 'Download',
                    data: [],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#8B5CF6',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Upload',
                    data: [],
                    borderColor: '#EC4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#EC4899',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...timelineConfig.options,
            plugins: {
                ...timelineConfig.options.plugins,
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        boxWidth: 12,
                        padding: 10,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                ...timelineConfig.options.scales,
                y: {
                    ...timelineConfig.options.scales.y,
                    title: {
                        display: true,
                        text: 'Bytes/s',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });

    // Heap Memory Chart
    heapChart = new Chart(document.getElementById('heap-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Used', 'Total'],
            datasets: [{
                label: 'Heap Memory',
                data: [0, 0],
                backgroundColor: [
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(236, 72, 153, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return formatBytes(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatBytes(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateChart(chart, value) {
    const isOverload = value > 80;
    const isCritical = value > 90;
    
    let color = chart.originalColor;
    if (isCritical) {
        color = '#EF4444'; // Red for critical
    } else if (isOverload) {
        color = '#F59E0B'; // Yellow for warning
    }
    
    chart.data.datasets[0].data = [value, 100 - value];
    chart.data.datasets[0].backgroundColor[0] = color;
    chart.update('none'); // Disable animation for real-time updates
}

function updateQuickStats(data) {
    // Update quick stats bar
    document.getElementById('quick-cpu').textContent = data.cpu || '--';
    document.getElementById('quick-ram').textContent = data.ram || '--';
    document.getElementById('quick-disk').textContent = data.disk?.usedPercent || '--';
    document.getElementById('quick-temp').textContent = data.temperature || '--';
}

function updateTemperature(temp) {
    const temperatureElement = document.getElementById('temperature');
    const tempStatusElement = document.getElementById('temp-status');
    const tempProgressElement = document.getElementById('temp-progress');
    const tempStatusTextElement = document.getElementById('temp-status-text');

    if (temp === null || temp === 'N/A') {
        temperatureElement.textContent = 'N/A';
        tempStatusElement.textContent = 'Temperature not available';
        tempProgressElement.style.width = '0%';
        tempStatusTextElement.textContent = 'Unknown';
        return;
    }

    temperatureElement.textContent = temp;

    // Extract numeric value for calculations
    const numericTemp = parseFloat(temp);
    if (!isNaN(numericTemp)) {
        // Update progress bar (assuming max temp of 100°C)
        const progressPercent = Math.min(100, (numericTemp / 100) * 100);
        tempProgressElement.style.width = `${progressPercent}%`;

        // Update status and colors
        temperatureElement.classList.remove('text-yellow-400', 'text-red-500', 'text-green-400');
        
        if (numericTemp < 45) {
            tempStatusElement.textContent = 'Normal';
            tempStatusTextElement.textContent = 'Normal';
            temperatureElement.classList.add('text-green-400');
        } else if (numericTemp < 70) {
            tempStatusElement.textContent = 'Moderate';
            tempStatusTextElement.textContent = 'Moderate';
            temperatureElement.classList.add('text-yellow-400');
        } else {
            tempStatusElement.textContent = 'High';
            tempStatusTextElement.textContent = 'High';
            temperatureElement.classList.add('text-red-500');
            
            // Alert for high temperature
            const settings = JSON.parse(localStorage.getItem('statsmonit-settings') || '{}');
            if (settings.highTempAlert !== false && numericTemp > 70) {
                showToast(`High temperature detected: ${temp}`, 'warning');
            }
        }
    }
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes == 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function updateTimelineCharts(data) {
    const maxDataPoints = 20;
    
    // Update CPU Timeline
    if (data.cpu_history && data.cpu_history.length > 0) {
        const labels = data.cpu_history.slice(-maxDataPoints).map(item => new Date(item.timestamp).toLocaleTimeString());
        const values = data.cpu_history.slice(-maxDataPoints).map(item => item.usage);
        
        cpuTimelineChart.data.labels = labels;
        cpuTimelineChart.data.datasets[0].data = values;
        cpuTimelineChart.update('none');
        
        // Update average
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        document.getElementById('cpu-avg').textContent = `Avg: ${avg.toFixed(1)}%`;
    }

    // Update Memory Timeline
    if (data.memory_history && data.memory_history.length > 0) {
        const labels = data.memory_history.slice(-maxDataPoints).map(item => new Date(item.timestamp).toLocaleTimeString());
        const values = data.memory_history.slice(-maxDataPoints).map(item => item.usage);
        
        memoryTimelineChart.data.labels = labels;
        memoryTimelineChart.data.datasets[0].data = values;
        memoryTimelineChart.update('none');
        
        // Update average
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        document.getElementById('mem-avg').textContent = `Avg: ${avg.toFixed(1)}%`;
    }

    // Update Network Timeline
    if (data.network_history && data.network_history.length > 0) {
        const labels = data.network_history.slice(-maxDataPoints).map(item => new Date(item.timestamp).toLocaleTimeString());
        const downloadData = data.network_history.slice(-maxDataPoints).map(item => item.input);
        const uploadData = data.network_history.slice(-maxDataPoints).map(item => item.output);
        
        networkTimelineChart.data.labels = labels;
        networkTimelineChart.data.datasets[0].data = downloadData;
        networkTimelineChart.data.datasets[1].data = uploadData;
        networkTimelineChart.update('none');
        
        // Update peak
        const maxDown = Math.max(...downloadData);
        const maxUp = Math.max(...uploadData);
        const peak = Math.max(maxDown, maxUp);
        document.getElementById('net-avg').textContent = `Peak: ${formatBytes(peak)}/s`;
    }
}

function updateHeapStats(heapData) {
    if (!heapData) return;

    // Update heap statistics display
    document.getElementById('heap-used').textContent = heapData.heapUsed;
    document.getElementById('heap-total').textContent = heapData.heapTotal;
    document.getElementById('heap-rss').textContent = heapData.rss;
    document.getElementById('heap-external').textContent = heapData.external;

    // Update heap percentage
    document.getElementById('heap-percent').textContent = `Usage: ${heapData.heapUsedPercent}%`;

    // Update heap chart
    heapChart.data.datasets[0].data = [heapData.rawHeapUsed, heapData.rawHeapTotal];
    heapChart.update('none');
}

function updateProcessCount(processData) {
    if (!processData) return;

    document.getElementById('process-count').textContent = processData.all;
    document.getElementById('process-running').textContent = processData.running;
    document.getElementById('process-sleeping').textContent = processData.sleeping;
    document.getElementById('process-blocked').textContent = processData.blocked || 0;
}

function updateFileSystemInfo(fsData) {
    if (!fsData) return;

    // Check if elements exist before updating (they may not exist in new layout)
    const fsTypeElement = document.getElementById('fs-type');
    const fsMountElement = document.getElementById('fs-mount');

    if (fsTypeElement) fsTypeElement.textContent = fsData.type;
    if (fsMountElement) fsMountElement.textContent = fsData.mount;
}

function updateNetworkSpeed(networkSpeedData) {
    if (!networkSpeedData) return;

    document.getElementById('network-download').textContent = networkSpeedData.download;
    document.getElementById('network-upload').textContent = networkSpeedData.upload;

    // Update progress bars with better scaling
    const maxSpeed = 100 * 1024 * 1024; // 100 MB/s as max for display
    const downloadPercent = Math.min(100, (networkSpeedData.downloadRaw / maxSpeed) * 100);
    const uploadPercent = Math.min(100, (networkSpeedData.uploadRaw / maxSpeed) * 100);

    document.getElementById('download-bar').style.width = `${downloadPercent}%`;
    document.getElementById('upload-bar').style.width = `${uploadPercent}%`;
}

// Parse user agent to get browser, OS, and device info
function parseUserAgent(userAgent) {
    const ua = userAgent || navigator.userAgent;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox/')) {
        browser = 'Firefox ' + ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
        browser = 'Chrome ' + ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Edg/')) {
        browser = 'Edge ' + ua.match(/Edg\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        browser = 'Safari ' + ua.match(/Version\/(\d+)/)?.[1] || '';
    }

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Mac OS X')) os = 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, '.') || '');
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
    else if (ua.includes('iOS')) os = 'iOS ' + (ua.match(/OS ([\d_]+)/)?.[1].replace(/_/g, '.') || '');

    // Detect device
    let device = 'Desktop';
    if (ua.includes('Mobile')) device = 'Mobile';
    else if (ua.includes('Tablet')) device = 'Tablet';
    else if (ua.includes('iPad')) device = 'iPad';

    return { browser, os, device };
}

function updateUserInformation(userInfo) {
    if (!userInfo) return;

    // Parse user agent
    const parsedUA = parseUserAgent(userInfo.userAgent);

    // Update browser, device, and OS
    document.getElementById('user-browser').textContent = parsedUA.browser;
    document.getElementById('user-device').textContent = parsedUA.device;
    document.getElementById('user-os').textContent = parsedUA.os;

    // Update IP address
    document.getElementById('user-ip').textContent = userInfo.ipAddress || 'Unknown';

    // Update language
    document.getElementById('user-language').textContent = userInfo.language || 'Unknown';

    // Update connected time
    if (userInfo.connectedAt) {
        const connectedDate = new Date(userInfo.connectedAt);
        const now = new Date();
        const diffMs = now - connectedDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;

        let timeText = '';
        if (diffHours > 0) {
            timeText = `${diffHours}h ${remainingMins}m ago`;
        } else if (diffMins > 0) {
            timeText = `${diffMins}m ago`;
        } else {
            timeText = 'Just now';
        }
        document.getElementById('user-connected').textContent = timeText;
    }

    // Update screen resolution
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    document.getElementById('user-screen').textContent = screenRes;
}

function updateSystemTime(timeData) {
    if (!timeData) return;

    // Check if elements exist before updating (they may not exist in new layout)
    const systemTimeElement = document.getElementById('system-time');
    const systemDateElement = document.getElementById('system-date');
    const timezoneElement = document.getElementById('timezone');

    if (systemTimeElement) systemTimeElement.textContent = timeData.time;
    if (systemDateElement) systemDateElement.textContent = timeData.date;
    if (timezoneElement) timezoneElement.textContent = timeData.timezone;
}

function updateBatteryStatus(batteryData) {
    const batteryCard = document.getElementById('battery-card');

    // Check if battery card exists (it may not exist in new layout)
    if (!batteryCard) return;

    if (!batteryData) {
        batteryCard.style.display = 'none';
        return;
    }

    batteryCard.style.display = 'block';

    const batteryLevelElement = document.getElementById('battery-level');
    const batteryStatusElement = document.getElementById('battery-status');
    const batteryTimeElement = document.getElementById('battery-time');
    const batteryProgressElement = document.getElementById('battery-progress');

    if (batteryLevelElement) {
        batteryLevelElement.textContent = `${batteryData.level}%`;

        // Change color based on battery level
        batteryLevelElement.classList.remove('text-red-400', 'text-yellow-400', 'text-green-400');

        if (batteryData.level <= 20) {
            batteryLevelElement.classList.add('text-red-400');
        } else if (batteryData.level <= 50) {
            batteryLevelElement.classList.add('text-yellow-400');
        } else {
            batteryLevelElement.classList.add('text-green-400');
        }
    }

    if (batteryStatusElement) {
        const status = batteryData.isCharging ? 'Charging' : 'Discharging';
        batteryStatusElement.textContent = status;
    }

    if (batteryTimeElement) {
        if (batteryData.timeLeft > 0) {
            const hours = Math.floor(batteryData.timeLeft / 60);
            const minutes = batteryData.timeLeft % 60;
            batteryTimeElement.textContent = `${hours}h ${minutes}m remaining`;
        } else {
            batteryTimeElement.textContent = '--';
        }
    }

    // Update battery progress bar
    if (batteryProgressElement) {
        batteryProgressElement.style.width = `${batteryData.level}%`;
    }
}

function updateNetworkInterfaces(networkData) {
    const container = document.getElementById('network-interfaces');
    container.innerHTML = '';

    if (!networkData || !Array.isArray(networkData)) return;

    networkData.forEach(interface => {
        const card = document.createElement('div');
        card.className = 'network-interface-card';
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-indigo-300 flex items-center">
                    <i class="fas fa-ethernet text-sm mr-2"></i>
                    ${interface.interface}
                </h4>
                <span class="text-xs text-gray-400">${interface.totalBytes}</span>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">RX:</span>
                    <span class="text-green-300 font-medium">${interface.inputBytes}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">TX:</span>
                    <span class="text-blue-300 font-medium">${interface.outputBytes}</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function updateStats(data) {
    // Update main metrics
    const cpuUsage = parseFloat(data.cpu);
    document.getElementById('cpu-usage').textContent = data.cpu;
    document.getElementById('cpu-usage-center').textContent = data.cpu;
    document.getElementById('cpu-name').textContent = data.cpu_name;
    document.getElementById('cpu-name-small').textContent = data.cpu_name;
    document.getElementById('cpu-cores').textContent = data.cpu_cores;
    updateChart(cpuChart, cpuUsage);

    const ramUsage = parseFloat(data.ram);
    document.getElementById('ram-usage').textContent = data.ram;
    document.getElementById('ram-usage-center').textContent = data.ram;
    document.getElementById('ram-text').textContent = data.ram_text;
    
    // Update RAM progress bar
    document.getElementById('ram-progress').style.width = `${ramUsage}%`;
    updateChart(ramChart, ramUsage);

    const diskUsage = parseFloat(data.disk.usedPercent);
    document.getElementById('disk-usage').textContent = data.disk.usedPercent;
    document.getElementById('disk-usage-center').textContent = data.disk.usedPercent;
    document.getElementById('disk-text').textContent = `${data.disk.used} / ${data.disk.total}`;
    
    // Update disk progress bar
    document.getElementById('disk-progress').style.width = `${diskUsage}%`;
    updateChart(diskChart, diskUsage);

    // System info
    document.getElementById('hostname').textContent = data.hostname;
    document.getElementById('platform').textContent = data.platform;
    document.getElementById('architecture').textContent = data.architecture;
    document.getElementById('uptime').textContent = formatUptime(data.uptime);
    document.getElementById('uptime-small').textContent = `Uptime: ${formatUptime(data.uptime)}`;

    // Load average
    document.getElementById('load-1').textContent = data.load_average[0].toFixed(2);
    document.getElementById('load-5').textContent = data.load_average[1].toFixed(2);
    document.getElementById('load-15').textContent = data.load_average[2].toFixed(2);
    
    // Update load average text
    document.getElementById('cpu-load-text').textContent = 
        `1m: ${data.load_average[0].toFixed(2)} 5m: ${data.load_average[1].toFixed(2)} 15m: ${data.load_average[2].toFixed(2)}`;

    // Update temperature
    updateTemperature(data.temperature);

    // Update quick stats
    updateQuickStats(data);

    // Update all other components
    updateTimelineCharts(data);
    updateHeapStats(data.heap);
    updateProcessCount(data.process_count);
    updateFileSystemInfo(data.file_system_info);
    updateNetworkSpeed(data.network_speed);
    updateSystemTime(data.system_time);
    updateBatteryStatus(data.battery_status);
    updateNetworkInterfaces(data.network);
    updateUserInformation(data.user_info);

    // Check for alerts
    checkAlerts(data);
}

function checkAlerts(data) {
    const settings = JSON.parse(localStorage.getItem('statsmonit-settings') || '{}');
    
    // CPU alert
    if (settings.highCpuAlert !== false) {
        const cpuUsage = parseFloat(data.cpu);
        if (cpuUsage > 80) {
            showToast(`High CPU usage: ${data.cpu}`, cpuUsage > 90 ? 'error' : 'warning');
        }
    }
    
    // Memory alert
    if (settings.highMemoryAlert !== false) {
        const memUsage = parseFloat(data.ram);
        if (memUsage > 85) {
            showToast(`High memory usage: ${data.ram}`, memUsage > 95 ? 'error' : 'warning');
        }
    }
}

function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connection-status');
    const indicator = statusElement.parentElement.querySelector('.status-indicator');
    
    if (connected) {
        statusElement.textContent = 'Connected';
        indicator.className = 'status-indicator indicator-green';
        isConnected = true;
    } else {
        statusElement.textContent = 'Disconnected';
        indicator.className = 'status-indicator indicator-red animate-pulse';
        isConnected = false;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first
    initializeTheme();

    // Initialize charts
    initCharts();

    // Initialize UI components
    initThemeToggle();
    initFullscreenToggle();
    initSettings();
    initClearHistory();

    // Hide loading screen after a short delay
    setTimeout(hideLoadingScreen, 1500);

    // Load saved settings
    const savedSettings = localStorage.getItem('statsmonit-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        updateInterval = settings.updateInterval || updateInterval;
    }
});

// Socket event handlers
socket.on('connect', () => {
    updateConnectionStatus(true);
    showToast('Connected to monitoring service', 'success');
});

socket.on('disconnect', () => {
    updateConnectionStatus(false);
    showToast('Disconnected from monitoring service', 'error');
});

socket.on('stats', (data) => {
    hideLoadingScreen();
    updateStats(data);
});

socket.on('error', (error) => {
    showToast('Connection error occurred', 'error');
    console.error('Socket error:', error);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+F for fullscreen
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('fullscreen-toggle').click();
    }
    
    // Ctrl+T for theme toggle
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('theme-toggle').click();
    }
    
    // Ctrl+, for settings
    if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        document.getElementById('settings-btn').click();
    }
});

// Handle visibility change to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        showToast('Dashboard paused (tab hidden)', 'info', 2000);
    } else {
        showToast('Dashboard resumed', 'info', 2000);
    }
});
