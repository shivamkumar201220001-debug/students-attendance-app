const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const API_KEY = "AIzaSyBoQWKF1OjHI-rDK7BjFZHmhCyxvEx5XS8";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxkcJYJ39fKJWOlZeLsLd3-Hf5tvxoLhlBzrPXqd9WBv7l93b9Lx5Iw5YVrxkjGE2hPZw/exec";

const CLASSES = [
  "8th", "9th", "9th 2nd", "10th", "10th 2nd",
  "11th JEE Morning", "11th JEE Evening", "11th NEET Morning", "11th NEET Evening",
  "12th JEE Morning", "12th JEE Evening", "12th NEET Morning", "12th NEET Evening",
  "Dropper NEET", "Dropper NEET 2.0", "Dropper JEE"
];

// DOM
const classSelect = document.getElementById('classSelect');
const loadBtn = document.getElementById('loadBtn');
const studentsArea = document.getElementById('studentsArea');
const dateInput = document.getElementById('dateInput');
const teacherName = document.getElementById('teacherName');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

// Populate classes
CLASSES.forEach(c => {
  const opt = document.createElement('option'); opt.value = c; opt.textContent = c; classSelect.appendChild(opt);
});

// Date default (MM/DD/YYYY)
function formatDateMMDDYYYY(d){
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}
dateInput.value = formatDateMMDDYYYY(new Date());

// Load students from sheet (reads columns A (Reg No) and B (Name))
async function loadStudents(){
  const sheetName = encodeURIComponent(classSelect.value);
  const range = `${sheetName}!A2:B`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  statusDiv.textContent = 'Loading students...';
  studentsArea.innerHTML = '';
  try{
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];
    if(values.length === 0){ statusDiv.textContent = 'No students found on sheet for this class.'; return; }

    // build UI
    values.forEach(row => {
      const reg = row[0] || '';
      const name = row[1] || '';
      const div = document.createElement('div'); div.className='student-row';
      const regDiv = document.createElement('div'); regDiv.className='reg'; regDiv.textContent = reg;
      const nameDiv = document.createElement('div'); nameDiv.className='name'; nameDiv.textContent = name;
      const sel = document.createElement('select');
      ['P','A',' '].forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent = v===' ' ? 'Select' : (v==='P' ? 'Present' : 'Absent'); sel.appendChild(o); });
      sel.value = ' ';
      sel.dataset.reg = reg;
      div.appendChild(regDiv); div.appendChild(nameDiv); div.appendChild(sel);
      studentsArea.appendChild(div);
    });
    statusDiv.textContent = `Loaded ${values.length} students.`;
  }catch(err){
    console.error(err); statusDiv.textContent = 'Error loading students: ' + err.message;
  }
}

loadBtn.addEventListener('click', loadStudents);

// Submit attendance
submitBtn.addEventListener('click', async ()=>{
  const teacher = teacherName.value.trim();
  if(!teacher){ alert('Please enter teacher name'); return; }
  const date = dateInput.value;
  const selects = Array.from(document.querySelectorAll('.student-row select'));
  const attendance = selects.map(s => ({ reg: s.dataset.reg, status: s.value===' ' ? '' : s.value }));

  // Validate
  if(!attendance.length){ alert('No students loaded. Please load students for the selected class.'); return; }
  if(!attendance.some(a => a.status)){ if(!confirm('No student marked. Submit empty?')) return; }

  const payload = { date, class: classSelect.value, teacher, attendance };
  statusDiv.textContent = 'Submitting attendance...';
  try{
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    statusDiv.textContent = 'Response: ' + text;
  }catch(err){
    console.error(err); statusDiv.textContent = 'Submit failed: ' + err.message;
  }
});

// Auto-load students for first class on open
window.addEventListener('load', ()=>{ if(classSelect.options.length) { classSelect.selectedIndex = 0; loadStudents(); } });
