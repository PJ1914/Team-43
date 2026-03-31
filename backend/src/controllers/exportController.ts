import { Response } from "express";
import PDFDocument from "pdfkit";
import { AuthenticatedRequest } from "../middleware/auth";
import { entriesCollection, reportsCollection } from "../services/firestoreService";
import { getSchemasConfig } from "../services/configService";

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateRange = (from: string, to: string): string => {
  if (from === to) return formatDate(from);
  return `${formatDate(from)} to ${formatDate(to)}`;
};

export const exportReport = async (req: AuthenticatedRequest, res: Response) => {
  const weekId = String(req.params.weekId ?? "");
  const reportDoc = await reportsCollection.doc(weekId).get();

  if (!reportDoc.exists) {
    return res.status(404).json({ message: "Report not found" });
  }

  const report = reportDoc.data() as {
    department: string;
    startDate: string;
    endDate: string;
  };

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=weekly-report-${weekId}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(16).font("Helvetica-Bold").text("BVRIT HYDERABAD College of Engineering for Women", { align: "center" });
  doc.fontSize(10).font("Helvetica")
    .text("(UGC Autonomous Institution | Approved by AICTE | Affiliated to JNTUH)", { align: "center" });
  doc.text("(NAAC Accredited – A Grade | NBA Accredited B. Tech. (EEE, ECE & CSE))", { align: "center" });
  doc.text("Bachupally, Hyderabad -500 090", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(14).font("Helvetica-Bold").text("Weekly Report", { align: "center" });
  doc.moveDown(0.5);

  // Week details
  doc.fontSize(11).font("Helvetica");
  const startDateFormatted = new Date(report.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endDateFormatted = new Date(report.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  doc.text(`Week Duration: ${startDateFormatted} to ${endDateFormatted}`, { continued: false });
  doc.text(`Name of the Department: ${report.department}`, { continued: false });
  doc.moveDown(1);

  let sectionNumber = 1;

  // Fetch schemas dynamically
  const schemasObj = await getSchemasConfig();
  const schemas = Object.values(schemasObj);

  for (const schema of schemas) {
    const entriesSnapshot = await entriesCollection
      .where("reportId", "==", weekId)
      .where("sectionId", "==", schema.id)
      .orderBy("createdAt", "asc")
      .get();

    // Section header
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000");
    doc.text(`${sectionNumber}. ${schema.name}`, { underline: false });
    doc.moveDown(0.3);

    if (entriesSnapshot.empty) {
      doc.fontSize(10).font("Helvetica").fillColor("#666666").text("No entries", { indent: 20 });
      doc.moveDown(0.8);
      sectionNumber++;
      continue;
    }

    // Table rendering
    const tableTop = doc.y;
    const cellPadding = 5;
    const rowHeight = 25;
    let currentY = tableTop;

    // Calculate column widths based on field count (+1 for S.No, +1 for Status)
    const fieldCount = schema.fields.length + 2;
    const tableWidth = 520;
    const colWidth = tableWidth / fieldCount;

    // Draw table header
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#000000");
    let currentX = 40;

    // S.No column
    doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
    doc.text("S. No", currentX + cellPadding, currentY + cellPadding, { width: colWidth - 2 * cellPadding, align: "left" });
    currentX += colWidth;

    // Field columns
    schema.fields.forEach((field) => {
      doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
      doc.text(field.label, currentX + cellPadding, currentY + cellPadding, { 
        width: colWidth - 2 * cellPadding, 
        align: "left",
        lineBreak: true
      });
      currentX += colWidth;
    });

    // Status column
    doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
    doc.text("Status", currentX + cellPadding, currentY + cellPadding, { 
      width: colWidth - 2 * cellPadding, 
      align: "left"
    });

    currentY += rowHeight;

    // Draw table rows
    doc.font("Helvetica").fontSize(9);
    entriesSnapshot.docs.forEach((entryDoc, index) => {
      const entry = entryDoc.data();
      const data = entry.data ?? {};
      
      currentX = 40;

      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }

      // S.No cell
      doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
      doc.text(String(index + 1), currentX + cellPadding, currentY + cellPadding, { width: colWidth - 2 * cellPadding });
      currentX += colWidth;

      // Data cells
      schema.fields.forEach((field) => {
        doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
        let value = String(data[field.name] ?? "");
        
        // Format dates
        if (field.type === "date" && value) {
          try {
            value = formatDate(value);
          } catch (e) {
            // Keep original if parsing fails
          }
        }

        // Handle date ranges (for sections with dateFrom and dateTo)
        if (field.name === "dateFrom" && data["dateTo"]) {
          value = formatDateRange(String(data["dateFrom"]), String(data["dateTo"]));
        } else if (field.name === "dateTo") {
          // Skip dateTo if we already showed it in dateFrom
          if (data["dateFrom"]) {
            value = "";
          }
        }

        doc.text(value, currentX + cellPadding, currentY + cellPadding, { 
          width: colWidth - 2 * cellPadding,
          lineBreak: true,
          height: rowHeight - 2 * cellPadding
        });
        currentX += colWidth;
      });

      // Status cell
      doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
      const status = entry.verificationStatus || "pending";
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      let statusColor = "#666666";
      if (status === "approved") statusColor = "#047857";
      else if (status === "rejected") statusColor = "#dc2626";
      
      doc.fillColor(statusColor);
      doc.text(statusText, currentX + cellPadding, currentY + cellPadding, { 
        width: colWidth - 2 * cellPadding,
        height: rowHeight - 2 * cellPadding
      });
      doc.fillColor("#000000");

      currentY += rowHeight;

      // Add documents info if exists (below the main row)
      if (entry.documents && entry.documents.length > 0) {
        doc.fontSize(8).font("Helvetica").fillColor("#0066cc");
        const docsText = `Documents: ${entry.documents.map((d: any) => d.fileName).join(", ")}`;
        doc.text(docsText, 45, currentY + 2, { width: 510 });
        doc.fillColor("#000000");
        currentY += 12;
      }
    });

    doc.moveDown(1);
    sectionNumber++;
  }

  doc.end();
};
