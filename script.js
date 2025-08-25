// ⚠️ अपना Apps Script URL यहाँ डालो
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwjhzWFDf2YHunRDNlgZ-PeflY943Z-FxUwHwk4RsV0q1BhC7rwjvMrjl7z5giixErW-w/exec";

// Page load par class list fetch
window.onload = async function () {
  try {
    let res = await fetch(WEB_APP_URL);
    let classes = await res.json();

    let classSelect = document.getElementById("classSelect");
    classes.forEach(cls => {
      let option = document.createElement("option");
      option.value = cls;
      option.textContent = cls;
      classSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading classes:", err);
  }
};

// Students load function
async function loadStudents() {
  let className = document.getElementById("classSelect").value;
  if (!className) return alert("Please select a class");

  try {
    let res = await fetch(`${WEB_APP_URL}?class=${className}`);
    let data = await res.json();

    document.getElementById("dateHeading").innerText = `Attendance Date: ${data.date}`;
    let form = document.getElementById("attendanceForm");
    form.innerHTML = "";

    data.students.forEach(st => {
      let row = document.createElement("div");
      row.className = "student-row";
      row.innerHTML = `
        <span>${st.regNo} - ${st.name}</span>
        <select name="${st.regNo}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      `;
      form.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading students:", err);
  }
}

// Attendance submit function
async function submitAttendance() {
  let className = document.getElementById("classSelect").value;
  let form = document.getElementById("attendanceForm");
  let attendance = [];

  [...form.elements].forEach(el => {
    if (el.tagName === "SELECT") {
      attendance.push({
        regNo: el.name,
        status: el.value
      });
    }
  });

  try {
    let res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ className, attendance }),
    });

    let text = await res.text();
    document.getElementById("message").innerText = text;
  } catch (err) {
    console.error("Error submitting attendance:", err);
    document.getElementById("message").innerText = "Error submitting attendance!";
  }
}
