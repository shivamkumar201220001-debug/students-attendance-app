const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const SHEET_ID = "1LIXxChykzOG8cV3JN64ufIQr8iUaK9pKdvXs-6W8zfs";
const WEB_APP_URL = "YOUR_WEB_APP_URL_HERE"; // Replace after Apps Script deploy

document.getElementById("classSelect").addEventListener("change", function () {
  const selectedClass = this.value;
  if (!selectedClass) return;

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
