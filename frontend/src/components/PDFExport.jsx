import { useState } from 'react';
import jsPDF from 'jspdf';

export default function PDFExport({ filename, insights }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting || !insights) return;
    setExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      const checkPage = (needed = 12) => {
        if (y + needed > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // ===== HEADER =====
      // Blue header bar
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageW, 38, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('ContextIQ', margin, 16);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(200, 220, 255);
      pdf.text('AI-Powered Intelligence Report', margin, 23);

      // File + date right-aligned
      pdf.setFontSize(9);
      pdf.setTextColor(180, 210, 255);
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      pdf.text(dateStr, pageW - margin, 16, { align: 'right' });
      pdf.text(filename || 'Unknown File', pageW - margin, 23, { align: 'right' });

      y = 48;

      // ===== SECTION: CORE SUMMARY =====
      const sectionHeader = (title, icon) => {
        checkPage(20);
        pdf.setFillColor(245, 247, 250);
        pdf.roundedRect(margin, y - 2, contentW, 10, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        pdf.text(`${icon}  ${title}`, margin + 4, y + 5);
        y += 14;
      };

      const bodyText = (text, indent = 0) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        const lines = pdf.splitTextToSize(text, contentW - indent);
        lines.forEach((line) => {
          checkPage(6);
          pdf.text(line, margin + indent, y);
          y += 5;
        });
        y += 2;
      };

      // Summary
      sectionHeader('CORE SUMMARY', '📋');
      if (insights.summary) {
        bodyText(insights.summary);
      } else {
        bodyText('No summary available.');
      }
      y += 4;

      // ===== SECTION: KEY TRENDS =====
      if (insights.trends && insights.trends.length > 0) {
        sectionHeader('KEY TRENDS', '📈');
        insights.trends.forEach((trend, i) => {
          checkPage(10);
          // Numbered bullet
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(37, 99, 235);
          pdf.text(`${i + 1}.`, margin + 2, y);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(trend, contentW - 12);
          lines.forEach((line, li) => {
            checkPage(6);
            pdf.text(line, margin + 10, y);
            y += 5;
          });
          y += 2;
        });
        y += 4;
      }

      // ===== SECTION: ANOMALIES =====
      if (insights.anomalies && insights.anomalies.length > 0) {
        sectionHeader('ANOMALIES DETECTED', '⚠️');
        insights.anomalies.forEach((anomaly) => {
          checkPage(12);
          const sev = (anomaly.severity || 'medium').toUpperCase();
          const sevColors = {
            HIGH: [244, 63, 94],
            MEDIUM: [245, 158, 11],
            LOW: [100, 116, 139],
          };
          const col = sevColors[sev] || sevColors.MEDIUM;

          // Severity badge
          pdf.setFillColor(col[0], col[1], col[2]);
          pdf.roundedRect(margin + 2, y - 3.5, 14, 5, 1, 1, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6);
          pdf.setTextColor(255, 255, 255);
          pdf.text(sev, margin + 4, y);

          // Description
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(anomaly.description || '', contentW - 22);
          lines.forEach((line, li) => {
            checkPage(6);
            pdf.text(line, margin + 20, y);
            y += 5;
          });
          y += 3;
        });
        y += 4;
      }

      // ===== SECTION: RECOMMENDATIONS =====
      if (insights.recommendations && insights.recommendations.length > 0) {
        sectionHeader('STRATEGIC RECOMMENDATIONS', '🎯');
        insights.recommendations.forEach((rec, i) => {
          checkPage(10);

          // Blue numbered circle
          pdf.setFillColor(219, 234, 254);
          pdf.circle(margin + 5, y - 1.5, 3.5, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(37, 99, 235);
          pdf.text(`${i + 1}`, margin + 3.5 + (i < 9 ? 0.5 : 0), y);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(rec, contentW - 16);
          lines.forEach((line) => {
            checkPage(6);
            pdf.text(line, margin + 14, y);
            y += 5;
          });
          y += 3;
        });
      }

      // ===== FOOTER on every page =====
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
        // Footer text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Generated by ContextIQ Intelligence', margin, pageH - 7);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' });
      }

      const safeName = (filename || 'insights').replace(/\.[^/.]+$/, '');
      pdf.save(`${safeName}_report.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-sm disabled:opacity-50"
    >
      {exporting ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
}
