const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEdtjZ70JP3Wzpm0k1_nFrZ0nAYGrHi6JPP3VRpcQxj2HCSnZBFlOkLPDA0hNnlUo/exec";

const classSelect = document.getElementById("classSelect");
const studentList = document.getElementById("studentList");
const studentTableBody = document.getElementById("studentTableBody");
const attendanceForm = document.getElementById("attendanceForm");

// 📦 Fetch list of class tabs
async function fetchClassTabs() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.sheets) {
    data.sheets.forEach(sheet => {
      const sheetName = sheet.properties.title;
      const option = document.createElement("option");
      option.value = sheetName;
      option.textContent = sheetName;
      classSelect.appendChild(option);
    });
  }
}

// 📄 Fetch students by class tab
async function fetchStudents(className) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${className}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = data.values;

  if (rows && rows.length > 1) {
    const headers = rows[0];
    const students = rows.slice(1);

    studentTableBody.innerHTML = "";
    students.forEach(student => {
      const row = document.createElement("tr");

      const reg = student[0];
      const name = student[1];
      const cls = student[2];

      row.innerHTML = `
        <td>${reg}</td>
        <td>${name}</td>
        <td>${cls}</td>
        <td>
          <select name="attendance" class="attendance-select">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </td>
      `;
      studentTableBody.appendChild(row);
    });

    studentList.classList.remove("hidden");
  } else {
    studentList.classList.add("hidden");
    alert("No student data found for selected class.");
  }
}

// 📤 Submit attendance to Apps Script
attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rows = Array.from(studentTableBody.querySelectorAll("tr"));
  const attendanceData = rows.map(row => {
    const reg = row.children[0].textContent;
    const name = row.children[1].textContent;
    const cls = row.children[2].textContent;
    const attendance = row.querySelector("select").value;
    return { reg, name, cls, attendance };
  });

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(attendanceData),
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (res.ok) {
    alert("Attendance submitted successfully!");
  } else {
    alert("Failed to submit attendance.");
  }
});

classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  if (selectedClass) {
    fetchStudents(selectedClass);
  } else {
    studentList.classList.add("hidden");
  }
});

fetchClassTabs();
