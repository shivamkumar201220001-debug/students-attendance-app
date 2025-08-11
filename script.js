const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxkjfwZl7Dw0ij4LyMIa4ev5uCMsnnNtmxEZ2dMXWLzYfpuDqJeNjGvq7GV7Wi4kqOrHQ/exec?action=getData";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxkjfwZl7Dw0ij4LyMIa4ev5uCMsnnNtmxEZ2dMXWLzYfpuDqJeNjGvq7GV7Wi4kqOrHQ/exec?action=getData";

document.getElementById("attendanceForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value;
    const status = document.getElementById("status").value;

    fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({ name, status }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.text())
    .then(data => {
        alert("Attendance Saved!");
        loadData();
        document.getElementById("attendanceForm").reset();
    })
    .catch(err => console.error(err));
});

function loadData() {
    fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
        const tableBody = document.getElementById("records");
        tableBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td>`;
            tableBody.appendChild(tr);
        });
    })
    .catch(err => console.error(err));
}

loadData();
