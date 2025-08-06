const API_KEY = "AIzaSyCFVED1V4gDZcXeqn6Xsn2MKoSZeFHsaRc";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzEML8aNVv-ePKjfFkuqG_A8wS82xwg5vvL9UOGiNC8lxX01b_WlCRI2bN-nSwLEGfJTw/exec";

const classTabs = ["6th", "7th", "8th"]; // Add more if needed

const classSelect = document.getElementById("classSelect");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const submitBtn = document.getElementById("submitBtn");
const attendanceDate = document.getElementById("attendanceDate");

// ✅ Populate Class Dropdown
classTabs.forEach(cls => {
  const option = document.createElement("option");
  option.value = cls;
  option.textContent = cls;
  classSelect.appendChild(option);
});

// ✅ Load Students When Class Selected
classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  if (!selectedClass) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${selectedClass}?key=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      studentsTableBody.innerHTML = "";

      const rows = data.values;
      if (!rows || rows.length < 2) {
        studentsTableBody.innerHTML = "<tr><td colspan='3'>No data found</td></tr>";
        return;
      }

      rows.slice(1).forEach(row => {
        const [regNo, name] = row;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${regNo}</td>
          <td>${name}</td>
          <td>
            <select>
              <option value="Present">Present</option>
