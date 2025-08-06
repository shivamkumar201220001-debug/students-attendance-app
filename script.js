const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxkgT41SGI5s32HiYCZl_Yt2rHKxonps-DCZNHUwj72DSLgqco5emg6Vrlu9TXFM2QSTA/exec";

// Submit Attendance Function
function submitAttendance() {
    const rows = document.querySelectorAll("table tbody tr");
    const attendanceData = [];
    const today = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format

    rows.forEach(row => {
        const regno = row.cells[0].innerText.trim();
        const name = row.cells[1].innerText.trim();
        const status = row.querySelector("select") ? row.querySelector("select").value : "";

        if (regno && name && status) {
            attendanceData.push({
                date: today,
                class: document.getElementById("class-name").innerText || "Unknown", // optional class name
                regno: regno,
                name: name,
                status: status
            });
        }
    });

    if (attendanceData.length === 0) {
        alert("No attendance data found!");
        return;
    }

    // Send data to Google Sheets via Web App
    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(attendanceData),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.text())
    .then(result => {
        if (result.toLowerCase().includes("success")) {
            alert("Attendance submitted successfully!");
        } else {
            alert("Error submitting attendance: " + result);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error submitting attendance. Check console for details.");
    });
}

