const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx4awT7W-YMzdceQlBpabyKEBFagUNM8SWGB_VqF0TsJp4nC0TVOxBDUgYhyGASlBLtTQ/exec";

async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  const tbody = document.querySelector("#studentsTable tbody");
  tbody.innerHTML = "";

  try {
    const res = await fetch(`${WEB_APP_URL}?action=getstudents&class=${encodeURIComponent(className)}`);
    const data = await res.json();

    if (!data.students || data.students.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>No students found</td></tr>";
      return;
    }

    data.students.forEach(st => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${st.regNo}</td>
        <td>${st.name}</td>
        <td>${st.class}</td>
        <td>
          <select>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </td>`;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert("Error loading students ❌");
    console.error(err);
  }
}

async function saveAll() {
  const teacher = document.getElementById("teacherSelect").value;
  const date = document.getElementById("dateSelect").value;
  const className = document.getElementById("classSelect").value;
  const rows = document.querySelectorAll("#studentsTable tbody tr");

  for (let row of rows) {
    const regNo = row.cells[0].innerText;
    const name = row.cells[1].innerText;
    const status = row.querySelector("select").value;

    const attendanceData = {
      regNo,
      name,
      class: className,
      teacher,
      date,
      status
    };

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
      });
      const result = await res.json();
      console.log("Saved:", result);
    } catch (err) {
      alert("Network error while saving!");
      console.error(err);
    }
  }

  alert("All attendance saved ✅");
}
