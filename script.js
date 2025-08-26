// ⚠️ Apna Google Apps Script Web App URL yaha daalo
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxD27iAFsvdszc4IMO3EmIg1eK80shgpuF3EN85YKu9DZZ8nSUxodLXVrv8J9In2rhtLg/exec";

async function loadStudents() {
  const className = document.getElementById("classSelect").value;
  const teacher = document.getElementById("teacherName").value.trim();

  if (!teacher) {
    alert("Please enter Teacher Name");
    return;
  }

  if (!className) {
    alert("Please select a class");
    return;
  }

  try {
    const res = await fetch(`${WEB_APP_URL}?class=${encodeURIComponent(className)}`);
    const data = await res.json();

    const container = document.getElementById("studentsContainer");
    container.innerHTML = "";

    if (!data.students || data.students.length === 0) {
      container.innerHTML = "<p>No students found for this class.</p>";
      return;
    }

    data.students.forEach(st => {
      const div = document.createElement("div");
      div.className = "student";
      div.innerHTML = `
        <span>${st.regNo} - ${st.name}</span>
        <div class="status">
          <select data-reg="${st.regNo}">
            <option value="P">Present</option>
            <option value="A">Absent</option>
          </select>
        </div>
      `;
      container.appendChild(div);
    });

    document.getElementById("saveBtn").style.display = "block";
  } catch (err) {
    alert("Error loading students: " + err);
  }
}

async function submitAttendance() {
  const className = document.getElementById("classSelect").value;
  const teacher = document.getElementById("teacherName").value.trim();
  const date = new Date();

  const selects = document.querySelectorAll("#studentsContainer select");
  const entries = Array.from(selects).map(sel => ({
    regNo: sel.getAttribute("data-reg"),
    status: sel.value
  }));

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({
        className,
        teacher,
        date,
        entries
      })
    });
    const result = await res.json();

    if (result.ok) {
      alert("Attendance saved successfully!");
    } else {
      alert("Error: " + JSON.stringify(result));
    }
  } catch (err) {
    alert("Failed to save: " + err);
  }
}

// ⚡ Classes ko hardcode karo ya backend se bhi fetch kar sakte ho
window.onload = () => {
  const classes = ["8th", "9th 1st", "9th 2nd", "10th 1st", "10th 2nd", "11th JEE Morning", "11th JEE Evening"];
  const select = document.getElementById("classSelect");
  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
};
