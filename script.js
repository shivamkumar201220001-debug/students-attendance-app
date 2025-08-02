const API_KEY = "AIzaSyCFVED1V4gDZcXeqn6Xsn2MKoSZeFHsaRc";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEdtjXSBGfPBmFgmAY5uEdsT5VFcfAByBiTLopDj2l/dev";

// ✅ Correct class mapping
const classMap = {
  "8th": "8th",
  "9th 1st": "9th 1st",
  "9th 2nd": "9th 2nd",
  "10th 1st": "10th 1st",
  "10th 2nd": "10th 2nd",
  "11th JEE Morning": "11th JEE Morning",
  "11th JEE Evening": "11th JEE Evening",
  "11th NEET Morning": "11th NEET Morning",
  "11th NEET Evening": "11th NEET Evening",
  "12th JEE Morning": "12th JEE Morning",
  "12th JEE Evening": "12th JEE Evening",
  "12th NEET Morning": "12th NEET Morning",
  "12th NEET Evening": "12th NEET Evening",
  "Dropper NEET 1.0": "Dropper NEET 1.0",
  "Dropper NEET 2.0": "Dropper NEET 2.0",
  "Dropper JEE": "Dropper JEE"
};


// ✅ Populate classSelect dropdown
const classSelect = document.getElementById("classSelect");
classSelect.innerHTML = '<option value="">-- Select Class --</option>';
Object.keys(classMap).forEach(shortName => {
  const option = document.createElement("option");
  option.value = shortName;
  option.textContent = shortName;
  classSelect.appendChild(option);
});

// ✅ Fetch from correct sheet/tab name
document.getElementById("classSelect").addEventListener("change", function () {
  const selectedClass = this.value;
  const sheetTab = classMap[selectedClass];  // Convert to actual sheet/tab name

  fetch(https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/'${sheetTab}'?key=${API_KEY})
  .then((res) => res.json())
    .then((data) => {
      const rows = data.values;
      if (!rows || rows.length < 2) {
        document.getElementById("studentsContainer").innerHTML = "<p>No data found.</p>";
        return;
      }

      let html = "<table><tr><th>Reg No</th><th>Name</th><th>Attendance</th></tr>";
      for (let i = 1; i < rows.length; i++) {
        const [reg, name] = rows[i];
        html += 
          <tr>
            <td>${reg}</td>
            <td>${name}</td>
            <td>
              <select class="attendance" data-reg="${reg}" data-name="${name}">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </td>
          </tr>;
      }
      html += "</table>";
      document.getElementById("studentsContainer").innerHTML = html;
      document.getElementById("submitBtn").style.display = "inline-block";
    });
});
