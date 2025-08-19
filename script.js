const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxkcJYJ39fKJWOlZeLsLd3-Hf5tvxoLhlBzrPXqd9WBv7l93b9Lx5Iw5YVrxkjGE2hPZw/exec";

async function loadClasses() {
  // Class list ko manually add kar sakte ho
  const classes = ["8th", "9th", "10th"];
  const select = document.getElementById("classSelect");
  select.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join("");
}

async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  const res = await fetch(`${WEB_APP_URL}?className=${className}`);
  const students = await res.json();

  const table = document.getElementById("studentsTable");
  table.innerHTML = `
    <tr>
      <th>Reg No</th>
      <th>Name</th>
      <th>Attendance</th>
    </tr>
  `;

  students.forEach(stu => {
    table.innerHTML += `
      <tr>
        <td>${stu.regNo}</td>
        <td>${stu.name}</td>
        <td>
          <select id="att-${stu.regNo}">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </td>
      </tr>
    `;
  });
}

async function submitAttendance() {
  const className = document.getElementById("classSelect").value;
  const rows = Array.from(document.querySelectorAll("#studentsTable tr")).slice(1);

  const attendance = rows.map(row => {
    const regNo = row.cells[0].innerText;
    const status = document.getElementById(`att-${regNo}`).value;
    return { regNo, attendance: status };
  });

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({ className, attendance }),
    headers: { "Content-Type": "application/json" }
  });

  alert(await res.text());
}

loadClasses();
