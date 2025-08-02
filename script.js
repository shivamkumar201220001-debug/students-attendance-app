const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEdtjZ70JP3Wzpm0k1_nFrZ0nAYGrHi6JPP3VRpcQxj2HCSnZBFlOkLPDA0hNnlUo/exec";

const classSelect = document.getElementById("classSelect");
const studentList = document.getElementById("studentList");
const studentTableBody = document.getElementById("studentTableBody");
const attendanceForm = document.getElementById("attendanceForm");

// Fetch class tabs
async function fetchClassTabs() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.sheets) {
    data.sheets.forEach(sheet => {
      const sheetName = sheet.properties.title;
      if (sheetName !== "Attendance") {  // Exclude Attendance tab
        const option = document.createElement("option");
        option.value = sheetName;
        option.textContent = sheetName;
        classSelect.appendChild(option);
      }
    });
  }
}

// Fetch students by class
async function fetchStudents(className) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${className}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = data.values;

  if (rows && rows.length > 1) {
    studentTableBody.innerHTML = "";
    rows.slice(1).forEach(student => {
      const reg = student[0] || "";
      const name = student[1] || "";
      const cls = student[2] || "";
      const mainClass = student[3] || "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reg}</td>
        <td>${name}</td>
        <td>${cls}</td>
        <td>${mainClass}</td>
        <td>
          <select class="attendance-select">
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

// Submit attendance
attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rows = Array.from(studentTableBody.querySelectorAll("tr"));
  const attendanceData = rows.map(row => ({
    reg: row.children[0].textContent,
    name: row.children[1].textContent,
    cls: row.children[2].textContent,
    mainClass: row.children[3].textContent,
    attendance: row.querySelector("select").value
  }));

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(attendanceData),
    headers: { "Content-Type": "application/json" }
  });

  if (res.ok) {
    alert("Attendance submitted!");
  } else {
    alert("Submission failed.");
  }
});

classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  selectedClass ? fetchStudents(selectedClass) : studentList.classList.add("hidden");
});

fetchClassTabs();

// Add new class
async function addNewClass() {
  const newClass = document.getElementById("newClassName").value.trim();
  if (!newClass) return alert("Enter class name!");

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({ action: "addClass", className: newClass }),
    headers: { "Content-Type": "application/json" }
  });

  if (res.ok) {
    alert("Class added!");
    classSelect.innerHTML = '<option value="">-- Choose Class --</option>';
    fetchClassTabs();
    document.getElementById("newClassName").value = "";
  } else {
    alert("Failed to add class.");
  }
}
