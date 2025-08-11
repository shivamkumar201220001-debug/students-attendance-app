const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzSkCHZxMGvDJk4JjoRHagLoWr1uUwpizaY5t9pSjokFtZ4qzBZnpgkDS7bflc-bORM_A/exec";

async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  if (!className) {
    alert("Please select a class!");
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(className)}?key=${API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  const tableBody = document.querySelector("#studentsTable tbody");
  tableBody.innerHTML = "";

  data.values.slice(1).forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>
        <select>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById("attendanceForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const className = document.getElementById("classSelect").value;
  const date = new Date().toLocaleDateString("en-IN");

  const rows = document.querySelectorAll("#studentsTable tbody tr");
  const attendanceData = [];

  rows.forEach(row => {
    const regno = row.cells[0].innerText;
    const name = row.cells[1].innerText;
    const status = row.cells[2].querySelector("select").value;

    attendanceData.push({
      date: date,
      class: className,
      regno: regno,
      name: name,
      status: status
    });
  });

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(attendanceData)
  });

  const text = await res.text();
  alert(text);
});
