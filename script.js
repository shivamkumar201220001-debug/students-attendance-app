const API_KEY = "AIzaSyCFVED1V4gDZcXeqn6Xsn2MKoSZeFHsaRc";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbypEiRcHxlOL_sKBIoyFGrnhtTBWNUI84VdUv0qqoK5dCpGPSqWKW4VVsHnKb0qxQ0egQ/exec";

document.getElementById("classSelect").addEventListener("change", function () {
  const selectedClass = this.value;
  // 👇 NEW CLASS LIST ADD THIS AT TOP OF script.js
const classList = [
    "8th",
    "9th 1st",
    "9th 2nd",
    "10th 1st",
    "10th 2nd",
    "11th JEE Morning",
    "11th JEE Evening",
    "11th NEET Morning",
    "11th NEET Evening",
    "12th JEE Morning",
    "12th JEE Evening",
    "12th NEET Morning",
    "12th NEET Evening",
    "Dropper NEET 1.0",
    "Dropper NEET 2.0",
    "Dropper JEE"
];

// 👇 Populate classSelect dropdown dynamically
const classSelect = document.getElementById("classSelect");
classSelect.innerHTML = '<option value="">-- Select Class --</option>';
classList.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
});


  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${selectedClass}?key=${API_KEY}`)
    .then((res) => res.json())
    .then((data) => {
      const rows = data.values;
      if (!rows || rows.length < 2) {
        document.getElementById("studentsContainer").innerHTML = "<p>No data found.</p>";
        return;
      }

      let html = "<table><tr><th>Reg No</th><th>Name</th><th>Attendance</th></tr>";
      for (let i = 1; i < rows.length; i++) {
        const [reg, name] = rows[i];
        html += `
          <tr>
            <td>${reg}</td>
            <td>${name}</td>
            <td>
              <select class="attendance" data-reg="${reg}" data-name="${name}">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </td>
          </tr>`;
      }
      html += "</table>";
      document.getElementById("studentsContainer").innerHTML = html;
      document.getElementById("submitBtn").style.display = "inline-block";
    });
});

document.getElementById("submitBtn").addEventListener("click", () => {
  const selectedClass = document.getElementById("classSelect").value;
  const selects = document.querySelectorAll(".attendance");

  let present = 0, absent = 0, leave = 0;

  selects.forEach(select => {
    const status = select.value;
    if (status === "Present") present++;
    if (status === "Absent") absent++;
    if (status === "Leave") leave++;

    const data = {
      date: new Date().toLocaleDateString("en-IN"),
      class: selectedClass,
      regNo: select.getAttribute("data-reg"),
      name: select.getAttribute("data-name"),
      status
    };

    // Save each record to Attendance sheet
    fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });
  });

  document.getElementById("summary").innerText = 
    `✔️ Present: ${present} | ❌ Absent: ${absent} | 🚫 Leave: ${leave}`;

  alert("Attendance submitted successfully!");
});
