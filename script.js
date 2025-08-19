// ---- CONFIG ----
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw3_8Y9_RON33ZXkLKyp8kVPUzF2F6hsSxDgS89gP1tziSB6XoTCUkWCATPJachI9txlQ/exec";
const FALLBACK_CLASSES = [
  "8th","9th","9th 2nd","10th","10th 2nd",
  "11th JEE Evening","11th JEE Morning","11th NEET Morning","11th NEET Evening",
  "12th JEE Morning","12th JEE Evening","12th NEET Morning","12th NEET Evening",
  "Dropper NEET","Dropper NEET 2.0","Dropper JEE"
];

// ---- HELPERS ----
const $ = s => document.querySelector(s);
function todayISO(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
function setStatus(msg, ok=true){ const el=$("#status"); el.textContent=msg; el.className="status "+(ok?"ok":"err"); }

// ---- LOAD CLASSES ----
async function loadClasses(){
  const sel = $("#classSelect");
  try{
    const res = await fetch(`${WEB_APP_URL}?action=getClasses`);
    const data = await res.json();
    if(!data.success || !Array.isArray(data.classes) || !data.classes.length) throw new Error("No classes from backend");
    sel.innerHTML = `<option value="">— Select Class —</option>` + data.classes.map(c=>`<option>${c}</option>`).join("");
  }catch(_){
    // fallback to your provided list
    sel.innerHTML = `<option value="">— Select Class —</option>` + FALLBACK_CLASSES.map(c=>`<option>${c}</option>`).join("");
  }
}

// ---- LOAD STUDENTS ----
async function loadStudents(){
  const cls = $("#classSelect").value;
  if(!cls){ $("#table tbody").innerHTML=""; return; }
  try{
    setStatus("Loading students…");
    const res = await fetch(`${WEB_APP_URL}?action=getStudents&class=`+encodeURIComponent(cls));
    const data = await res.json();
    if(!data.success) throw new Error(data.message||"Failed");
    const tbody = $("#table tbody");
    tbody.innerHTML = "";
    (data.students||[]).forEach(st=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${st.reg||""}</td>
        <td>${st.name||""}</td>
        <td>
          <select class="att">
            <option>Present</option>
            <option>Absent</option>
            <option>Leave</option>
            <option>Holiday</option>
          </select>
        </td>
      `;
      // attach for later
      tr.dataset.reg = st.reg||"";
      tr.dataset.name = st.name||"";
      $("#table tbody").appendChild(tr);
    });
    setStatus(`Loaded ${data.students.length} students`, true);
  }catch(err){
    setStatus("Error loading students: "+err.message, false);
  }
}

// ---- BULK SELECT ----
$("#bulk").addEventListener("change", (e)=>{
  const v = e.target.value;
  if(!v) return;
  document.querySelectorAll(".att").forEach(sel=> sel.value=v);
});

// ---- SUBMIT ----
async function submitAttendance(){
  const teacher = $("#teacher").value.trim();
  const cls = $("#classSelect").value;
  const date = $("#date").value;
  if(!cls) return setStatus("Please select a class", false);
  if(!date) return setStatus("Please select a date", false);
  if(!teacher) return setStatus("Please enter teacher name", false);

  const entries = Array.from(document.querySelectorAll("#table tbody tr")).map(tr => ({
    reg: tr.dataset.reg,
    name: tr.dataset.name,
    status: tr.querySelector("select").value
  }));

  try{
    setStatus("Saving attendance…");
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ date, className: cls, teacher, entries })
    });
    const data = await res.json();
    if(!data.success) throw new Error(data.message||"Failed");
    setStatus(`Saved ${data.saved} rows for ${cls} on ${data.date}`, true);
  }catch(err){
    setStatus("Submit failed: "+err.message, false);
  }
}

// ---- INIT ----
$("#date").value = todayISO();
loadClasses();
$("#classSelect").addEventListener("change", loadStudents);
$("#submit").addEventListener("click", submitAttendance);
