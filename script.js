const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";

const classSelect = document.getElementById("classSelect");
const loadBtn = document.getElementById("loadBtn");
const studentsContainer = document.getElementById("studentsContainer");
const allPresentBtn = document.getElementById("allPresentBtn");
const allAbsentBtn = document.getElementById("allAbsentBtn");
const submitBtn = document.getElementById("submitBtn");
const teacherInput = document.getElementById("teacherInput");
const dateInput = document.getElementById("dateInput");
const message = document.getElementById("message");

// Set today's date as default
dateInput.value = new Date().toISOString().slice(0, 10);

// Hardcoded classes list (you can modify)
const classes = [
  "8th",
  "9th",
  "9th 2nd",
  "10th",
  "10th 2nd",
  "11th JEE Morning",
  "11th NEET Morning",
  "12th JEE Morning",
  "12th NEET Morning",
  "Drooper JEE",
  "Dropper NEET",
  "Dropper NEET 2.0",
  "11th JEE Evening",
  "11th NEET Evening",
  "12th JEE Evening",
  "12th NEET Evening"
];

function init() {
  showMessage("Loading classes...");
  classSelect.innerHTML = `<option value="">-- choose class --</option>`;
  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classSelect.appendChild(opt);
  });
  showMessage("");
}

init();

loadBtn.addEventListener("click", loadStudents);
allPresentBtn.addEventListener("click", () => setAllStatus("Present"));
allAbsentBtn.addEventListener("click", () => setAllStatus("Absent"));
submitBtn.addEventListener("click", submitAttendance);

async function loadStudents() {
  const cls = classSelect.value;
  if (!cls) return showMessage("Choose a class first");
  studentsContainer.innerHTML = "<i>Loading students...</i>";
  try {
    // call GET action
    const url = `${WEB_APP_URL}?action=getStudents&className=${encodeURIComponent(cls)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      renderStudents(data.students);
      showMessage(`Loaded ${data.students.length} students`);
    } else {
      studentsContainer.innerHTML = "";
      showMessage("Error: " + (data.error || "No students"));
    }
  } catch (err) {
    studentsContainer.innerHTML = "";
    showMessage("Fetch error: " + err.message);
  }
}

function renderStudents(students) {
  studentsContainer.innerHTML = "";
  if (!students || students.length === 0) {
    studentsContainer.innerHTML = "<i>No students found.</i>";
    return;
  }
  students.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `
      <div class="index">${idx + 1}.</div>
      <div class="name"><strong>${escapeHtml(s.name)}</strong><div class="reg">${escapeHtml(s.regNo)}</div></div>
      <div class="sel">
        <select data-reg="${escapeHtml(s.regNo)}" data-name="${escapeHtml(s.name)}" aria-label="Attendance status for ${escapeHtml(s.name)}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>
      </div>
    `;
    studentsContainer.appendChild(row);
  });
}

function setAllStatus(val) {
  const selects = studentsContainer.querySelectorAll("select");
  selects.forEach(s => (s.value = val));
}

async function submitAttendance() {
  const cls = classSelect.value;
  if (!cls) return showMessage("Choose class first");
  const teacher = teacherInput.value.trim();
  if (!teacher) return showMessage("Enter teacher name before submitting");

  const selects = studentsContainer.querySelectorAll("select");
  if (!selects.length) return showMessage("Load students first");

  const attendance = Array.from(selects).map(s => ({
    regNo: s.getAttribute("data-reg"),
    name: s.getAttribute("data-name"),
    status: s.value,
  }));

  const payload = { date: dateInput.value, className: cls, teacher, attendance };

  try {
    showMessage("Submitting...");
    // POST to web app
    const res = await fetch(`${WEB_APP_URL}?action=submitAttendance`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      showMessage(`Submitted successfully — rows inserted: ${data.inserted}`);
    } else {
      showMessage("Submit failed: " + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    showMessage("Submit error: " + err.message);
  }
}

function showMessage(txt) {
  message.textContent = txt;
}

function escapeHtml(s) {
  if (!s) return "";
  return s.toString().replace(/[&<>"'`=\/]/g, c =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;","`":"&#96;","=":"&#61;"}[c])
  );
}
