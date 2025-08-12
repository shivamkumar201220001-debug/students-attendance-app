const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwocqC6soKHZh2DNET2pyhZQNoj6l0imyC2TdGZsZPsoNKFG7qcKSCHjx_YG8gIM183/exec";
function loadStudents() {
  const className = document.getElementById("classSelect").value;
  if (!className) {
    alert("Please select a class");
    return;
  }

  fetch(`${WEB_APP_URL}?action=getStudents&class=${encodeURIComponent(className)}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#studentsTable tbody");
      tbody.innerHTML = "";
      data.forEach(student => {
        const row = `
          <tr>
            <td>${student.regNo}</td>
            <td>${student.name}</td>
            <td>
              <select name="attendance">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    })
    .catch(err => console.error(err));
}

document.getElementById("attendanceForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const className = document.getElementById("classSelect").value;
  const rows = document.querySelectorAll("#studentsTable tbody tr");
  const attendanceData = [];

  rows.forEach(row => {
    const regNo = row.cells[0].innerText;
    const name = row.cells[1].innerText;
    const status = row.querySelector("select").value;
    attendanceData.push({ regNo, name, status });
  });

  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submitAttendance",
      class: className,
      data: attendanceData
    }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
  })
  .catch(err => console.error(err));
});

