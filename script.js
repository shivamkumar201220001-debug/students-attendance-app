const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw3HSm_fFUXnWUvKxLMyyvuiFz5aCVnK_G7_awQRc7Yki3XK_M5Y1vo5GD75MUg0LdXNg/exec";

function loadStudents() {
  const tbody = document.querySelector("#studentsTable tbody");
  tbody.innerHTML = "";

  // Ye student list Google Sheet se fetch karni hogi
  // Abhi example ke liye static data
  const students = [
    { regNo: "22510060", name: "Chitresh", class: "8th" },
    { regNo: "22669121", name: "Shreya", class: "8th" },
    { regNo: "22665706", name: "Ashwika", class: "8th" },
    { regNo: "22557380", name: "Krish", class: "8th" },
  ];

  students.forEach(st => {
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
