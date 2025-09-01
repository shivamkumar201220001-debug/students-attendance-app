/***** CONFIG *****/
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzyh7p2BodSAgHyR_pg8c0kIsskxCeYdcgYEzVhwzcW2j1EIlhAdo5ecxPql_zTmqrJEQ/exec"; // e.g., https://script.google.com/macros/s/XXX/exec

// teacher list (keep in sync with backend)
const TEACHERS = [
  'Suraj Agrawal',
  'Soniya',
  'Shivam Kumar',
  'Rahul Sharma',
  'Pankaj Sharma',
  'Khushboo Shukla',
  'Bheem Sain',
  'Beenu Sharma',
  'Arun Kumar',
  'Anil Kumar',
  'Jyoti Prasad'
];

/***** ELEMENTS *****/
const teacherSelect = document.getElementById('teacherSelect');
const classSelect = document.getElementById('classSelect');
const dateInput = document.getElementById('dateInput');
const loadBtn = document.getElementById('loadBtn');
const tableCard = document.getElementById('tableCard');
const studentsBody = document.getElementById('studentsBody');
const saveBtn = document.getElementById('saveBtn');
const metaTeacher = document.getElementById('metaTeacher');
const metaClass = document.getElementById('metaClass');
const metaDate = document.getElementById('metaDate');

/***** INIT *****/
(function init() {
  // teacher dropdown
  teacherSelect.innerHTML = `<option value="" disabled selected>Select teacher</option>` +
    TEACHERS.map(t => `<option value="${t}">${t}</option>`).join('');

  // default date today (YYYY-MM-DD)
  const today = new Date();
  dateInput.value = today.toISOString().slice(0,10);

  // load classes
  fetch(`${WEB_APP_URL}?action=getclasses`)
    .then(r => r.json())
    .then(d => {
      const classes = d.classes || [];
      classSelect.innerHTML = `<option value="" disabled selected>Select class</option>` +
        classes.map(c => `<option value="${c}">${c}</option>`).join('');
    })
    .catch(() => {
      classSelect.innerHTML = `<option value="" disabled selected>Could not load</option>`;
    });
})();

/***** EVENTS *****/
loadBtn.addEventListener('click', async () => {
  const teacher = teacherSelect.value;
  const className = classSelect.value;
  const dateISO = dateInput.value;

  if (!teacher || !className || !dateISO) {
    alert('Please select Teacher, Class and Date');
    return;
  }

  loadBtn.disabled = true;
  studentsBody.innerHTML = '';

  try {
    const res = await fetch(`${WEB_APP_URL}?action=getstudents&class=${encodeURIComponent(className)}`);
    const data = await res.json();
    const students = data.students || [];

    if (!students.length) {
      studentsBody.innerHTML = `<tr><td colspan="4">No students found for this class.</td></tr>`;
    } else {
      students.forEach(s => {
        const tr = document.createElement('tr');

        const tdReg = document.createElement('td');
        tdReg.textContent = s.regNo;

        const tdName = document.createElement('td');
        tdName.textContent = s.name;

        const tdClass = document.createElement('td');
        tdClass.textContent = s.class;

        const tdAtt = document.createElement('td');
        // Chip + select for color feedback
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = '—';

        const select = document.createElement('select');
        select.className = 'statusSelect';
        select.innerHTML = `
          <option value="">Select</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        `;

        select.addEventListener('change', () => {
          chip.classList.remove('present','absent');
          if (select.value === 'Present') {
            chip.textContent = 'Present';
            chip.classList.add('present');
          } else if (select.value === 'Absent') {
            chip.textContent = 'Absent';
            chip.classList.add('absent');
          } else {
            chip.textContent = '—';
          }
        });

        tdAtt.appendChild(select);
        tdAtt.appendChild(document.createTextNode(' '));
        tdAtt.appendChild(chip);

        tr.appendChild(tdReg);
        tr.appendChild(tdName);
        tr.appendChild(tdClass);
        tr.appendChild(tdAtt);
        studentsBody.appendChild(tr);
      });
    }

    tableCard.classList.remove('hidden');
    metaTeacher.textContent = `👩‍🏫 ${teacher}`;
    metaClass.textContent   = `🏫 ${className}`;
    metaDate.textContent    = `📅 ${dateISO}`;
  } catch (err) {
    alert('Failed to load students');
  } finally {
    loadBtn.disabled = false;
  }
});

saveBtn.addEventListener('click', async () => {
  const teacher = teacherSelect.value;
  const className = classSelect.value;
  const dateISO = dateInput.value;

  // gather records
  const rows = Array.from(studentsBody.querySelectorAll('tr'));
  const records = rows.map(r => {
    const tds = r.querySelectorAll('td');
    const regNo = (tds[0]?.textContent || '').trim();
    const select = r.querySelector('select.statusSelect');
    return { regNo, status: select?.value || '' };
  }).filter(x => x.regNo && (x.status === 'Present' || x.status === 'Absent'));

  if (!records.length) {
    alert('Please select attendance (Present/Absent) for at least one student.');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: className, teacher, date: dateISO, records })
    });
    const data = await res.json();

    if (data && data.ok) {
      alert(`Saved ${data.written} records to column #${data.column}.`);
    } else {
      alert(`Save failed: ${data?.error || 'Unknown error'}`);
    }
  } catch (err) {
    alert('Network error while saving.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Attendance';
  }
});
