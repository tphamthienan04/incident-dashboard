// 1. URL file JSON
const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

let allRecords = []; // Save all data for filter
let myDoughnutChart, myLineChart; // 

async function loadDashboardData() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const rawData = await response.json();

        // 1. Analyze CSV into Array Object
        allRecords = rawData.map(line => {
            const cols = line.split(',');
            return {
                id: cols,
                date: cols[3],
                suburb: cols[4],
                category: cols[5],
                status: cols[6]
            };
        });

        // 2. Calculate KPIs
        document.getElementById("totalCases").innerText = allRecords.length;

        // Find Suburb highest cases
        const suburbCounts = {};
        allRecords.forEach(r => {
            suburbCounts[r.suburb] = (suburbCounts[r.suburb] || 0) + 1;
        });
        const topSuburb = Object.keys(suburbCounts).reduce((a, b) => suburbCounts[a] > suburbCounts[b] ? a : b);
        document.getElementById("topSuburb").innerText = `${topSuburb} (${suburbCounts[topSuburb]})`;

        // 3. Update Timestamp
        document.getElementById("lastUpdated").innerText = new Date().toLocaleString();

        // 4. Draw Charts
        renderCharts(allRecords);
        renderTable(allRecords);

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// 2 Charts
function renderCharts(data) {
    // Prepare data for Doughnut (% Portion of Categories)
    const categoryCounts = {};
    data.forEach(r => categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1);

    // Preapare data for Line Chart (Trend theo ngày)
    const dateCounts = {};
    data.forEach(r => dateCounts[r.date] = (dateCounts[r.date] || 0) + 1);
    // Sorting date
    const sortedDates = Object.keys(dateCounts).sort();
    const dateValues = sortedDates.map(d => dateCounts[d]);

    // Draw Doughnut Chart
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
        options: { plugins: { legend: { position: 'right' } } }
    });

    // Draw Line Chart
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    myLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Cases per Day',
                data: dateValues,
                borderColor: '#004b87',
                backgroundColor: 'rgba(0, 75, 135, 0.1)',
                fill: true,
                tension: 0.3 // Làm cong đường line cho mượt
            }]
        }
    });
}

// Table
function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach(r => {
        tbody.innerHTML += `<tr>
            <td>${r.id}</td>
            <td>${r.date}</td>
            <td>${r.suburb}</td>
            <td>${r.category}</td>
            <td>${r.status}</td>
        </tr>`;
    });
}

// FILTER Table
document.getElementById("filterSuburb").addEventListener("input", filterData);
document.getElementById("filterDate").addEventListener("change", filterData);

function filterData() {
    const suburbValue = document.getElementById("filterSuburb").value.toLowerCase();
    const dateValue = document.getElementById("filterDate").value;

    const filteredRecords = allRecords.filter(r => {
        const matchSuburb = r.suburb.toLowerCase().includes(suburbValue);
        const matchDate = dateValue === "" ? true : r.date === dateValue;
        return matchSuburb && matchDate;
    });

    renderTable(filteredRecords);
}

// Run
window.onload = loadDashboardData;
