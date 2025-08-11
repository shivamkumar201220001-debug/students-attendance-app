const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI"
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3DCszYDvnlNvEIY-U-UQwod5yoMHoLW8I91e6TurBTkhJyUWXJF0X6coQkJq3IhPPzw/exec";

const classSelect = document.getElementById("classSelect");
const loadBtn = document.getElementById("loadBtn");
const studentsContainer = document.getElementById("studentsContainer");
const allPresentBtn = document.getElementById("allPresentBtn");
const allAbsentBtn = document.getElementById("allAbsentBtn");
const submitBtn = document.getElementById("submitBtn");
const teacherInput = document.getElementById("teacherInput");
const dateInput = document.getElementById("dateInput");
const message = document.getElementById("message");

(async function init(){
  // set today's date
  dateInput.value = new Date().toISOString().slice(0,10);
  await loadClasses();
})();

async function loadClasses(){
  try {
    const res = await fetch(`${WEB_APP_URL}?action=classes`);
    const data = await res.json();
    if (data.success) {
      classSelect.innerHTML = `<option value="">-- choose class --</option>`;
      data.classes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        classSelect.appendChild(opt);
      });
    } else {
      showMessage("Failed to load classes: " + (data.error||""));
    }
  } catch (err) {
    showMessage("Error loading classes: " + err.message);
  }
}

loadBtn.addEventListener("click", loadStudents);
allPresentBtn.addEventListener("click", ()=> setAllStatus("Present"));
allAbsentBtn.addEventListener("click", ()=> setAllStatus("Absent"));
submitBtn.addEventListener("click", submitAttendance);

async function loadStudents(){
  const cls = classSelect.value;
  if (!cls) { showMessage("Please choose a class"); return; }
  studentsContainer.innerHTML = "Loading students...";
  try {
    const res = await fetch(`${WEB_APP_URL}?action=students&class=${encodeURIComponent(cls)}`);
    const data = await res.json();
    if (data.success) {
      renderStudents(data.students);
      showMessage(`Loaded ${data.students.length} students`);
    } else {
      studentsContainer.innerHTML = "";
      showMessage("Error: " + (data.error||"unknown"));
    }
  } catch (err) {
    studentsContainer.innerHTML = "";
    showMessage("Fetch error: " + err.message);
  }
}

function renderStudents(students) {
  studentsContainer.innerHTML = "";
  if (!students || students.length === 0) {
    studentsContainer.innerHTML = "<i>No students found in this class.</i>";
    return;
  }
  students.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `
      <div class="sr-no">${idx+1}.</div>
      <div class="name"><strong>${escapeHtml(s.name)}</strong><div style="font-size:12px;color:#666">${escapeHtml(s.regNo)}</div></div>
      <div class="status">
        <select data-reg="${escapeHtml(s.regNo)}" data-name="${escapeHtml(s.name)}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="NA">NA</option>
        </select>
      </div>
    `;
    studentsContainer.appendChild(row);
  });
}

function setAllStatus(status) {
  const selects = studentsContainer.querySelectorAll("select");
  selects.forEach(s => s.value = status);
}

async function submitAttendance(){
  const cls = classSelect.value;
  if (!cls) { showMessage("Choose class first"); return; }
  const teacher = teacherInput.value.trim();
  if (!teacher) { showMessage("Enter teacher name or ID"); return; }

  const selects = studentsContainer.querySelectorAll("select");
  if (!selects || selects.length === 0) { showMessage("No students loaded to submit"); return; }

  const attendance = [];
  selects.forEach(s => {
    attendance.push({
      regNo: s.getAttribute("data-reg"),
      name: s.getAttribute("data-name"),
      status: s.value
    });
  });

  const payload = {
    date: dateInput.value,
    class: cls,
    teacher: teacher,
    attendance: attendance,
    note: ""
  };

  try {
    showMessage("Submitting...");
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showMessage(`Attendance submitted. Rows inserted: ${data.inserted}`);
    } else {
      showMessage("Submit failed: " + (data.error||"unknown"));
    }
  } catch (err) {
    showMessage("Submit error: " + err.message);
  }
}

function showMessage(txt){
  message.textContent = txt;
}

function escapeHtml(s){
  if (!s) return "";
  return s.replace(/[&<>"'`=\/]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','`':'&#96;','=':'&#61;'}[c]; });
}
