const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw3_8Y9_RON33ZXkLKyp8kVPUzF2F6hsSxDgS89gP1tziSB6XoTCUkWCATPJachI9txlQ/exec";

// Page load → Fetch all classes
window.onload = async () => {
  try {
    let res = await fetch(WEB_APP_URL);
    let classes = await res.json();
    let select = document.getElementById("classSelect");

    classes.forEach(cls => {
      let option = document.createElement("option");
      option.value = cls;
      option.textContent = cls;
      select.appendChild(option);
    });

    // Jab class select ho → students load karo
    select.addEventListener("change", loadStudents);
  } catch (err) {
    console.error(err);
  }
};

// Load students from selected class (from Sheet)
async function loadStudents() {
  let className = document.getElementById("classSelect").value;
  if (!className) return;

  let res = await fetch(`${WEB_APP_URL}?class=${className}`);
  let students = await res.json();

  let container = document.getElementById("studentsContainer");
  container.innerHTML = "";

  students.forEach(stu => {
    let row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `
      <span>${stu.regNo} - ${stu.name}</span>
      <select data-regno="${stu.regNo}">
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Leave">Leave</option>
      </select>
    `;
    container.appendChild(row);
  });
}

// Submit attendance
document.getElementById("submitBtn").addEventListener("click", async () => {
  let className = document.getElementById("classSelect").value;
  let selects = document.querySelectorAll("#studentsContainer select");

  let attendanceData = [];
  selects.forEach(sel => {
    attendanceData.push({
      regNo: sel.getAttribute("data-regno"),
      attendance: sel.value
    });
  });

  let res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({ className, attendance: attendanceData })
  });

  let msg = await res.text();
  document.getElementById("message").innerText = msg === "Success" ? "✅ Attendance Saved!" : "❌ Error Saving!";
});
