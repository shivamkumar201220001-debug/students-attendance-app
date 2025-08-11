const API_KEY = "AIzaSyBZbdgXYIDzotRfsGe3Kw6bhTkrU1nrpfA";
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI"
const SHEET_ID = "1qeHqI_WgkE7mmsWs1vwOQnKvtXojoH-TVXaQ0FcVMLI";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const action = (e.parameter.action || "").toLowerCase();

    if (action === "classes") {
      // return sheet names as class list (exclude 'Attendance' or hidden system sheets)
      const sheets = ss.getSheets().map(s => s.getName()).filter(n => n.toLowerCase() !== "attendance" && n.toLowerCase() !== "config");
      return jsonResponse({ success: true, classes: sheets });
    }

    if (action === "students") {
      const className = e.parameter.class;
      if (!className) return jsonResponse({ success: false, error: "class parameter missing" });

      const sheet = ss.getSheetByName(className);
      if (!sheet) return jsonResponse({ success: false, error: "class sheet not found: " + className });

      // assume columns: Reg No | Name (first two columns). We'll read all rows with data.
      const data = sheet.getDataRange().getValues();
      // skip header if present (detect if first row contains "Reg" or "Reg No" or "Name")
      let start = 0;
      const header = data[0] ? data[0].map(String).join(" ").toLowerCase() : "";
      if (header.includes("reg") || header.includes("reg no") || header.includes("name")) start = 1;

      const students = [];
      for (let i = start; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const reg = row[0] === "" || row[0] == null ? "" : String(row[0]).trim();
        const name = row[1] === "" || row[1] == null ? "" : String(row[1]).trim();
        if (reg === "" && name === "") continue;
        students.push({ regNo: reg, name: name });
      }
      return jsonResponse({ success: true, students: students });
    }

    // default: return simple message
    return jsonResponse({ success: true, message: "Students Attendance Web API" });

  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    // expected payload: { date: "YYYY-MM-DD", class: "X", teacher: "TeacherName", attendance: [{regNo,name,status}, ...] }
    if (!payload || !payload.class || !payload.attendance) {
      return jsonResponse({ success: false, error: "invalid payload" });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let attendanceSheet = ss.getSheetByName("Attendance");
    if (!attendanceSheet) {
      // create Attendance sheet with header
      attendanceSheet = ss.insertSheet("Attendance");
      attendanceSheet.appendRow(["Timestamp","Date","Class","Teacher","Reg No","Student Name","Status","Note"]);
    }

    const date = payload.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const className = payload.class;
    const teacher = payload.teacher || "";
    const note = payload.note || "";

    const rows = [];
    const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    payload.attendance.forEach(a => {
      rows.push([ts, date, className, teacher, a.regNo || "", a.name || "", a.status || "", note]);
    });

    if (rows.length > 0) {
      attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    return jsonResponse({ success: true, inserted: rows.length });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

// helper to return JSON response
function jsonResponse(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
