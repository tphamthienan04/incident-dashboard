// 1. URL file JSON
const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

let allRecords = [];
let myDoughnutChart, myLineChart;

// Register DataLabels Plugin for Chart.js
Chart.register(ChartDataLabels);

async function loadDashboardData() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const rawData = await response.json();

        // 1. DATA CLEANING: Remove header and empty lines
        const cleanData = rawData.filter(line => line && line.startsWith('INC'));

        // 2. MAP DATA: Convert CSV strings into Objects (Đã fix lỗi chỉ số mảng)
        allRecords = cleanData.map(line => {
            const cols = line.split(',');
            return {
                id: cols,          // Column 0: INC...
                date: cols[1],        // Column 1: YYYY-MM-DD
                suburb: cols[2],      // Column 2: Suburb
                category: cols[3],    // Column 3: Category
                status: cols[4]       // Column 4: Status
            };
        });

        // 3. CALCULATE KPIs
        const total = allRecords.length; // Sẽ đếm chính xác 60 records
        const resolved = allRecords.filter(r => r.status && r.status.trim() === 'Resolved').length;
        const rate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

        document.getElementById("totalCases").innerText = total;
        document.getElementById("resolvedCases").innerText = resolved;
        document.getElementById("resolutionRate").innerText = rate + "%";

        // Update Timestamp
        document.getElementById("lastUpdated").innerText = new Date().toLocaleString();

        // 4. RENDER CHARTS & TABLE
        renderCharts(allRecords);
        renderTable(allRecords);

    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById("lastUpdated").innerText = "Error loading data.";
    }
}

// RENDER CHARTS FUNCTION
function renderCharts(data) {
    const categoryCounts = {};
    data.forEach(r => {
        if(r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const dateCounts = {};
    data.forEach(r => {
        if(r.date) dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
    });
    const sortedDates = Object.keys(dateCounts).sort();
    const dateValues = sortedDates.map(d => dateCounts[d]);

    if (myDoughnutChart) myDoughnutChart.destroy();
    if (myLineChart) myLineChart.destroy();

    // RENDER DOUGHNUT CHART
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
                    // ĐÃ FIX LỖI CRASH Ở ĐÂY: Thêm  và dùng reduce để tính tổng an toàn
                    formatter: (value, ctx) => {
                        let dataArr = ctx.chart.data.datasets.data; 
                        let sum = dataArr.reduce((a, b) => a + b, 0);
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    color: '#fff',
                    font: { weight: 'bold', size: 14 }
                }
            }
        }
    });

    // RENDER LINE CHART
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    myLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Total Cases Reported',
                data: dateValues,
                borderColor: '#004b87',
                backgroundColor: 'rgba(0, 75, 135, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            plugins: { datalabels: { display: false } }, // Tắt phần trăm trên Line Chart
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// RENDER TABLE FUNCTION
function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach(r => {
        if(!r.status) return; // Bỏ qua nếu dòng dữ liệu trống
        tbody.innerHTML += `<tr>
            <td>${r.id}</td>
            <td>${r.date}</td>
            <td>${r.suburb}</td>
            <td>${r.category}</td>
            <td><span class="status-${r.status.trim().toLowerCase().replace(/\s/g, '-')}">${r.status.trim()}</span></td>
        </tr>`;
    });
}

// FILTER DATA FUNCTIONALITY
document.getElementById("filterSuburb").addEventListener("input", filterData);
document.getElementById("filterDate").addEventListener("change", filterData);

function filterData() {
    const suburbValue = document.getElementById("filterSuburb").value.toLowerCase();
    const dateValue = document.getElementById("filterDate").value;

    const filteredRecords = allRecords.filter(r => {
        const matchSuburb = r.suburb && r.suburb.toLowerCase().includes(suburbValue);
        const matchDate = dateValue === "" ? true : r.date === dateValue;
        return matchSuburb && matchDate;
    });

    renderTable(filteredRecords);
}

// Initialize on page load
window.onload = loadDashboardData;
