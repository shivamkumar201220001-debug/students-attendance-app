const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxlZRWWY4Dn8cVq-VmuzSkl27pInxVsj0jhgDLBJwyhHCwsheSQUcXrcUgVKKyKvllIkw/exec";

const classSelect = document.getElementById("classSelect");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");

async function loadClasses() {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`);
    const data = await res.json();
    console.log("Sheets API Response:", data);
    const sheetNames = data.sheets.map(s => s.properties.title);
    classSelect.innerHTML = sheetNames.map(cls => `<option value="${cls}">${cls}</option>`).join("");
    if (sheetNames.length > 0) {
      loadStudents(sheetNames[0]);
    }
  } catch (err) {
    console.error("Error loading classes", err);
  }
}

async function loadStudents(className) {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(className)}?key=${API_KEY}`);
    const data = await res.json();
    const rows = data.values;
    studentsTableBody.innerHTML = rows.slice(1).map(row => `
      <tr>
        <td>${row[0] || ""}</td>
        <td>${row[1] || ""}</td>
        <td>${row[2] || ""}</td>
        <td>
          <select>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error loading students", err);
  }
}

classSelect.addEventListener("change", () => {
  loadStudents(classSelect.value);
});

submitBtn.addEventListener("click", async () => {
  const className = classSelect.value;
  const attendanceData = [];
  document.querySelectorAll("#studentsTable tbody tr").forEach(row => {
    const regNo = row.cells[0].textContent;
    const name = row.cells[1].textContent;
    const cls = row.cells[2].textContent;
    const attendance = row.cells[3].querySelector("select").value;
    attendanceData.push({ regNo, name, cls, attendance });
  });

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ className, attendanceData }),
    });
    const result = await res.json();
    if (result.status === "success") {
      statusEl.textContent = "Attendance Submitted Successfully!";
      statusEl.style.color = "green";
    } else {
      statusEl.textContent = "Error submitting attendance.";
      statusEl.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error submitting attendance.";
    statusEl.style.color = "red";
  }
});

loadClasses();
