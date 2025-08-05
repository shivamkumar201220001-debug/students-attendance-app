const WEB_APP_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

document.getElementById("classSelect").addEventListener("change", async function() {
    const className = this.value;
    if (className) {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getStudents", className }),
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (result.success) displayStudents(result.data);
    } else {
        document.getElementById("studentList").innerHTML = "";
        document.getElementById("submitBtn").style.display = "none";
    }
});

function displayStudents(students) {
    const container = document.getElementById("studentList");
    container.innerHTML = "";
    students.forEach(student => {
        const div = document.createElement("div");
        div.className = "student";
        div.innerHTML = `
            <strong>${student.name}</strong><br>
            Reg No: ${student.regNo}<br>
            <label><input type="radio" name="status_${student.regNo}" value="Present" checked> Present</label>
            <label><input type="radio" name="status_${student.regNo}" value="Absent"> Absent</label>
        `;
        container.appendChild(div);
    });
    document.getElementById("submitBtn").style.display = "inline-block";
}

document.getElementById("submitBtn").addEventListener("click", async function() {
    const className = document.getElementById("classSelect").value;
    const date = new Date().toLocaleDateString("en-GB");
    const studentDivs = document.querySelectorAll(".student");
    let attendanceData = [];

    studentDivs.forEach(div => {
        const regNo = div.querySelector("strong").nextSibling.textContent.split(": ")[1];
        const name = div.querySelector("strong").textContent;
        const status = div.querySelector("input[type='radio']:checked").value;
        attendanceData.push({ date, class: className, regNo, name, status });
    });

    await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "submitAttendance", attendanceData }),
        headers: { "Content-Type": "application/json" }
    });

    alert("Attendance submitted successfully!");
    document.getElementById("studentList").innerHTML = "";
    document.getElementById("submitBtn").style.display = "none";
});
