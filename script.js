// 1. Dán URL tệp JSON em vừa copy vào đây
const jsonUrl = "https://stincidentprod22648859.blob.core.windows.net/public-assets/dashboard-summary.json";

async function loadDashboardData() {
    try {
        // Gọi hàm fetch để đọc dữ liệu từ Azure Blob Storage
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Không thể tải dữ liệu từ Azure");
        
        const data = await response.json();

        // 2. Xử lý logic dữ liệu (KPIs)
        const graffitiItems = data.filter(item => item.includes("Graffiti"));
        const potholeItems = data.filter(item => item.includes("Pothole"));

        document.getElementById("graffitiCount").innerText = graffitiItems.length;
        document.getElementById("potholeCount").innerText = potholeItems.length;

        // 3. Cập nhật Dấu thời gian (Timestamp)
        const now = new Date();
        document.getElementById("lastUpdated").innerText = now.toLocaleString();

        // 4. Hiển thị bảng dữ liệu (Table)
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = ""; // Xóa dữ liệu cũ
        
        data.forEach((line, index) => {
            if (line.trim() !== "") {
                const cols = line.split(","); // Giả định dữ liệu CSV trong JSON
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${cols[1] || 'N/A'}</td>
                    <td>${cols[2] || 'N/A'}</td>
                    <td>${cols[3] || 'N/A'}</td>
                    <td>${cols[4] || 'N/A'}</td>
                </tr>`;
                tableBody.innerHTML += row;
            }
        });

        // 5. Vẽ biểu đồ (Chart.js)
        renderChart(graffitiItems.length, potholeItems.length);

    } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById("lastUpdated").innerText = "Error loading data.";
    }
}

function renderChart(graffiti, potholes) {
    const ctx = document.getElementById('incidentChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Graffiti', 'Potholes'],
            datasets: [{
                label: 'Number of Incidents',
                data: [graffiti, potholes],
                backgroundColor: ['#FF6384', '#36A2EB']
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Chạy hàm khi trang web vừa tải xong
window.onload = loadDashboardData;