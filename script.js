// 1. URL file JSON (Chứa mảng các dòng CSV)
const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

let allRecords = [];
let myDoughnutChart, myLineChart;

// Đăng ký Plugin hiển thị số liệu trên biểu đồ
Chart.register(ChartDataLabels);

async function loadDashboardData() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Không thể tải dữ liệu từ server.");
        const rawData = await response.json();

        // 1. LÀM SẠCH DỮ LIỆU: Chỉ lấy các dòng bắt đầu bằng 'INC'
        const cleanData = rawData.filter(line => line && line.startsWith('INC'));

        // 2. MAPPING: Chuyển chuỗi CSV thành Object dựa trên file sample_incidents.csv
        allRecords = cleanData.map(line => {
            const cols = line.split(',');
            return {
                id: cols[0],          // Incident ID
                date: cols[1],        // Reported Date
                suburb: cols[2],      // Suburb
                category: cols[3],    // Category
                status: cols[4]?.trim() // Status (Xử lý khoảng trắng thừa)
            };
        });

        // 3. CẬP NHẬT CÁC CHỈ SỐ KPI
        const total = allRecords.length;
        const resolved = allRecords.filter(r => r.status === 'Resolved').length;
        const rate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

        document.getElementById("totalCases").innerText = total;
        document.getElementById("resolvedCases").innerText = resolved;
        document.getElementById("resolutionRate").innerText = rate + "%";
        document.getElementById("lastUpdated").innerText = new Date().toLocaleString();

        // 4. VẼ BIỂU ĐỒ VÀ BẢNG
        renderCharts(allRecords);
        renderTable(allRecords);

    } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById("lastUpdated").innerText = "Lỗi khi tải dữ liệu.";
    }
}

function renderCharts(data) {
    // Thống kê theo Category
    const categoryCounts = {};
    data.forEach(r => { if(r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });

    // Thống kê theo Ngày (để vẽ Line Chart)
    const dateCounts = {};
    data.forEach(r => { if(r.date) dateCounts[r.date] = (dateCounts[r.date] || 0) + 1; });
    const sortedDates = Object.keys(dateCounts).sort();
    const dateValues = sortedDates.map(d => dateCounts[d]);

    if (myDoughnutChart) myDoughnutChart.destroy();
    if (myLineChart) myLineChart.destroy();

    // DOUGHNUT CHART (Tỷ lệ phần trăm sự cố)
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    myDoughnutChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right' },
                datalabels: { 
                    formatter: (value, ctx) => {
                        // FIX: Lấy dữ liệu an toàn để tính %
                        const dataPoints = ctx.chart.data.datasets[0].data;
                        const sum = dataPoints.reduce((a, b) => a + b, 0);
                        return (value * 100 / sum).toFixed(1) + "%";
                    },
                    color: '#fff',
                    font: { weight: 'bold' }
                }
            }
        }
    });

    // LINE CHART (Xu hướng theo thời gian)
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    myLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Sự cố theo ngày',
                data: dateValues,
                borderColor: '#004b87',
                backgroundColor: 'rgba(0, 75, 135, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            plugins: { datalabels: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.date}</td>
            <td>${r.suburb}</td>
            <td>${r.category}</td>
            <td><span class="status-${r.status.toLowerCase()}">${r.status}</span></td>
        </tr>
    `).join('');
}

// KHỞI CHẠY
window.onload = loadDashboardData;
