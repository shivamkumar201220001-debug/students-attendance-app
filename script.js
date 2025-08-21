const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwuDStRCwQXnM0r5ZxQ2o9ARYrmE-Sy2IjYnzmuEUosdlNZgsUCawMv5naeHIuZlCrkPA/exec";

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
  const opt = document.createElement('option'); 
  opt.value = c; 
  opt.textContent = c; 
  classSelect.appendChild(opt);
});

// Date default (MM/DD/YYYY)
function formatDateMMDDYYYY(d){
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}
dateInput.value = formatDateMMDDYYYY(new Date());

// Load students (via Apps Script GET)
async function loadStudents(){
  const sheetName = classSelect.value;
  statusDiv.textContent = 'Loading students...';
  studentsArea.innerHTML = '';
  try{
    const res = await fetch(`${WEB_APP_URL}?class=${encodeURIComponent(sheetName)}`);
    const data = await res.json();

    if(!data.length){ 
      statusDiv.textContent = 'No students found on sheet for this class.'; 
      return; 
    }

    // Build UI
    data.forEach(st => {
      const div = document.createElement('div'); div.className='student-row';
      const regDiv = document.createElement('div'); regDiv.className='reg'; regDiv.textContent = st.regNo;
      const nameDiv = document.createElement('div'); nameDiv.className='name'; nameDiv.textContent = st.name;
      const sel = document.createElement('select');
      ['','P','A'].forEach(v => { 
        const o=document.createElement('option'); 
        o.value=v; 
        o.textContent = v==='' ? 'Select' : (v==='P' ? 'Present' : 'Absent'); 
        sel.appendChild(o); 
      });
      sel.value = '';
      sel.dataset.reg = st.regNo;
      div.appendChild(regDiv); 
      div.appendChild(nameDiv); 
      div.appendChild(sel);
      studentsArea.appendChild(div);
    });
    statusDiv.textContent = `Loaded ${data.length} students.`;
  }catch(err){
    console.error(err); 
    statusDiv.textContent = 'Error loading students: ' + err.message;
  }
}

loadBtn.addEventListener('click', loadStudents);

// Submit attendance (via Apps Script POST)
submitBtn.addEventListener('click', async ()=>{
  const teacher = teacherName.value.trim();
  if(!teacher){ alert('Please enter teacher name'); return; }

  const date = dateInput.value;
  const selects = Array.from(document.querySelectorAll('.student-row select'));
  const attendance = selects.map(s => ({
    regNo: s.dataset.reg, 
    status: s.value || ''
  }));

  if(!attendance.length){ 
    alert('No students loaded. Please load students for the selected class.'); 
    return; 
  }

  const payload = { 
    className: classSelect.value, 
    date: date, 
    teacher: teacher, 
    attendance: attendance 
  };

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
    console.error(err); 
    statusDiv.textContent = 'Submit failed: ' + err.message;
  }
});

// Auto-load students for first class on open
window.addEventListener('load', ()=>{ 
  if(classSelect.options.length) { 
    classSelect.selectedIndex = 0; 
    loadStudents(); 
  } 
});
