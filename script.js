// ⚡ Yahan apna Google Apps Script Web App URL daalna hai
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbydW6uNf829hygKZ3DmgTMO63zyWOH-Q-ahT3ZDoMfGKHgtSWLgqXiAieSzOx4RoMzzBg/exec";

// Load Students Data
async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  if (!className) {
    alert("Please select a class!");
    return;
  }

  const response = await fetch(`${WEB_APP_URL}?class=${encodeURIComponent(className)}`);
  const students = await response.json();

  const tbody = document.querySelector("#studentsTable tbody");
  tbody.innerHTML = "";

  if (students.error) {
    alert(students.error);
    return;
  }

  students.forEach(stu => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${stu.RegNo}</td>
      <td>${stu.Name}</td>
      <td>
        <select name="attendance-${stu.RegNo}">
          <option value="P">P</option>
          <option value="A">A</option>
          <option value="L">L</option>
        </select>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Submit Attendance
async function submitAttendance(event) {
  event.preventDefault();

  const className = document.getElementById("classSelect").value;
  if (!className) {
    alert("Please select a class!");
    return;
  }

  const rows = document.querySelectorAll("#studentsTable tbody tr");
  const attendance = [];

  rows.forEach(row => {
    const regNo = row.cells[0].innerText;
    const name = row.cells[1].innerText;
    const status = row.querySelector("select").value;

    attendance.push({ RegNo: regNo, Name: name, Status: status });
  });

  const payload = { className, attendance };

  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  alert(result.message || "Attendance saved!");
}
