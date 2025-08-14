const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFxMLW1wMiEopjCR12s8eswi0eOq_Diuxu-pPjWOjiKmsgf7uNj9KeFt7MCsK9KaZRUQ/exec";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";

const classSelect = document.getElementById("classSelect");
const studentsTableBody = document.querySelector("#studentsTable tbody");

// Fetch classes from Apps Script
async function loadClasses() {
  const res = await fetch(WEB_APP_URL);
  const classes = await res.json();
  classSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join("");
  loadStudents(classSelect.value);
}

// Fetch students from Google Sheets API
async function loadStudents(className) {
  const range = `${className}!A2:C`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  studentsTableBody.innerHTML = "";
  if (data.values) {
    data.values.forEach(row => {
      studentsTableBody.innerHTML += `
        <tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>
            <select>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </td>
        </tr>
      `;
    });
  }
}

classSelect.addEventListener("change", () => loadStudents(classSelect.value));

// Submit attendance to Apps Script
document.getElementById("submitAttendance").addEventListener("click", async () => {
  const rows = [...studentsTableBody.querySelectorAll("tr")];
  const attendance = rows.map(r => ({
    regNo: r.cells[0].innerText,
    attendance: r.cells[2].querySelector("select").value
  }));

  const payload = { className: classSelect.value, attendance };

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  alert(text);
});

loadClasses();
