// ==== script.js ====
// 1) Replace with your deployed Apps Script Web App URL:
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3Z3IL_ruQrIShe1yP8s7XQdw0WWUHHjUvxKC6xOO0l6jdfd0hcb6GzX_5A5BSxPNf/exec";

// 2) Also include the other Sheet ID + API key you asked to keep:
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY  = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";

// 3) Exact classes
const CLASS_LIST = [
  "8th","9th","9th (2)","10th","10th(P2)",
  "11th JEE (Morning)","11th JEE (Evening)","11th NEET (Morning)","11th NEET (Evening)",
  "12th NEET (Morning)","12th NEET (Evening)","12th JEE (Morning)","12th JEE (Evening)",
  "DROPPER JEE","DROPPER NEET","DROPPER NEET(P2)"
];

const classSelect = document.getElementById("classSelect");
const loadBtn = document.getElementById("loadBtn");
const submitBtn = document.getElementById("submitBtn");
const tbody = document.querySelector("#attendanceTable tbody");
const msg = document.getElementById("msg");

// populate classes
CLASS_LIST.forEach(c => {
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  classSelect.appendChild(o);
});
if (classSelect.options.length) classSelect.selectedIndex = 0;

function setMsg(t, isErr = false) {
  msg.textContent = t || "";
  msg.style.color = isErr ? "#d32f2f" : "#333";
}

function escapeHtml(text) {
  if (!text && text !== 0) return "";
  return String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Primary load: prefer backend WEB_APP_URL for students. If not set, fallback to Google Sheets API (read-only).
async function loadStudents() {
  const className = classSelect.value;
  if (!className) { alert("Please select a class"); return; }
  setMsg("Loading…");
  tbody.innerHTML = "";
  try {
    if (WEB_APP_URL && WEB_APP_URL.includes("script.google.com")) {
      // Use Apps Script backend to get students
      const res = await fetch(`${WEB_APP_URL}?action=getStudents&class=${encodeURIComponent(className)}`);
      if (!res.ok) throw new Error("Network error " + res.status);
      const students = await res.json();
      if (students.error) throw new Error(students.error || "Load failed");
      renderStudents(students);
      setMsg("Loaded " + students.length + " students");
    } else {
      // Fallback: use Sheets API (read-only). Note: sheet must be shared appropriately.
      const range = `${encodeURIComponent(className)}!A2:B500`; // read A and B
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Sheets API error " + res.status);
      const json = await res.json();
      const values = json.values || [];
      const students = values.map(r => ({ regNo: r[0] || "", name: r[1] || "" }));
      renderStudents(students);
      setMsg("Loaded " + students.length + " students (via Sheets API)");
    }
  } catch (err) {
    console.error(err);
    setMsg("Error: " + (err.message || err), true);
  }
}

function renderStudents(students) {
  tbody.innerHTML = "";
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="4">No students found</td></tr>`;
    return;
  }
  students.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.regNo)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>
        <select class="attSelect">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </td>
      <td class="result"></td>
    `;
    tbody.appendChild(tr);
  });
}

async function submitAttendance() {
  const className = classSelect.value;
  if (!className) { alert("Select class first"); return; }
  const rows = Array.from(tbody.querySelectorAll("tr"));
  if (!rows.length) { alert("No students to submit"); return; }

  const data = rows.map(r => {
    const regNo = r.cells[0].textContent.trim();
    const name = r.cells[1].textContent.trim();
    const status = r.querySelector(".attSelect").value;
    return { regNo, name, status };
  });

  if (!confirm("Submit attendance for " + className + " ?")) return;

  setMsg("Saving…");
  submitBtn.disabled = true;
  try {
    // Must use your Apps Script Web App URL for saving (backend writes to SPREADSHEET_ID in Code.gs)
    if (!WEB_APP_URL || !WEB_APP_URL.includes("script.google.com")) {
      throw new Error("Please set WEB_APP_URL to your deployed Apps Script Web App URL (in script.js).");
    }

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitAttendance", sheet: className, data: data })
    });
    if (!res.ok) throw new Error("Network error " + res.status);
    const result = await res.json();
    if (!result || result.success !== true) {
      throw new Error(result && result.error ? result.error : "Save failed");
    }
    rows.forEach(r => r.querySelector(".result").textContent = "✓ Saved");
    setMsg("Saved ✓ (" + (result.saved || data.length) + ")");
  } catch (err) {
    console.error(err);
    rows.forEach(r => r.querySelector(".result").textContent = "Error");
    setMsg("Error: " + (err.message || err), true);
  } finally {
    submitBtn.disabled = false;
  }
}

// events
document.getElementById("loadBtn").addEventListener("click", loadStudents);
document.getElementById("submitBtn").addEventListener("click", submitAttendance);
