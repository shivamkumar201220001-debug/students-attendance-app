const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";  // ✅ Replace with your key
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI"; // ✅ Replace with your Sheet ID
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxkgT41SGI5s32HiYCZl_Yt2rHKxonps-DCZNHUwj72DSLgqco5emg6Vrlu9TXFM2QSTA/exec"; // ✅ Replace with your Web App URL

document.getElementById("classSelect").addEventListener("change", fetchStudents);

function fetchStudents() {
    const selectedClass = document.getElementById("classSelect").value;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(selectedClass)}?key=${API_KEY}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const students = data.values;
            const tbody = document.querySelector("#studentsTable tbody");
            tbody.innerHTML = "";

            for (let i = 1; i < students.length; i++) {
                const [regno, name] = students[i];
                const row = `
                    <tr>
                        <td>${regno}</td>
                        <td>${name}</td>
                        <td>
                            <select>
                                <option value="">--Select--</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Leave">Leave</option>
                            </select>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        })
        .catch(err => {
            alert("Error fetching data from Google Sheet");
            console.error(err);
        });
}

function submitAttendance() {
    const rows = document.querySelectorAll("#studentsTable tbody tr");
    const attendanceData = [];
    const dateInput = document.getElementById("attendanceDate").value;
    const selectedClass = document.getElementById("classSelect").value;

    const today = dateInput || new Date().toLocaleDateString("en-GB");

    rows.forEach(row => {
        const regno = row.cells[0].innerText.trim();
        const name = row.cells[1].innerText.trim();
        const status = row.querySelector("select").value;

        if (regno && name && status) {
            attendanceData.push({
                date: today,
                class: selectedClass,
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

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(attendanceData),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.text())
    .then(res => {
        if (res.toLowerCase().includes("success")) {
            alert("Attendance submitted successfully!");
        } else {
            alert("Error: " + res);
        }
    })
    .catch(err => {
        console.error("Submit error:", err);
        alert("Error submitting attendance.");
    });
}
