const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx_K1oWv0xaXd6dQiZFXqQYRppq_VJGlCDh2ci5DSVcntuOcONZhbvfjhwl3MgQ23bprw/exec";  // अपना deployed URL डालो

document.getElementById("loadBtn").addEventListener("click", loadStudents);
document.getElementById("attendanceForm").addEventListener("submit", submitAttendance);

async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  const res = await fetch(`${WEB_APP_URL}?class=${encodeURIComponent(className)}`);
  const students = await res.json();

  const tableBody = document.getElementById("studentsTable");
  tableBody.innerHTML = "";

  if (students.error) {
    tableBody.innerHTML = `<tr><td colspan="3">${students.error}</td></tr>`;
    return;
  }

  students.forEach(student => {
    let row = `
      <tr>
        <td>${student.regNo || "N/A"}</td>
        <td>${student.name}</td>
        <td>
          <select data-regno="${student.regNo}" data-name="${student.name}" data-class="${student.class}">
            <option value="P">P</option>
            <option value="A">A</option>
          </select>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

async function submitAttendance(e) {
  e.preventDefault();
  const selects = document.querySelectorAll("#studentsTable select");

  for (let sel of selects) {
    const data = {
      regNo: sel.getAttribute("data-regno"),
      name: sel.getAttribute("data-name"),
      class: sel.getAttribute("data-class"),
      attendance: sel.value
    };

    await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  alert("Attendance submitted successfully!");
}
