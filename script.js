// Students Attendance App - script.js

const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI"; 
const API_KEY = "AIzaSyBCn-QeQAIMCw2FbC-knJJ3zn3_SI3KDhs"; 
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzHIeYhXvHWJ7rDfW5XJzvr1OKafgyTCenzUiZasJ7BAJh_OJcdKngO2YBqiTuSEB-Lfw/exec";

// Classes list
const classes = [
  "8th", "9th", "9th 2nd", "10th", "10th 2nd",
  "11th JEE Morning", "11th JEE Evening",
  "11th NEET Morning", "11th NEET Evening",
  "12th JEE Morning", "12th JEE Evening",
  "12th NEET Morning", "12th NEET Evening",
  "Dropper NEET", "Dropper NEET 2.0", "Dropper JEE"
];

document.addEventListener("DOMContentLoaded", () => {
  const classSelect = document.getElementById("classSelect");
  const studentList = document.getElementById("studentList");
  const attendanceForm = document.getElementById("attendanceForm");

  // Fill classes dropdown
  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
  });

  // Load students when class is selected
  classSelect.addEventListener("change", async () => {
    const className = classSelect.value;
    if (!className) return;

    studentList.innerHTML = "<p>Loading students...</p>";

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(className)}?key=${API_KEY}`
      );
      const data = await response.json();
      studentList.innerHTML = "";

      if (!data.values || data.values.length <= 1) {
        studentList.innerHTML = "<p>No students found in this class.</p>";
        return;
      }

      // Skip header row
      data.values.slice(1).forEach(row => {
        const [regNo, name] = row;

        const div = document.createElement("div");
        div.classList.add("student-row");
        div.innerHTML = `
          <span>${regNo} - ${name}</span>
          <select name="status-${regNo}">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        `;
        studentList.appendChild(div);
      });
    } catch (err) {
      studentList.innerHTML = "<p>Error loading students. Check API key & Sheet.</p>";
      console.error(err);
    }
  });

  // Submit attendance
  attendanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const className = classSelect.value;
    if (!className) {
      alert("Please select a class first!");
      return;
    }

    const date = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format
    const teacher = document.getElementById("teacherName").value.trim();
    if (!teacher) {
      alert("Enter teacher name!");
      return;
    }

    const students = [];
    document.querySelectorAll(".student-row").forEach(row => {
      const regNoName = row.querySelector("span").innerText;
      const [regNo, name] = regNoName.split(" - ");
      const status = row.querySelector("select").value;

      students.push({ regNo, name, status });
    });

    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ date, teacher, className, students }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (result.result === "success") {
        alert("✅ Attendance submitted successfully!");
        attendanceForm.reset();
        studentList.innerHTML = "";
      } else {
        alert("⚠️ Failed to submit attendance.");
      }
    } catch (err) {
      alert("❌ Error while submitting attendance. Check console.");
      console.error(err);
    }
  });
});
