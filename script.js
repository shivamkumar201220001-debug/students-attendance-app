// ==== CONFIG ====
// 1) After deploying the Apps Script as a Web App, paste URL below:
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwpiSawCPSZV0vDuG_wQ9PzWzYIbBIiE-A7aEVH1yiKlgdmkGxJRbsc1ByhWc9EOckS/exec"; // e.g. https://script.google.com/macros/s/AKfycb.../exec

// ==== UTIL ====
const $ = (sel) => document.querySelector(sel);
const fmtDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2600);
}

// ==== INIT ====
window.addEventListener('DOMContentLoaded', async () => {
  // default date = today
  $('#dateInput').value = fmtDate(new Date());
  await loadClasses();
  bindEvents();
});

function bindEvents() {
  $('#reloadBtn').addEventListener('click', loadStudents);
  $('#classSelect').addEventListener('change', loadStudents);
  $('#markAllBtn').addEventListener('click', markAllPresent);
  $('#submitBtn').addEventListener('click', submitAttendance);
}

async function loadClasses() {
  try {
    setLoading(true);
    const url = `${WEB_APP_URL}?action=classes`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    const classes = data.classes || [];
    const sel = $('#classSelect');
    sel.innerHTML = '';
    if (classes.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No classes found';
      sel.appendChild(opt);
      toast('No classes found. Check your Sheet tab names.');
      return;
    }
    classes.forEach(cn => {
      const opt = document.createElement('option');
      opt.value = cn;
      opt.textContent = cn;
      sel.appendChild(opt);
    });
    await loadStudents();
  } catch (e) {
    console.error(e);
    toast('Failed to load classes');
  } finally {
    setLoading(false);
  }
}

async function loadStudents() {
  const className = $('#classSelect').value;
  if (!className) return;
  try {
    setLoading(true);
    const url = `${WEB_APP_URL}?action=students&class=${encodeURIComponent(className)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    const students = data.students || [];
    const tbody = $('#studentsTbody');
    tbody.innerHTML = '';
    students.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${s.regNo || ''}</td>
        <td>${s.name || ''}</td>
        <td>
          <select class="status">
            <option value="Present" selected>Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </td>
      `;
      tr.dataset.regNo = s.regNo || '';
      tr.dataset.name = s.name || '';
      tbody.appendChild(tr);
    });
    $('#countBadge').textContent = `${students.length} students`;
    $('#tableWrap').classList.toggle('hidden', students.length === 0);
    if (students.length === 0) toast('No students in this class tab.');
  } catch (e) {
    console.error(e);
    toast('Failed to load students');
  } finally {
    setLoading(false);
  }
}

function markAllPresent() {
  document.querySelectorAll('select.status').forEach(sel => {
    sel.value = 'Present';
  });
  toast('All marked Present');
}

async function submitAttendance() {
  const className = $('#classSelect').value;
  const dateVal = $('#dateInput').value;
  if (!WEB_APP_URL || WEB_APP_URL.includes('PASTE_YOUR_WEB_APP_URL_HERE')) {
    toast('Please set WEB_APP_URL in script.js');
    return;
  }
  if (!className) { toast('Select a class'); return; }
  if (!dateVal) { toast('Select a date'); return; }

  const rows = Array.from(document.querySelectorAll('#studentsTbody tr'));
  const records = rows.map(r => ({
    date: dateVal,
    class: className,
    regNo: r.dataset.regNo || '',
    name: r.dataset.name || '',
    status: r.querySelector('select.status').value
  }));

  if (records.length === 0) { toast('No students to submit'); return; }

  try {
    setLoading(true);
    toggleSubmit(true);
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    const data = await res.json();
    if (data.success) {
      toast(`Saved ✅ (${data.saved || records.length})`);
    } else {
      toast('Save failed');
    }
  } catch (e) {
    console.error(e);
    toast('Save error');
  } finally {
    toggleSubmit(false);
    setLoading(false);
  }
}

function toggleSubmit(disabled) {
  const btn = $('#submitBtn');
  btn.disabled = disabled;
  btn.textContent = disabled ? 'Saving…' : 'Submit Attendance';
}

function setLoading(isLoading) {
  $('#reloadBtn').disabled = isLoading;
  $('#classSelect').disabled = isLoading;
  $('#markAllBtn').disabled = isLoading;
}

// End of script.js
