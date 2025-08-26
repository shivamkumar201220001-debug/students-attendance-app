const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxYHL2Xh1Kngx6vxPCuDoqz6xWRLnPWzGq_o3kIm5A1dGDtaA46tdxPLipHn-3JJEGkhg/exec"; // apna Apps Script deploy URL daalo

document.addEventListener("DOMContentLoaded", async () => {
  const classSelect = document.getElementById("classSelect");

  // Fetch class list
  try {
    let res = await fetch(`${WEB_APP_URL}?action=getClasses`);
    let data = await res.json();

    if (data.classes) {
      data.classes.forEach(cls => {
        let option = document.createElement("option");
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Error loading classes:", err);
  }
});

// Fetch students when class selected
async function loadStudents() {
  const classSelect = document.getElementById("classSelect").value;
  const studentList = document.getElementById("studentList");
  studentList.innerHTML = "";

  if (!classSelect) return;

  try {
    let res = await fetch(`${WEB_APP_URL}?action=getStudents&class=${encodeURIComponent(classSelect)}`);
    let data = await res.json();

    if (data.students && data.students.length > 0) {
      data.students.forEach(stu => {
        let row = document.createElement("div");
        row.className = "student-row";
        row.innerHTML = `
          <span>${stu.regno}</span>
          <span>${stu.name}</span>
          <select>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        `;
        studentList.appendChild(row);
      });
    } else {
      studentList.innerHTML = "<p>No students found.</p>";
    }
  } catch (err) {
    console.error("Error loading students:", err);
  }
}
