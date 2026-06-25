# 🚨 Live Incident Dashboard: Azure Data Integration

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Azure Static Web Apps](https://img.shields.io/badge/Azure_Static_Web_Apps-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

## 📌 Project Overview
This repository contains a lightweight, responsive frontend web application designed to visualize and track real-time operational incidents. The dashboard dynamically syncs with backend data hosted on **Microsoft Azure**, providing a centralized, easy-to-read interface for monitoring system health and issue reports.

## 🏗️ Architecture & CI/CD Pipeline
The project embraces a modern serverless deployment architecture:
*   **Frontend Interface:** Built with vanilla HTML, CSS, and JavaScript for maximum performance and zero dependency overhead.
*   **Data Integration:** The `script.js` file handles the asynchronous data fetching logic, securely consuming REST APIs/data endpoints from the Azure backend.
*   **Automated Deployment (CI/CD):** Integrated with **GitHub Actions**. Every push to the `main` branch automatically triggers a workflow (`.github/workflows`) that builds and deploys the latest version of the dashboard directly to **Azure Static Web Apps**.

## 📂 Repository Structure
*   `index.html`: The main structural template and layout of the dashboard.
*   `style.css`: Custom styling, ensuring a clean, responsive, and user-friendly interface across all devices.
*   `script.js`: Contains the core logic for asynchronous data fetching from Azure and dynamic DOM manipulation to render incident metrics.
*   `.github/workflows/`: Contains the YAML configuration files for the automated GitHub Actions deployment pipeline.

## 🚀 How to Run Locally
To test or develop the dashboard on your local machine:
1.  Clone this repository to your local environment.
2.  Open the `index.html` file in any modern web browser.
    *   *Optional:* For the best experience (to avoid CORS issues when fetching data), use a local development server like VS Code's "Live Server" extension.
3.  Ensure you have the correct Azure backend endpoints configured in your `script.js` if you intend to fetch live data.
