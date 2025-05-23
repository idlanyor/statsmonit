      const socket = io();
      let cpuChart, ramChart, diskChart, cpuTimelineChart, memoryTimelineChart, networkTimelineChart, heapChart;

      function initCharts() {
          const doughnutConfig = {
              type: 'doughnut',
              data: {
                  datasets: [{
                      data: [0, 100],
                      borderWidth: 0
                  }]
              },
              options: {
                  cutout: '80%',
                  responsive: true,
                  maintainAspectRatio: false,
                  tooltips: { enabled: false },
                  hover: { mode: null },
                  elements: { arc: { borderWidth: 0 } }
              }
          };

          // Initialize doughnut charts
          cpuChart = new Chart(document.getElementById('cpu-chart').getContext('2d'), {
              ...doughnutConfig,
              data: {
                  ...doughnutConfig.data,
                  datasets: [{...doughnutConfig.data.datasets[0], backgroundColor: ['#3B82F6', '#1F2937']}]
          }});
          cpuChart.originalColor = '#3B82F6';

          ramChart = new Chart(document.getElementById('ram-chart').getContext('2d'), {
              ...doughnutConfig,
              data: {
                  ...doughnutConfig.data,
                  datasets: [{...doughnutConfig.data.datasets[0], backgroundColor: ['#10B981', '#1F2937']}]
              }
          });
          ramChart.originalColor = '#10B981';

          diskChart = new Chart(document.getElementById('disk-chart').getContext('2d'), {
              ...doughnutConfig,
              data: {
                  ...doughnutConfig.data,
                  datasets: [{...doughnutConfig.data.datasets[0], backgroundColor: ['#8B5CF6', '#1F2937']}]
              }
          });
          diskChart.originalColor = '#8B5CF6';

          // Initialize timeline charts
          const timelineConfig = {
              type: 'line',
              data: {
                  labels: [],
                  datasets: [{
                      data: [],
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 2,
                      pointRadius: 2,
                      pointBackgroundColor: '#3B82F6',
                      fill: true,
                      tension: 0.4
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      x: {
                          grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                              color: 'rgba(255, 255, 255, 0.7)',
                              maxRotation: 0,
                              callback: function(value, index, values) {
                                  // Show fewer x-axis labels for readability
                                  return index % 2 === 0 ? this.getLabelForValue(value).split('T')[1].substr(0, 5) : '';
                              }
                          }
                      },
                      y: {
                          grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          display: false
                      },
                      tooltip: {
                          mode: 'index',
                          intersect: false,
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: 'rgba(255, 255, 255, 0.9)',
                          bodyColor: 'rgba(255, 255, 255, 0.9)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderWidth: 1
                      }
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
                          label: 'Input',
                          data: [],
                          borderColor: '#8B5CF6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderWidth: 2,
                          pointRadius: 2,
                          pointBackgroundColor: '#8B5CF6',
                          fill: true,
                          tension: 0.4
                      },
                      {
                          label: 'Output',
                          data: [],
                          borderColor: '#EC4899',
                          backgroundColor: 'rgba(236, 72, 153, 0.1)',
                          borderWidth: 2,
                          pointRadius: 2,
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
                              padding: 10
                          }
                      }
                  },
                  scales: {
                      ...timelineConfig.options.scales,
                      y: {
                          ...timelineConfig.options.scales.y,
                          title: {
                              display: true,
                              text: 'Bytes',
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
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(59, 130, 246, 0.7)'
                      ],
                      borderColor: [
                          'rgba(236, 72, 153, 1)',
                          'rgba(59, 130, 246, 1)'
                      ],
                      borderWidth: 1
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      x: {
                          grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                          }
                      },
                      y: {
                          grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          display: false
                      },
                      tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: 'rgba(255, 255, 255, 0.9)',
                          bodyColor: 'rgba(255, 255, 255, 0.9)',
                          callbacks: {
                              label: function(context) {
                                  return formatBytes(context.raw);
                              }
                          }
                      }
                  }
              }
          });
      }

      function updateChart(chart, value) {
          const isOverload = value > 80;
          chart.data.datasets[0].data = [value, 100 - value];
          chart.data.datasets[0].backgroundColor[0] = isOverload ? '#EF4444' : chart.originalColor;
          chart.update();
      }

      function updateTemperature(temp) {
          const temperatureElement = document.getElementById('temperature');
          const tempStatusElement = document.getElementById('temp-status');
          
          if (temp === null) {
              temperatureElement.textContent = 'N/A';
              tempStatusElement.textContent = 'Temperature not available';
              return;
          }
          
          temperatureElement.textContent = temp;
          
          // Optional: Change status text based on temperature value
          // Extract the numeric value from the temperature string (e.g. "45.2°C" -> 45.2)
          const numericTemp = parseFloat(temp);
          if (!isNaN(numericTemp)) {
              if (numericTemp < 40) {
                  tempStatusElement.textContent = 'Normal';
                  temperatureElement.classList.remove('text-yellow-400', 'text-red-500');
                  temperatureElement.classList.add('text-green-400');
              } else if (numericTemp < 70) {
                  tempStatusElement.textContent = 'Moderate';
                  temperatureElement.classList.remove('text-green-400', 'text-red-500');
                  temperatureElement.classList.add('text-yellow-400');
              } else {
                  tempStatusElement.textContent = 'High';
                  temperatureElement.classList.remove('text-green-400', 'text-yellow-400');
                  temperatureElement.classList.add('text-red-500');
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
          // Format timestamps for display
          const formatTime = (timestamp) => {
              const date = new Date(timestamp);
              return timestamp;
          };

          // Update CPU Timeline
          if (data.cpu_history && data.cpu_history.length > 0) {
              cpuTimelineChart.data.labels = data.cpu_history.map(item => formatTime(item.timestamp));
              cpuTimelineChart.data.datasets[0].data = data.cpu_history.map(item => item.usage);
              cpuTimelineChart.update();
          }

          // Update Memory Timeline
          if (data.memory_history && data.memory_history.length > 0) {
              memoryTimelineChart.data.labels = data.memory_history.map(item => formatTime(item.timestamp));
              memoryTimelineChart.data.datasets[0].data = data.memory_history.map(item => item.usage);
              memoryTimelineChart.update();
          }

          // Update Network Timeline
          if (data.network_history && data.network_history.length > 0) {
              networkTimelineChart.data.labels = data.network_history.map(item => formatTime(item.timestamp));
              networkTimelineChart.data.datasets[0].data = data.network_history.map(item => item.input);
              networkTimelineChart.data.datasets[1].data = data.network_history.map(item => item.output);
              networkTimelineChart.update();
          }
      }

      function updateHeapStats(heapData) {
          if (!heapData) return;

          // Update heap statistics display
          document.getElementById('heap-used').textContent = heapData.heapUsed;
          document.getElementById('heap-total').textContent = heapData.heapTotal;
          document.getElementById('heap-rss').textContent = heapData.rss;
          document.getElementById('heap-external').textContent = heapData.external;
          document.getElementById('heap-buffers').textContent = heapData.arrayBuffers;

          // Update heap chart
          heapChart.data.datasets[0].data = [heapData.rawHeapUsed, heapData.rawHeapTotal];
          heapChart.update();
      }

      function updateStats(data) {
          const cpuUsage = parseFloat(data.cpu);
          document.getElementById('cpu-usage').textContent = data.cpu;
          document.getElementById('cpu-name').textContent = data.cpu_name;
          document.getElementById('cpu-cores').textContent = data.cpu_cores;
          updateChart(cpuChart, cpuUsage);

          const ramUsage = parseFloat(data.ram);
          document.getElementById('ram-usage').textContent = data.ram;
          document.getElementById('ram-text').textContent = data.ram_text;
          updateChart(ramChart, ramUsage);

          const diskUsage = parseFloat(data.disk.usedPercent);
          document.getElementById('disk-usage').textContent = data.disk.usedPercent;
          document.getElementById('disk-text').textContent = `${data.disk.used} / ${data.disk.total}`;
          updateChart(diskChart, diskUsage);

          document.getElementById('hostname').textContent = data.hostname;
          document.getElementById('platform').textContent = data.platform;
          document.getElementById('architecture').textContent = data.architecture;
          document.getElementById('uptime').textContent = formatUptime(data.uptime);
          document.getElementById('uptime-small').textContent = `Uptime: ${formatUptime(data.uptime)}`;

          document.getElementById('load-1').textContent = data.load_average[0].toFixed(2);
          document.getElementById('load-5').textContent = data.load_average[1].toFixed(2);
          document.getElementById('load-15').textContent = data.load_average[2].toFixed(2);

          // Update network interfaces
          const networkInterfaces = document.getElementById('network-interfaces');
          networkInterfaces.innerHTML = '';
          data.network.forEach(interface => {
              networkInterfaces.innerHTML += `
                  <div class="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-all duration-300">
                      <div class="flex justify-between items-center mb-3">
                          <p class="text-gray-300 font-semibold">${interface.interface}</p>
                          <div class="status-pill bg-indigo-900 text-indigo-300 text-xs">Active</div>
                      </div>
                      <div class="space-y-2">
                          <div class="flex justify-between text-sm">
                              <span class="text-gray-400">Input:</span>
                              <span class="text-gray-200">${interface.inputBytes}</span>
                          </div>
                          <div class="flex justify-between text-sm">
                              <span class="text-gray-400">Output:</span>
                              <span class="text-gray-200">${interface.outputBytes}</span>
                          </div>
                          <div class="flex justify-between text-sm">
                              <span class="text-gray-400">Total:</span>
                              <span class="text-gray-200">${interface.totalBytes}</span>
                          </div>
                      </div>
                  </div>
              `;
          });
          
          // Update timeline charts
          updateTimelineCharts(data);
          
          // Update heap statistics
          updateHeapStats(data.heap);
          
          document.title = `${data.cpu} CPU | ${data.ram} RAM | ${data.disk.usedPercent} Disk`;
          document.querySelectorAll('.animate-pulse').forEach(el => el.classList.remove('animate-pulse'));
      }

      socket.on('connect', () => {
          console.log('Connected to server');
          document.querySelectorAll('.animate-pulse').forEach(el => el.classList.remove('animate-pulse'));
          document.getElementById('connection-status').textContent = 'Connected';
          document.querySelector('.status-indicator').classList.remove("indicator-yellow");
          document.querySelector('.status-indicator').classList.add('indicator-green');
          document.querySelector('.status-indicator').classList.remove('indicator-red');
      });

      socket.on('disconnect', () => {
          console.log('Disconnected from server');
          document.querySelectorAll('.chart-container, span, p').forEach(el => el.classList.add('animate-pulse'));
          document.getElementById('connection-status').textContent = 'Disconnected';
          document.querySelector('.status-indicator').classList.remove('indicator-green');
          document.querySelector('.status-indicator').classList.add('indicator-red');
      });

      socket.on('stats', (data) => {
          updateStats(data);
          updateTemperature(data.temperature);
      });

      document.addEventListener('DOMContentLoaded', function() {
          initCharts();
              Swal.fire({
                  title: 'Did You Know?',
                  text: 'StatsMonit is an open-source project that you can explore on GitHub!',
                  icon: 'info',
                  background: '#1e2235',
                  color: '#fff',
                  iconColor: '#3B82F6',
                  showCancelButton: true,
                  confirmButtonColor: '#3B82F6',
                  cancelButtonColor: '#4B5563',
                  confirmButtonText: 'View Project',
                  cancelButtonText: 'Close',
                  customClass: {
                      title: 'text-2xl text-blue-300',
                      popup: 'border border-gray-700 rounded-xl'
                  }
              }).then((result) => {
                  if (result.isConfirmed) {
                      window.open('https://github.com/cabrata/statsmonit', '_blank');
                  }
              });
      });
