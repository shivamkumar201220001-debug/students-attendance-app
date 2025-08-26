function loadStudents() {
  const className = document.getElementById("classSelect").value;
  if (!className) {
    alert("Please select a class!");
    return;
  }

  google.script.run.withSuccessHandler(function(students) {
    const form = document.getElementById("attendanceForm");
    form.innerHTML = "";

    if (students.length === 0) {
      form.innerHTML = "<p>No students found for this class.</p>";
      return;
    }

    document.getElementById("studentsSection").style.display = "block";

    students.forEach(stu => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${stu.regNo} - ${stu.name}</label>
        <select id="status-${stu.regNo}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      `;
      form.appendChild(div);
    });
  }).getStudents(className);
}

function submitAttendance() {
  const teacherName = document.getElementById("teacherName").value.trim();
  const className = document.getElementById("classSelect").value;

  if (!teacherName || !className) {
    alert("Please enter teacher name and select class.");
    return;
  }

  google.script.run.withSuccessHandler(function(students) {
    const attendanceList = students.map(stu => {
      const status = document.getElementById("status-" + stu.regNo).value;
      return {
        regNo: stu.regNo,
        name: stu.name,
        status: status
      };
    });

    google.script.run.withSuccessHandler(function(msg) {
      alert(msg);
      document.getElementById("studentsSection").style.display = "none";
    }).submitAttendance(className, teacherName, attendanceList);

  }).getStudents(className);
}
