import jsPDF from 'jspdf';
import { SUBJECTS, getGrade } from './MarksTable';

const AI_REMARKS = {
  A: 'Outstanding academic performance! Keep up the excellent work. Demonstrates deep understanding and consistent effort.',
  B: 'Good performance with strong potential. Focus on weaker areas to achieve excellence next semester.',
  C: 'Average performance. Regular practice and dedicated study sessions recommended for improvement.',
  Fail: 'Needs immediate attention and additional support. Extra tutoring sessions and parent-teacher meeting advised.',
};

export function generateReportPDF(student) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const gradeInfo = getGrade(student.average);

  /* ── Colors ── */
  const primary = [99, 102, 241];
  const dark = [15, 23, 42];
  const muted = [100, 116, 139];
  const white = [255, 255, 255];

  const gradeColors = {
    A: [16, 185, 129],
    B: [6, 182, 212],
    C: [245, 158, 11],
    Fail: [244, 63, 94],
  };
  const gc = gradeColors[gradeInfo.grade] || gradeColors.Fail;

  let y = 0;

  /* ═══ HEADER BAND ═══ */
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // School name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...white);
  doc.text('EDUBASE ACADEMY', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Academic Report Card | 2025-26 | Semester II', pageWidth / 2, 28, { align: 'center' });

  // Thin accent line
  doc.setFillColor(...gc);
  doc.rect(0, 45, pageWidth, 3, 'F');

  y = 58;

  /* ═══ STUDENT INFO SECTION ═══ */
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('STUDENT NAME', margin + 8, y + 10);
  doc.text('ROLL NUMBER', margin + 65, y + 10);
  doc.text('CLASS', margin + 110, y + 10);
  doc.text('OVERALL GRADE', pageWidth - margin - 18, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text(student.name, margin + 8, y + 20);
  doc.text(`EDU-${String(student.id).padStart(4, '0')}`, margin + 65, y + 20);
  doc.text('10th / A', margin + 110, y + 20);

  // Grade circle
  doc.setFillColor(...gc);
  doc.circle(pageWidth - margin - 18, y + 20, 10, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(gradeInfo.grade, pageWidth - margin - 18, y + 24, { align: 'center' });

  y += 48;

  /* ═══ MARKS TABLE ═══ */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text('Subject-wise Performance', margin, y);
  y += 8;

  // Table header
  const colWidths = [60, 30, 30, 25, contentWidth - 145];
  const headers = ['Subject', 'Marks', 'Out Of', 'Grade', 'Performance'];

  doc.setFillColor(...primary);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let xPos = margin + 4;
  headers.forEach((h, i) => {
    doc.text(h, xPos, y + 7);
    xPos += colWidths[i];
  });
  y += 12;

  // Table rows
  SUBJECTS.forEach((sub, i) => {
    const mark = student.marks[i];
    const subGrade = getGrade(mark);
    const subGc = gradeColors[subGrade.grade] || gradeColors.Fail;

    // Alternating row bg
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    xPos = margin + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(sub, xPos, y + 8);
    xPos += colWidths[0];

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...subGc);
    doc.text(String(mark), xPos, y + 8);
    xPos += colWidths[1];

    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.text('100', xPos, y + 8);
    xPos += colWidths[2];

    // Grade badge
    doc.setFillColor(...subGc);
    doc.roundedRect(xPos - 2, y + 2, 18, 7, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(subGrade.grade, xPos + 7, y + 7, { align: 'center' });
    xPos += colWidths[3];

    // Progress bar
    const barWidth = colWidths[4] - 10;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(xPos, y + 4, barWidth, 4, 2, 2, 'F');
    doc.setFillColor(...subGc);
    doc.roundedRect(xPos, y + 4, barWidth * (mark / 100), 4, 2, 2, 'F');

    y += 12;
  });

  // Total row
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);

  xPos = margin + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text('TOTAL', xPos, y + 9);
  xPos += colWidths[0];
  doc.setTextColor(...gc);
  doc.text(String(student.total), xPos, y + 9);
  xPos += colWidths[1];
  doc.setTextColor(...muted);
  doc.text(String(SUBJECTS.length * 100), xPos, y + 9);
  xPos += colWidths[2];
  doc.setFillColor(...gc);
  doc.roundedRect(xPos - 2, y + 3, 18, 8, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.text(gradeInfo.grade, xPos + 7, y + 8.5, { align: 'center' });
  xPos += colWidths[3];
  doc.setTextColor(...gc);
  doc.setFontSize(9);
  doc.text(`${student.average.toFixed(1)}% Average`, xPos, y + 9);

  y += 22;

  /* ═══ PERFORMANCE SUMMARY ═══ */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text('Performance Summary', margin, y);
  y += 8;

  const bestIdx = student.marks.indexOf(Math.max(...student.marks));
  const worstIdx = student.marks.indexOf(Math.min(...student.marks));

  // Two boxes side by side
  const boxWidth = (contentWidth - 8) / 2;

  // Best subject
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, boxWidth, 22, 3, 3, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, boxWidth, 22, 3, 3, 'S');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...muted);
  doc.text('STRONGEST SUBJECT', margin + 6, y + 7);
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text(`${SUBJECTS[bestIdx]} — ${student.marks[bestIdx]}/100`, margin + 6, y + 16);

  // Weakest subject
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(margin + boxWidth + 8, y, boxWidth, 22, 3, 3, 'F');
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(margin + boxWidth + 8, y, boxWidth, 22, 3, 3, 'S');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...muted);
  doc.text('NEEDS IMPROVEMENT', margin + boxWidth + 14, y + 7);
  doc.setFontSize(10);
  doc.setTextColor(244, 63, 94);
  doc.text(`${SUBJECTS[worstIdx]} — ${student.marks[worstIdx]}/100`, margin + boxWidth + 14, y + 16);

  y += 30;

  /* ═══ REMARKS ═══ */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Teacher's Remarks", margin, y);
  y += 6;

  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'S');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  const remarkText = AI_REMARKS[gradeInfo.grade] || AI_REMARKS.Fail;
  const splitRemark = doc.splitTextToSize(remarkText, contentWidth - 16);
  doc.text(splitRemark, margin + 8, y + 10);

  y += 30;

  /* ═══ GRADING SCALE ═══ */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('GRADING SCALE:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const scaleText = 'A (85-100)  |  B (70-84)  |  C (50-69)  |  Fail (<50)';
  doc.text(scaleText, margin + 30, y);

  y += 10;

  /* ═══ FOOTER ═══ */
  // Signature lines
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 15, margin + 55, y + 15);
  doc.line(pageWidth / 2 - 27, y + 15, pageWidth / 2 + 27, y + 15);
  doc.line(pageWidth - margin - 55, y + 15, pageWidth - margin, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text('Class Teacher', margin + 12, y + 20);
  doc.text('Principal', pageWidth / 2, y + 20, { align: 'center' });
  doc.text('Parent/Guardian', pageWidth - margin - 28, y + 20);

  // Footer band
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY - 5, pageWidth, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, footerY - 5, pageWidth, footerY - 5);

  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, footerY + 2);
  doc.text('Edubase Academy — Academic Report Card System', pageWidth - margin, footerY + 2, { align: 'right' });

  /* ── Save ── */
  // We use a strictly hardcoded string without dynamic template literals
  // to ensure no whitespace or special characters can break Chrome's filename parser.
  doc.save('Student_Report_Card.pdf');
}
