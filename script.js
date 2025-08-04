const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEdtjXSBGfPBmFgmAY5uEdsT5VFcfAByBiTLopDj2l/dev";

const classSelect = document.getElementById("classSelect");
const studentsTable = document.getElementById("studentsTable").getElementsByTagName("tbody")[0];
const submitBtn = document.getElementById("submitBtn");

// ✅ Static class list
const classes = [
    "8th", "9th 1st", "9th 2nd", "10th 1st", "10th 2nd", 
    "11th JEE Morning", "11th JEE Evening", "11th NEET Morning", "11th NEET Evening", 
    "12th JEE Morning", "12th JEE Evening", "12th NEET Morning", "12th NEET Evening"
];

classes.forEach(className => {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = className;
    classSelect.appendChild(option);
});

classSelect.addEventListener("change", () => {
    const className = classSelect.value;
    if (!className) return;

    studentsTable.innerHTML = ""; // Clear table

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(className)}?key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            const rows = data.values;
            if (!rows || rows.length <= 1) return;
            const header = rows[0];
            const regNoIndex = header.indexOf("Reg. No");
            const nameIndex = header.indexOf("Student Name");

            rows.slice(1).forEach(row => {
                const tr = document.createElement("tr");

                const regNoCell = document.createElement("td");
                regNoCell.textContent = row[regNoIndex] || "";
                tr.appendChild(regNoCell);

                const nameCell = document.createElement("td");
                nameCell.textContent = row[nameIndex] || "";
                tr.appendChild(nameCell);

                const attendanceCell = document.createElement("td");
                const select = document.createElement("select");
                select.innerHTML = `
                    <option value="">--</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                `;
                attendanceCell.appendChild(select);
                tr.appendChild(attendanceCell);

                studentsTable.appendChild(tr);
            });
        });
});

submitBtn.addEventListener("click", () => {
    const className = classSelect.value;
    if (!className) {
        alert("Please select a class.");
        return;
    }

    const attendanceData = [];
    Array.from(studentsTable.rows).forEach(row => {
        const regNo = row.cells[0].textContent;
        const name = row.cells[1].textContent;
        const attendance = row.cells[2].querySelector("select").value;
        if (attendance) {
            attendanceData.push({ regNo, name, attendance });
        }
    });

    if (attendanceData.length === 0) {
        alert("Please mark attendance for at least one student.");
        return;
    }

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
            className,
            attendanceData
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.text())
      .then(response => {
        alert("Attendance submitted successfully!");
        classSelect.value = "";
        studentsTable.innerHTML = "";
      }).catch(err => {
        console.error(err);
        alert("Failed to submit attendance.");
      });
});
