const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const db = admin.firestore();

// Sections configuration
const sections = [
  { id: "general-points", name: "General Points" },
  { id: "faculty-joined-relieved", name: "Faculty Joined / Relieved" },
  { id: "faculty-achievements", name: "Faculty Achievements" },
  { id: "student-achievements", name: "Student Achievements" },
  { id: "department-achievements", name: "Department Achievements" },
  { id: "faculty-events", name: "Faculty Events - Conducted (FDPs / Workshops / STTPs etc)" },
  { id: "student-events", name: "Student Events - Conducted (Technical Events / Workshops / Guest Lecture etc)" },
  { id: "non-technical-events", name: "Non Technical Events Conducted" },
  { id: "industry-visits", name: "Industry/Colleges Visit" },
  { id: "hackathon-participation", name: "Details of Students took part in various Hackathons / Events (Only participation)" },
  { id: "faculty-certifications", name: "Faculty attended FDPs / Technical Workshops / STTPS / Orientation course / Certification" },
  { id: "faculty-visits", name: "Faculty Visits" },
  { id: "patents", name: "Patents Published" },
  { id: "vedic-programs", name: "VEDIC Programs" },
  { id: "placements", name: "Placements" },
  { id: "mous", name: "MoU's Signed" },
  { id: "skill-development-programs", name: "Skill Development Programs (Domain Specific Training / GATE etc)" },
];

// Departments configuration
const departments = ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"];

// Schemas configuration
const schemas = {
  "general-points": {
    id: "general-points",
    name: "General Points",
    fields: [
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Department meetings, parent-teacher meetings, institutional announcements, etc." }
    ]
  },
  "faculty-joined-relieved": {
    id: "faculty-joined-relieved",
    name: "Faculty Joined / Relieved",
    fields: [
      { name: "facultyName", label: "Name of the Faculty", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "designation", label: "Designation", type: "select", required: true, options: ["Professor", "Associate Professor", "Assistant Professor", "Junior Assistant Professor", "Lecturer"] },
      { name: "dateOfJoining", label: "Date of Joining", type: "date", required: false },
      { name: "dateOfRelieving", label: "Date of Relieving", type: "date", required: false }
    ]
  },
  "faculty-achievements": {
    id: "faculty-achievements",
    name: "Faculty Achievements",
    fields: [
      { name: "facultyName", label: "Name of the Faculty Member(s)", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "details", label: "Details of the Achievement", type: "textarea", required: true, placeholder: "Awards received, guest lecture invitations, reviewer/jury roles, etc." },
      { name: "date", label: "Date", type: "date", required: true }
    ]
  },
  "student-achievements": {
    id: "student-achievements",
    name: "Student Achievements",
    fields: [
      { name: "studentName", label: "Name of the Student(s)", type: "text", required: true },
      { name: "rollNo", label: "Roll No", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "details", label: "Details of Achievement", type: "textarea", required: true },
      { name: "date", label: "Date", type: "date", required: true }
    ]
  },
  "department-achievements": {
    id: "department-achievements",
    name: "Department Achievements",
    fields: [
      { name: "details", label: "Details of Achievement", type: "textarea", required: true, placeholder: "Collective recognitions or milestones" },
      { name: "date", label: "Date", type: "date", required: true }
    ]
  },
  "faculty-events": {
    id: "faculty-events",
    name: "Faculty Events - Conducted (FDPs / Workshops / STTPs etc)",
    fields: [
      { name: "eventName", label: "Name of the Event (Workshop / FDP / STTPs)", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "resourcePerson", label: "Details of Resource Person / Guest Invited", type: "textarea", required: true, placeholder: "Or mention number of resource persons in case of FDP/PDP" },
      { name: "coordinatorName", label: "Name of the Coordinator", type: "text", required: true },
      { name: "facultyParticipated", label: "No. of Faculty Participated", type: "number", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "student-events": {
    id: "student-events",
    name: "Student Events - Conducted (Technical Events / Workshops / Guest Lecture etc)",
    fields: [
      { name: "eventName", label: "Name of the Event (Workshop / Event / Guest Lecture - Topic)", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "resourcePerson", label: "Details of Resource Person / Guest Invited", type: "text", required: true },
      { name: "coordinatorName", label: "Name of the Coordinator", type: "text", required: true },
      { name: "studentsParticipated", label: "No. of Students Participated", type: "number", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "non-technical-events": {
    id: "non-technical-events",
    name: "Non Technical Events Conducted",
    fields: [
      { name: "eventName", label: "Name of the Event", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "resourcePerson", label: "Details of Resource Person / Guest Invited", type: "text", required: false },
      { name: "coordinatorName", label: "Name of the Coordinator", type: "text", required: true },
      { name: "studentsParticipated", label: "No. of Students Participated", type: "number", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "industry-visits": {
    id: "industry-visits",
    name: "Industry/Colleges Visit",
    fields: [
      { name: "industryName", label: "Name of the Industry and Location", type: "textarea", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "coordinatorName", label: "Name of the Coordinator", type: "text", required: true },
      { name: "studentsParticipated", label: "No. of Students Participated", type: "number", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "hackathon-participation": {
    id: "hackathon-participation",
    name: "Details of Students took part in various Hackathons / Events (Only participation)",
    fields: [
      { name: "eventName", label: "Name of the Event / Hackathon", type: "text", required: true },
      { name: "conductedBy", label: "Conducted by", type: "text", required: true },
      { name: "mentorDetails", label: "Mentor Details", type: "text", required: false },
      { name: "studentsParticipated", label: "No. of Students Participated", type: "number", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "faculty-certifications": {
    id: "faculty-certifications",
    name: "Faculty attended FDPs / Technical Workshops / STTPS / Orientation course / Certification",
    fields: [
      { name: "facultyName", label: "Name of the Faculty Member(s)", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "workshopName", label: "Name of the Workshop / FDP / Certification etc", type: "text", required: true },
      { name: "organizedBy", label: "Organized by", type: "text", required: true, placeholder: "NPTEL, Coursera, EDX, Industry, etc." },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "faculty-visits": {
    id: "faculty-visits",
    name: "Faculty Visits",
    fields: [
      { name: "facultyName", label: "Name of the Faculty Member(s)", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "visitedPlace", label: "Name of the Colleges / Industry etc Visited - Location", type: "textarea", required: true },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "patents": {
    id: "patents",
    name: "Patents Published",
    fields: [
      { name: "facultyName", label: "Name of the Faculty Member(s)", type: "text", required: true },
      { name: "patentTitle", label: "Patent Title", type: "text", required: true },
      { name: "applicationNo", label: "Application No", type: "text", required: true },
      { name: "publicationDate", label: "Publication Date", type: "date", required: true }
    ]
  },
  "vedic-programs": {
    id: "vedic-programs",
    name: "VEDIC Programs",
    fields: [
      { name: "participantType", label: "Participant Type", type: "select", required: true, options: ["Students", "Faculty Members"] },
      { name: "programName", label: "Name of the Program / Workshop / FDP", type: "text", required: true },
      { name: "facultyName", label: "Name of Faculty (if faculty participant)", type: "text", required: false },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "topic", label: "Topic and Faculty Handled (if faculty participant)", type: "text", required: false },
      { name: "association", label: "In association with (if any)", type: "text", required: false },
      { name: "participants", label: "No. of Students Participated (if students)", type: "number", required: false },
      { name: "vedicCenter", label: "VEDIC Center", type: "select", required: true, options: ["VEDIC Hyd", "VEDIC B'lore"] },
      { name: "dateFrom", label: "Date From", type: "date", required: true },
      { name: "dateTo", label: "Date To", type: "date", required: true }
    ]
  },
  "placements": {
    id: "placements",
    name: "Placements",
    fields: [
      { name: "companyName", label: "Name of the Company", type: "text", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["EEE", "ECE", "CSE", "IT", "CSE(AI&ML)", "BSH"] },
      { name: "studentsPlaced", label: "No. of Students Placed", type: "number", required: true },
      { name: "package", label: "Package", type: "text", required: true, placeholder: "e.g., 4 LPA, 4.5 LPA" }
    ]
  },
  "mous": {
    id: "mous",
    name: "MoU's Signed",
    fields: [
      { name: "organizationName", label: "Name of the Organization with whom MoU was signed", type: "text", required: true },
      { name: "signingDate", label: "Date of Signing MoU", type: "date", required: true },
      { name: "validity", label: "Validity", type: "text", required: true, placeholder: "e.g., 2 years, 5 years" },
      { name: "purpose", label: "Purpose of MoU (Main Point)", type: "textarea", required: true }
    ]
  },
  "skill-development-programs": {
    id: "skill-development-programs",
    name: "Skill Development Programs (Domain Specific Training / GATE etc)",
    fields: [
      { name: "programName", label: "Name of the Program", type: "text", required: true },
      { name: "facultyCoordinator", label: "Faculty Coordinator", type: "text", required: true },
      { name: "topicAndFaculty", label: "Topic and Faculty Handled", type: "textarea", required: true },
      { name: "students", label: "No. of Students", type: "number", required: true },
      { name: "sessions", label: "No. of Sessions", type: "number", required: true }
    ]
  }
};

async function seedConfig() {
  try {
    console.log("🌱 Seeding configuration data...");

    // Seed sections
    await db.collection("config").doc("sections").set({ sections });
    console.log("✅ Sections configuration seeded");

    // Seed departments
    await db.collection("config").doc("departments").set({ departments });
    console.log("✅ Departments configuration seeded");

    // Seed schemas
    await db.collection("config").doc("schemas").set({ schemas });
    console.log("✅ Schemas configuration seeded");

    console.log("\n✨ Configuration seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding configuration:", error);
    process.exit(1);
  }
}

seedConfig();
