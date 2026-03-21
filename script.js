const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

let allRecords = [];
let filteredRecords = [];
let displayLimit = 10;
let myDoughnutChart, myLineChart;

Chart.register(ChartDataLabels);

async function loadDashboardData() {
    try {
        const response = await fetch(jsonUrl);
        const rawData = await response.json();

        // 1. Map data & Clean whitespace
        allRecords = rawData.filter(line => line && line.startsWith('INC')).map(line => {
            const cols = line.split(',');
            return {
                id: cols[0]?.trim(),
                date: cols[1]?.trim(),
                suburb: cols[2]?.trim(),
                category: cols[3]?.trim(),
                status: cols[4]?.trim() || ""
            };
        });

        filteredRecords = [...allRecords]; // Copy original data

        updateKPIs(allRecords);
        renderCharts(allRecords);
        renderTable();

        // 2. Gán sự kiện bộ lọc (Đảm bảo gán sau khi dữ liệu đã tải xong)
        initFilters();

    } catch (error) {
        console.error("Error:", error);
    }
}

// Hàm khởi tạo bộ lọc
function initFilters() {
    const suburbInput = document.getElementById("filterSuburb");
    const dateInput = document.getElementById("filterDate");

    suburbInput.addEventListener("input", filterData);
    dateInput.addEventListener("change", filterData);
}

function filterData() {
    const suburbValue = document.getElementById("filterSuburb").value.toLowerCase().trim();
    const dateValue = document.getElementById("filterDate").value; // Format: YYYY-MM-DD

    filteredRecords = allRecords.filter(r => {
        // Kiểm tra Suburb: nếu ô trống thì coi như khớp (true)
        const matchSuburb = suburbValue === "" || (r.suburb && r.suburb.toLowerCase().includes(suburbValue));
        
        // Kiểm tra Date: So sánh chuỗi ngày trực tiếp
        const matchDate = dateValue === "" || r.date === dateValue;

        return matchSuburb && matchDate;
    });

    displayLimit = 10; // Reset về 10 dòng mỗi khi lọc
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("tableBody");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    
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

    // Hiện/Ẩn nút Load More
    if (displayLimit >= filteredRecords.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-block";
    }
}

// Sự kiện nút Load More
document.getElementById("loadMoreBtn").onclick = function() {
    displayLimit += 10;
    renderTable();
};

window.onload = loadDashboardData;

// --- PHẦN VẼ BIỂU ĐỒ (Giữ nguyên như bản trước) ---
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
            datasets: [{ data: Object.values(categoryCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] }]
        },
        options: { plugins: { datalabels: { formatter: (v, c) => {
            const sum = c.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            return (v * 100 / sum).toFixed(1) + "%";
        }, color: '#fff' } } }
    });

    const ctxL = document.getElementById('lineChart').getContext('2d');
    myLineChart = new Chart(ctxL, {
        type: 'line',
        data: { labels: sortedDates, datasets: [{ label: 'Cases', data: sortedDates.map(d => dateCounts[d]), borderColor: '#004b87', fill: false }] },
        options: { plugins: { datalabels: { display: false } } }
    });
}

function updateKPIs(data) {
    const total = data.length;
    const resolved = data.filter(r => r.status.toLowerCase() === 'resolved').length;
    document.getElementById("totalCases").innerText = total;
    document.getElementById("resolvedCases").innerText = resolved;
    document.getElementById("resolutionRate").innerText = total > 0 ? ((resolved/total)*100).toFixed(1) + "%" : "0%";
}
