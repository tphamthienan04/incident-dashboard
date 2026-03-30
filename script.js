const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

let allRecords = [];
let filteredRecords = [];
let displayLimit = 10;
let myDoughnutChart, myLineChart;

Chart.register(ChartDataLabels);

async function loadDashboardData() {
    try {
        // 
        updateTimestamp();

        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Failed to connect to data source");
        const rawData = await response.json();

        // 
        allRecords = rawData.filter(line => line && line.startsWith('INC')).map(line => {
            const cols = line.split(',');
            return {
                id: cols[0]?.trim(),
                date: cols[1]?.trim(), // Định dạng YYYY-MM-DD
                suburb: cols[2]?.trim(),
                category: cols[3]?.trim(),
                status: cols[4]?.trim() || "Open"
            };
        });

        // 
        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        //
        filteredRecords = [...allRecords];

        // 
        updateKPIs(allRecords);
        renderCharts(allRecords);
        renderTable();
        
        // 
        initFilters();

    } catch (error) {
        console.error("Dashboard Error:", error);
        document.getElementById("lastUpdated").innerText = "Update Failed: Check Connection";
    }
}

function updateTimestamp() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById("lastUpdated").innerText = now.toLocaleString('vi-VN', options);
}

function initFilters() {
    document.getElementById("filterSuburb").addEventListener("input", filterData);
    document.getElementById("filterDate").addEventListener("change", filterData);
}

function filterData() {
    const suburbValue = document.getElementById("filterSuburb").value.toLowerCase().trim();
    const dateValue = document.getElementById("filterDate").value;

    filteredRecords = allRecords.filter(r => {
        const matchSuburb = suburbValue === "" || (r.suburb && r.suburb.toLowerCase().includes(suburbValue));
        const matchDate = dateValue === "" || r.date === dateValue;
        return matchSuburb && matchDate;
    });

    displayLimit = 10; // 
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("tableBody");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    
    // 
    if (filteredRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 50px; color: #999; font-style: italic; font-size: 1.1em;">
                    ⚠️ No data shown for the selected filters.
                </td>
            </tr>`;
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
    }

    const dataToShow = filteredRecords.slice(0, displayLimit);
    
    tbody.innerHTML = dataToShow.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.date}</td>
            <td>${r.suburb}</td>
            <td>${r.category}</td>
            <td><span class="status-${r.status.toLowerCase()}">${r.status}</span></td>
        </tr>
    `).join('');

    // 
    if (loadMoreBtn) {
        loadMoreBtn.style.display = (displayLimit >= filteredRecords.length) ? "none" : "inline-block";
    }
}

// 
const btn = document.getElementById("loadMoreBtn");
if (btn) {
    btn.onclick = function() {
        displayLimit += 10;
        renderTable();
    };
}

window.onload = loadDashboardData;

// 
function updateKPIs(data) {
    const total = data.length;
    const resolved = data.filter(r => r.status.toLowerCase() === 'resolved').length;
    document.getElementById("totalCases").innerText = total;
    document.getElementById("resolvedCases").innerText = resolved;
    document.getElementById("resolutionRate").innerText = total > 0 ? ((resolved/total)*100).toFixed(1) + "%" : "0%";
}

function renderCharts(data) {
    const categoryCounts = {};
    data.forEach(r => { if(r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });
    const dateCounts = {};
    data.forEach(r => { if(r.date) dateCounts[r.date] = (dateCounts[r.date] || 0) + 1; });
    const sortedDates = Object.keys(dateCounts).sort();

    if (myDoughnutChart) myDoughnutChart.destroy();
    if (myLineChart) myLineChart.destroy();

    const ctxD = document.getElementById('doughnutChart').getContext('2d');
    myDoughnutChart = new Chart(ctxD, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{ data: Object.values(categoryCounts), backgroundColor: 
                ['#e6194b', '#3cb44b', '#4363d8', '#ffe119', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4'] }]
        },
        options: { 
            plugins: { 
                datalabels: { 
                    formatter: (v, c) => {
                        // Lấy dữ liệu an toàn để tránh lỗi undefined
                        const dataset = c.chart.data.datasets[0].data;
                        const sum = dataset.reduce((a, b) => a + b, 0);
                        return (v * 100 / sum).toFixed(1) + "%";
                    }, 
                    color: '#fff', font: { weight: 'bold' } 
                } 
            } 
        }
    });

    const ctxL = document.getElementById('lineChart').getContext('2d');
    myLineChart = new Chart(ctxL, {
        type: 'line',
        data: { labels: sortedDates, datasets: [{ label: 'Incident Trend', data: sortedDates.map(d => dateCounts[d]), borderColor: '#004b87', fill: false, tension: 0.2 }] },
        options: { plugins: { datalabels: { display: false } } }
    });
}
