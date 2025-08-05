const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzEML8aNVv-ePKjfFkuqG_A8wS82xwg5vvL9UOGiNC8lxX01b_WlCRI2bN-nSwLEGfJTw/exec";

const classSelect = document.getElementById("classSelect");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const submitBtn = document.getElementById("submitBtn");

const attendanceDate = document.getElementById("attendanceDate");

// Add your class names here
const classes = [
  "8th", "9th 1st", "9th 2nd", "10th 1st", "10th 2nd",
  "11th JEE Morning", "11th JEE Evening", "11th NEET Morning", "11th NEET Evening",
  "12th JEE Morning", "12th JEE Evening", "12th NEET Morning", "12th NEET Evening",
  "Dropper NEET", "Dropper NEET 2.0"
];

classes.forEach(cls => {
  const option = document.createElement("option");
  option.value = cls;
  option.textContent = cls;
  classSelect.appendChild(option);
});

classSelect.addEventListener("change", async () => {
  const selectedClass = classSelect.value;
  if (!selectedClass) return;

  const res = await fetch(`${WEB_APP_URL}?className=${encodeURIComponent(selectedClass)}`);
  const data = await res.json();

  studentsTableBody.innerHTML = "";

  data.forEach(student => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${student.reg}</td>
      <td>${student.name}</td>
      <td>
        <select>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </td>
    `;

    studentsTableBody.appendChild(tr);
  });
});

submitBtn.addEventListener("click", async () => {
  const selectedClass = classSelect.value;
  const selectedDate = attendanceDate.value;

  if (!selectedClass || !selectedDate) {
    alert("Please select class and date.");
    return;
  }

  const rows = studentsTableBody.querySelectorAll("tr");
  const attendanceData = [];

  rows.forEach(row => {
    const regNo = row.children[0].textContent;
    const name = row.children[1].textContent;
    const attendance = row.children[2].querySelector("select").value;

    attendanceData.push({
      cls: selectedClass,
      reg: regNo,
      name: name,
      attendance: attendance
    });
  });

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(attendanceData),
      headers: { "Content-Type": "application/json" }
    });

    const text = await res.text();
    alert(text);
  } catch (err) {
    console.error(err);
    alert("Error submitting attendance.");
  }
});
