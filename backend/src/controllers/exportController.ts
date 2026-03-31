import { Response } from "express";
import PDFDocument from "pdfkit";
import { AuthenticatedRequest } from "../middleware/auth";
import { entriesCollection, reportsCollection } from "../services/firestoreService";
import { getSchemasConfig, getSectionsConfig } from "../services/configService";

const PAGE_LEFT = 40;
const PAGE_WIDTH = 515; // A4 595pt - 40pt margin each side
const PAGE_BOTTOM = 800;
const CELL_PADDING = 5;
const MIN_ROW_HEIGHT = 22;

type ColDef = { key: string; label: string; width: number };

// â”€â”€â”€ Column definitions per section (widths must sum to PAGE_WIDTH=515) â”€â”€â”€
const SECTION_COLUMNS: Record<string, ColDef[]> = {
  "general-points": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "description", label: "Description", width: 475 },
  ],
  "faculty-joined-relieved": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "facultyName", label: "Name of the Faculty", width: 115 },
    { key: "department", label: "Department", width: 80 },
    { key: "designation", label: "Designation", width: 95 },
    { key: "dateOfJoining", label: "Date of Joining", width: 95 },
    { key: "dateOfRelieving", label: "Date of Relieving", width: 90 },
  ],
  "faculty-achievements": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "facultyName", label: "Name of the Faculty Member (S)", width: 120 },
    { key: "department", label: "Department", width: 80 },
    { key: "details", label: "Details of the Achievement", width: 185 },
    { key: "date", label: "Date", width: 90 },
  ],
  "student-achievements": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "studentName", label: "Name of the Student (S)", width: 110 },
    { key: "rollNo", label: "Roll. No", width: 80 },
    { key: "department", label: "Department", width: 80 },
    { key: "details", label: "Details of Achievement", width: 120 },
    { key: "date", label: "Date", width: 85 },
  ],
  "department-achievements": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "details", label: "Details of Achievement", width: 340 },
    { key: "date", label: "Date", width: 135 },
  ],
  "faculty-events": [
    { key: "sno", label: "S. No", width: 30 },
    { key: "eventName", label: "Name of the Event\n(Workshop / FDP\nSTTPs)", width: 90 },
    { key: "department", label: "Department", width: 65 },
    { key: "resourcePerson", label: "Details of Resource Person / Guest Invited\n(Or mention No. of Resource Persons in case of FDP/PDP etc)", width: 115 },
    { key: "coordinatorName", label: "Name of the\nCoordinator", width: 85 },
    { key: "facultyParticipated", label: "No. of Faculty\nParticipated", width: 60 },
    { key: "dateRange", label: "Date (s)\n(From â€“ To)", width: 70 },
  ],
  "student-events": [
    { key: "sno", label: "S. No", width: 30 },
    { key: "eventName", label: "Name of the\n(Workshop / Event /\nGuest Lecture -\nTopic Name)", width: 90 },
    { key: "department", label: "Department", width: 65 },
    { key: "resourcePerson", label: "Details of Resource Person / Guest Invited", width: 100 },
    { key: "coordinatorName", label: "Name of the\nCoordinator", width: 85 },
    { key: "studentsParticipated", label: "No. of\nStudents\nParticipated", width: 60 },
    { key: "dateRange", label: "Date (s)\n(From â€“ To)", width: 85 },
  ],
  "non-technical-events": [
    { key: "sno", label: "S. No", width: 30 },
    { key: "eventName", label: "Name of the Event", width: 95 },
    { key: "department", label: "Department", width: 65 },
    { key: "resourcePerson", label: "Details of Resource Person / Guest Invited", width: 100 },
    { key: "coordinatorName", label: "Name of the\nCoordinator", width: 85 },
    { key: "studentsParticipated", label: "No. of\nStudents\nParticipated", width: 60 },
    { key: "dateRange", label: "Date(s)\n(From â€“ To)", width: 80 },
  ],
  "industry-visits": [
    { key: "sno", label: "S.\nNo", width: 40 },
    { key: "industryName", label: "Name of the Industry and Location", width: 140 },
    { key: "department", label: "Department", width: 80 },
    { key: "coordinatorName", label: "Name of the Coordinator", width: 100 },
    { key: "studentsParticipated", label: "No. of Students Participated", width: 80 },
    { key: "dateRange", label: "Date(s) (From â€“ To)", width: 75 },
  ],
  "hackathon-participation": [
    { key: "sno", label: "S.\nNo", width: 40 },
    { key: "eventName", label: "Name of the Event / Hackathon", width: 120 },
    { key: "conductedBy", label: "Conducted by", width: 105 },
    { key: "mentorDetails", label: "Mentor Details", width: 90 },
    { key: "studentsParticipated", label: "No. of Students Participated", width: 80 },
    { key: "dateRange", label: "Date(s) (From â€“ To)", width: 80 },
  ],
  "faculty-certifications": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "facultyName", label: "Name of the Faculty Member (s)", width: 110 },
    { key: "department", label: "Department", width: 80 },
    { key: "workshopName", label: "Name of the Workshop / FDP / Certification etc", width: 130 },
    { key: "organizedBy", label: "Organized by", width: 80 },
    { key: "dateRange", label: "Date (s)\n(From â€“ To)", width: 75 },
  ],
  "faculty-visits": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "facultyName", label: "Name of the Faculty Member (s)", width: 120 },
    { key: "department", label: "Department", width: 80 },
    { key: "visitedPlace", label: "Name of the Colleges / Industry etc Visited â€“ Location", width: 200 },
    { key: "dateRange", label: "Date (s)\n(From â€“ To)", width: 75 },
  ],
  patents: [
    { key: "sno", label: "S. No", width: 40 },
    { key: "facultyName", label: "Name of the Faculty Member (s)", width: 130 },
    { key: "patentTitle", label: "Patent Title", width: 155 },
    { key: "applicationNo", label: "Application .No", width: 100 },
    { key: "publicationDate", label: "Publication Date", width: 90 },
  ],
  // vedic-programs handled separately with two sub-tables
  placements: [
    { key: "sno", label: "S. No", width: 40 },
    { key: "companyName", label: "Name of the Company", width: 150 },
    { key: "department", label: "Department", width: 110 },
    { key: "studentsPlaced", label: "No. of Students Placed", width: 115 },
    { key: "package", label: "Package", width: 100 },
  ],
  mous: [
    { key: "sno", label: "S. No", width: 40 },
    { key: "organizationName", label: "Name of the Organization with whom MoU was signed", width: 150 },
    { key: "signingDate", label: "Date of Signing MoU", width: 90 },
    { key: "validity", label: "Validity", width: 80 },
    { key: "purpose", label: "Purpose of MoU\n(Main Point)", width: 155 },
  ],
  "skill-development-programs": [
    { key: "sno", label: "S. No", width: 40 },
    { key: "programName", label: "Name of the Program", width: 100 },
    { key: "facultyCoordinator", label: "Faculty Coordinator", width: 100 },
    { key: "topicAndFaculty", label: "Topic and Faculty Handled", width: 145 },
    { key: "students", label: "No. of\nStudents", width: 70 },
    { key: "sessions", label: "No. of\nSessions", width: 60 },
  ],
};

const VEDIC_STUDENTS_COLS: ColDef[] = [
  { key: "sno", label: "S. No", width: 35 },
  { key: "programName", label: "Name of the Program", width: 130 },
  { key: "department", label: "Department", width: 80 },
  { key: "participants", label: "No. of Students Participated", width: 90 },
  { key: "dateRange", label: "Date (s) (From â€“ To)", width: 90 },
  { key: "vedicCenter", label: "VEDIC Hyd /\nVEDIC B'lore", width: 90 },
];

const VEDIC_FACULTY_COLS: ColDef[] = [
  { key: "sno", label: "S. No", width: 35 },
  { key: "facultyName", label: "Name of the Faculty Member (s)", width: 105 },
  { key: "department", label: "Department", width: 70 },
  { key: "programName", label: "Name of the workshop / FDP etc", width: 105 },
  { key: "association", label: "In association with (if any)", width: 80 },
  { key: "dateRange", label: "Date (s)\n(From â€“ To)", width: 75 },
  { key: "vedicCenter", label: "VEDIC Hyd / VEDIC B'lore", width: 45 },
];

// Category headers shown before certain sections (red, centered)
const CATEGORY_HEADERS: Record<string, string> = {
  "faculty-achievements": "ACHIEVEMENTS",
  "faculty-events": "EVENTS CONDUCTED",
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const _unused_PAGE_WIDTH = PAGE_WIDTH; // keep linter happy
void _unused_PAGE_WIDTH;

const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatWeekDuration = (startDate: string, endDate: string): string => {
  const [, sm, sd] = startDate.split("-").map(Number);
  const [, em, ed] = endDate.split("-").map(Number);
  return `${getOrdinal(sd)} ${MONTHS_LONG[sm - 1]} to ${getOrdinal(ed)} ${MONTHS_LONG[em - 1]}`;
};


const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || !parts[0]) return dateStr;
  const [y, m, d] = parts;
  return `${String(d).padStart(2, "0")}-${MONTHS_SHORT[m - 1]}-${y}`;
};

const formatDateRange = (from: string, to: string): string => {
  if (!from && !to) return "";
  if (!to || from === to) return formatDate(from);
  return `${formatDate(from)} to\n${formatDate(to)}`;
};

// --- Table helpers ---
type PDFDoc = InstanceType<typeof PDFDocument>;

function measureCellHeight(doc: PDFDoc, text: string, colWidth: number): number {
  const usable = colWidth - 2 * CELL_PADDING;
  const h = doc.heightOfString(text || " ", { width: usable, lineBreak: true });
  return Math.max(MIN_ROW_HEIGHT, h + 2 * CELL_PADDING);
}

function drawTableHeader(doc: PDFDoc, columns: ColDef[], y: number): number {
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#000000");
  let rowHeight = MIN_ROW_HEIGHT;
  columns.forEach((col) => { rowHeight = Math.max(rowHeight, measureCellHeight(doc, col.label, col.width)); });
  let x = PAGE_LEFT;
  columns.forEach((col) => {
    doc.rect(x, y, col.width, rowHeight).stroke();
    doc.text(col.label, x + CELL_PADDING, y + CELL_PADDING, {
      width: col.width - 2 * CELL_PADDING, lineBreak: true, align: "center",
    });
    x += col.width;
  });
  return y + rowHeight;
}

function drawTableRows(
  doc: PDFDoc,
  columns: ColDef[],
  rows: Array<Record<string, string>>,
  startY: number,
): number {
  let currentY = startY;
  doc.fontSize(9).font("Helvetica").fillColor("#000000");
  rows.forEach((row) => {
    let rowHeight = MIN_ROW_HEIGHT;
    columns.forEach((col) => {
      rowHeight = Math.max(rowHeight, measureCellHeight(doc, row[col.key] || "", col.width));
    });
    if (currentY + rowHeight > PAGE_BOTTOM) {
      doc.addPage();
      currentY = 40;
      currentY = drawTableHeader(doc, columns, currentY);
      doc.fontSize(9).font("Helvetica").fillColor("#000000");
    }
    let x = PAGE_LEFT;
    columns.forEach((col) => {
      doc.rect(x, currentY, col.width, rowHeight).stroke();
      doc.text(row[col.key] || "", x + CELL_PADDING, currentY + CELL_PADDING, {
        width: col.width - 2 * CELL_PADDING, lineBreak: true,
      });
      x += col.width;
    });
    currentY += rowHeight;
  });
  return currentY;
}

function drawFullTable(
  doc: PDFDoc,
  columns: ColDef[],
  rows: Array<Record<string, string>>,
  startY: number,
): number {
  let y = startY;
  if (y + MIN_ROW_HEIGHT * 3 > PAGE_BOTTOM) { doc.addPage(); y = 40; }
  y = drawTableHeader(doc, columns, y);
  const tableRows =
    rows.length > 0
      ? rows
      : [
          Object.fromEntries(columns.map((c) => [c.key, ""])),
          Object.fromEntries(columns.map((c) => [c.key, ""])),
        ];
  return drawTableRows(doc, columns, tableRows, y);
}

// --- Cell value extractor ---
function getCellValue(
  key: string,
  rowIndex: number,
  data: Record<string, unknown>,
  fieldType?: string,
): string {
  if (key === "sno") return String(rowIndex + 1);
  if (key === "dateRange")
    return formatDateRange(
      String(data["dateFrom"] ?? ""),
      String(data["dateTo"] ?? ""),
    );
  const raw = data[key];
  if (raw === undefined || raw === null) return "";
  const str = String(raw);
  const isDateField =
    fieldType === "date" ||
    ["publicationDate", "signingDate", "dateOfJoining", "dateOfRelieving", "date"].includes(key);
  return isDateField ? formatDate(str) : str;
}

// --- Main export handler ---
export const exportReport = async (req: AuthenticatedRequest, res: Response) => {
  const weekId = String(req.params.weekId ?? "");
  const reportDoc = await reportsCollection.doc(weekId).get();
  if (!reportDoc.exists) return res.status(404).json({ message: "Report not found" });

  const report = reportDoc.data() as { department: string; startDate: string; endDate: string };

  // Fetch all entries without orderBy (avoid composite index requirement)
  const allEntriesSnap = await entriesCollection.where("reportId", "==", weekId).get();
  const allEntries = allEntriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Group by sectionId and sort in memory
  const entriesBySectionId: Record<string, Array<Record<string, unknown>>> = {};
  allEntries.forEach((entry) => {
    const sid = String((entry as Record<string, unknown>)["sectionId"] ?? "");
    if (!entriesBySectionId[sid]) entriesBySectionId[sid] = [];
    entriesBySectionId[sid].push(entry as Record<string, unknown>);
  });
  Object.values(entriesBySectionId).forEach((arr) =>
    arr.sort((a, b) =>
      String(a["createdAt"] ?? "").localeCompare(String(b["createdAt"] ?? "")),
    ),
  );

  // filter = "all" | "with-data" | "without-data"
  const filter = String(req.query.filter ?? "all");

  const allSections = await getSectionsConfig();
  const sections = allSections.filter((s) => {
    const hasData = (entriesBySectionId[s.id] ?? []).length > 0;
    if (filter === "with-data") return hasData;
    if (filter === "without-data") return !hasData;
    return true; // "all"
  });

  const schemasObj = await getSchemasConfig();

  const filterLabel = filter === "with-data" ? "-WithData" : filter === "without-data" ? "-Empty" : "";
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Weekly-Report-${report.department}-${report.startDate}${filterLabel}.pdf"`,
  );
  doc.pipe(res);

  // College header
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("BVRIT HYDERABAD College of Engineering for Women", { align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "(UGC Autonomous Institution | Approved by AICTE | Affiliated to JNTUH)",
      { align: "center" },
    );
  doc.text(
    "(NAAC Accredited \u2013 A Grade | NBA Accredited B. Tech. (EEE, ECE & CSE))",
    { align: "center" },
  );
  doc.text("Bachupally, Hyderabad -500 090", { align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(13).font("Helvetica-Bold").text("Weekly Report", { align: "center" });
  doc.moveDown(0.6);

  // Week duration (red) + department line
  doc.fontSize(11).font("Helvetica").fillColor("#000000");
  doc.text("Week Duration: ", { continued: true });
  doc
    .fillColor("#cc0000")
    .text(formatWeekDuration(report.startDate, report.endDate), { continued: false });
  doc.fillColor("#000000");

  const ALL_DEPARTMENTS = ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"];
  doc.text("Name of the Department: ", { continued: true });
  ALL_DEPARTMENTS.forEach((dept, idx) => {
    const isActive = dept === report.department;
    const isLast = idx === ALL_DEPARTMENTS.length - 1;
    const suffix = isLast ? "" : " / ";
    if (isActive) {
      doc.fillColor("#cc0000").font("Helvetica-Bold").text(dept + suffix, { continued: !isLast });
    } else {
      doc.fillColor("#000000").font("Helvetica").text(dept + suffix, { continued: !isLast });
    }
  });
  doc.fillColor("#000000").font("Helvetica");
  doc.moveDown(0.8);

  // Sections
  let sectionNumber = 1;
  for (const section of sections) {
    const schema = schemasObj[section.id];

    // Category header before certain sections
    if (CATEGORY_HEADERS[section.id]) {
      doc.moveDown(0.3);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#cc0000")
        .text(CATEGORY_HEADERS[section.id], { align: "center" });
      doc.fillColor("#000000");
      doc.moveDown(0.3);
    }

    // Section title
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#000000");
    doc.text(`${sectionNumber}.  ${schema?.name ?? section.name}`);
    doc.moveDown(0.25);

    const rawEntries = entriesBySectionId[section.id] ?? [];

    // VEDIC programs: two sub-tables
    if (section.id === "vedic-programs") {
      const studentEntries = rawEntries.filter(
        (e) => String(e["participantType"] ?? "") === "Students",
      );
      const facultyEntries = rawEntries.filter(
        (e) => String(e["participantType"] ?? "") === "Faculty Members",
      );

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000").text("Students");
      doc.moveDown(0.2);
      const studentRows = studentEntries.map((e, i) =>
        Object.fromEntries(
          VEDIC_STUDENTS_COLS.map((col) => [
            col.key,
            getCellValue(col.key, i, (e["data"] as Record<string, unknown>) ?? {}),
          ]),
        ),
      );
      doc.y = drawFullTable(doc, VEDIC_STUDENTS_COLS, studentRows, doc.y);
      doc.moveDown(0.5);

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000").text("Faculty Members");
      doc.moveDown(0.2);
      const facultyRows = facultyEntries.map((e, i) =>
        Object.fromEntries(
          VEDIC_FACULTY_COLS.map((col) => [
            col.key,
            getCellValue(col.key, i, (e["data"] as Record<string, unknown>) ?? {}),
          ]),
        ),
      );
      doc.y = drawFullTable(doc, VEDIC_FACULTY_COLS, facultyRows, doc.y);
      doc.moveDown(1);
      sectionNumber++;
      continue;
    }

    // Standard sections
    const columns = SECTION_COLUMNS[section.id];
    if (!columns) {
      doc.fontSize(9).font("Helvetica").fillColor("#888888").text("(no table defined)", { indent: 20 });
      doc.fillColor("#000000").moveDown(0.8);
      sectionNumber++;
      continue;
    }

    const rows = rawEntries.map((e, i) => {
      const entryData = (e["data"] as Record<string, unknown>) ?? {};
      return Object.fromEntries(
        columns.map((col) => {
          const fieldDef = schema?.fields?.find((f: { name: string }) => f.name === col.key);
          return [col.key, getCellValue(col.key, i, entryData, fieldDef?.type)];
        }),
      );
    });

    doc.y = drawFullTable(doc, columns, rows, doc.y);
    doc.moveDown(1);
    sectionNumber++;
  }

  doc.end();
};
