// src/services/reports.service.ts

import PDFDocument from "pdfkit";

import { ApiError } from "../utils/apiError";
import * as analyticsRepository from "../repositories/analytics.repository";
import * as reportsRepository from "../repositories/reports.repository";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function listExamReports(examinerId: string) {
  const [exams, finalizedSessions] = await Promise.all([
    reportsRepository.findExamsForReports(examinerId),
    analyticsRepository.findFinalizedSessionsForAnalytics(examinerId),
  ]);

  const statsByExam = new Map<string, { attempts: number; sum: number; count: number; passed: number }>();
  for (const s of finalizedSessions) {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const totalMarks = s.result?.totalMarks ?? 0;
    const bucket = statsByExam.get(s.examId) ?? { attempts: 0, sum: 0, count: 0, passed: 0 };
    bucket.attempts += 1;
    if (totalMarks >= s.exam.passingMarks) bucket.passed += 1;
    if (maxMarks > 0) {
      bucket.sum += (totalMarks / maxMarks) * 100;
      bucket.count += 1;
    }
    statsByExam.set(s.examId, bucket);
  }

  return exams.map((exam) => {
    const bucket = statsByExam.get(exam.id);
    return {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      status: exam.status,
      createdAt: exam.createdAt,
      attempts: bucket?.attempts ?? 0,
      averageScore: bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null,
      passRate: bucket && bucket.attempts > 0 ? Math.round((bucket.passed / bucket.attempts) * 100) : null,
    };
  });
}

interface ReportRow {
  studentName: string;
  studentEmail: string;
  status: string;
  marksObtained: number | null;
  maxMarks: number | null;
  percentage: number | null;
  submittedAt: Date | null;
}

/** Shared by the "View" (JSON), CSV export, and PDF export — one query, three presentations. */
async function buildExamReportData(examinerId: string, examId: string) {
  const exam = await reportsRepository.findExamOwnedByExaminer(examinerId, examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  const sessions = await reportsRepository.findSessionsForExamReport(examinerId, examId);

  let passed = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  const rows: ReportRow[] = sessions.map((s) => {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const totalMarks = s.result?.totalMarks ?? null;
    const percentage = totalMarks !== null && maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : null;

    if (totalMarks !== null && totalMarks >= exam.passingMarks) passed += 1;
    if (percentage !== null) {
      scoreSum += percentage;
      scoreCount += 1;
    }

    return {
      studentName: s.student.name,
      studentEmail: s.student.email,
      status: s.status,
      marksObtained: totalMarks,
      maxMarks: maxMarks || null,
      percentage,
      submittedAt: s.endTime,
    };
  });

  return {
    exam: { id: exam.id, title: exam.title, subject: exam.subject },
    rows,
    summary: {
      attempts: sessions.length,
      averageScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
      passRate: sessions.length > 0 ? Math.round((passed / sessions.length) * 100) : null,
    },
  };
}

/** Used by the "View" button — same data as the exports, just JSON for the in-app modal. */
export async function getExamReportDetail(examinerId: string, examId: string) {
  return buildExamReportData(examinerId, examId);
}

export async function exportExamReportCsv(examinerId: string, examId: string): Promise<{ filename: string; csv: string }> {
  const { exam, rows } = await buildExamReportData(examinerId, examId);

  const header = ["Student Name", "Email", "Status", "Marks Obtained", "Max Marks", "Percentage", "Submitted At"];
  const csvRows = rows.map((r) => [
    r.studentName,
    r.studentEmail,
    r.status,
    r.marksObtained ?? "",
    r.maxMarks ?? "",
    r.percentage !== null ? `${r.percentage}%` : "",
    r.submittedAt ? r.submittedAt.toISOString() : "",
  ]);

  const csv = [header, ...csvRows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const safeTitle = exam.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

  return { filename: `${safeTitle}_report.csv`, csv };
}

const PDF_COL_WIDTHS = [140, 75, 70, 65, 130];
const PDF_HEADERS = ["Student", "Status", "Score", "%", "Submitted"];

function drawPdfRow(
  doc: PDFKit.PDFDocument,
  startX: number,
  y: number,
  cols: string[],
  bold: boolean
): void {
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor("#111111");
  let x = startX;
  cols.forEach((text, i) => {
    doc.text(text, x, y, { width: PDF_COL_WIDTHS[i], ellipsis: true });
    x += PDF_COL_WIDTHS[i];
  });
}

export async function exportExamReportPdf(examinerId: string, examId: string): Promise<{ filename: string; buffer: Buffer }> {
  const { exam, rows, summary } = await buildExamReportData(examinerId, examId);

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(18).fillColor("#111111").text(exam.title);
    doc.font("Helvetica").fontSize(11).fillColor("#555555").text(exam.subject);
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#888888").text(`Generated ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#111111")
      .text(
        `Attempts: ${summary.attempts}    Average Score: ${summary.averageScore !== null ? summary.averageScore + "%" : "—"}    Pass Rate: ${summary.passRate !== null ? summary.passRate + "%" : "—"}`
      );
    doc.moveDown(1);

    const startX = doc.page.margins.left;
    const tableWidth = PDF_COL_WIDTHS.reduce((a, b) => a + b, 0);
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    function drawHeader(y: number): number {
      drawPdfRow(doc, startX, y, PDF_HEADERS, true);
      const lineY = y + 16;
      doc.moveTo(startX, lineY).lineTo(startX + tableWidth, lineY).strokeColor("#cccccc").stroke();
      return lineY + 8;
    }

    let y = drawHeader(doc.y);

    if (rows.length === 0) {
      doc.font("Helvetica").fontSize(10).fillColor("#888888").text("No submissions for this exam yet.", startX, y);
    }

    for (const row of rows) {
      if (y > pageBottom - 20) {
        doc.addPage();
        y = drawHeader(doc.page.margins.top);
      }
      drawPdfRow(doc, startX, y, [
        row.studentName,
        row.status,
        row.maxMarks !== null ? `${row.marksObtained ?? "—"}/${row.maxMarks}` : "—",
        row.percentage !== null ? `${row.percentage}%` : "—",
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—",
      ], false);
      y += 18;
    }

    doc.end();
  });

  const safeTitle = exam.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  return { filename: `${safeTitle}_report.pdf`, buffer };
}
