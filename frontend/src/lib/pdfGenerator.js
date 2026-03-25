import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Captures specific DOM elements by ID and generates a standardized A4 PDF report.
 * @param {Array<string>} elementIds - Array of DOM IDs to capture
 * @param {Object} reportMeta - Metadata like { title, filename, date }
 * @param {Function} onProgress - Callback(percent: number, statusText: string)
 */
export async function generateEnterpriseReport(elementIds, reportMeta, onProgress) {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pdfWidth - margin * 2;

    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Add Cover Page
    if (onProgress) onProgress(10, 'Creating cover page...');
    pdf.setFillColor(currentTheme === 'dark' ? 15 : 249, currentTheme === 'dark' ? 23 : 250, currentTheme === 'dark' ? 42 : 251); // Slate-900 or Slate-50 background
    pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(currentTheme === 'dark' ? 248 : 30, currentTheme === 'dark' ? 250 : 41, currentTheme === 'dark' ? 252 : 59); // Slate-50 or Slate-900
    pdf.setFontSize(28);
    pdf.text("ContextIQ Data Intelligence", margin, pdfHeight / 3);

    pdf.setFontSize(16);
    pdf.setTextColor(37, 99, 235); // Blue-600
    pdf.text(reportMeta.title || "Enterprise Analysis Report", margin, (pdfHeight / 3) + 12);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(currentTheme === 'dark' ? 148 : 100, currentTheme === 'dark' ? 163 : 116, currentTheme === 'dark' ? 184 : 139); // Slate-400 or Slate-500
    pdf.text(`Generated: ${reportMeta.date}`, margin, (pdfHeight / 3) + 30);
    if (reportMeta.filename) {
      pdf.text(`Source Dataset: ${reportMeta.filename}`, margin, (pdfHeight / 3) + 36);
    }

    // Add a divider line
    pdf.setDrawColor(226, 232, 240); // Slate-200
    pdf.line(margin, (pdfHeight / 3) + 50, pdfWidth - margin, (pdfHeight / 3) + 50);

    let progress = 10;
    const progressStep = 80 / elementIds.length;

    // Iterate through requested DOM nodes
    for (let i = 0; i < elementIds.length; i++) {
        const id = elementIds[i];
        const el = document.getElementById(id);
        
        if (!el) {
            console.warn(`Element with ID ${id} not found, skipping.`);
            continue;
        }

        if (onProgress) {
            progress += progressStep;
            onProgress(Math.min(90, progress), `Capturing ${id.replace('report-', '')}...`);
        }

        pdf.addPage();
        
        // Ensure consistent background for the page
        pdf.setFillColor(currentTheme === 'dark' ? 15 : 255, currentTheme === 'dark' ? 23 : 255, currentTheme === 'dark' ? 42 : 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        // Clone the node to force light mode for the PDF if preferred, or capture as is
        // We will capture as is (respecting current dark/light theme).
        const canvas = await html2canvas(el, {
            scale: 2, // High DPI
            useCORS: true,
            logging: false,
            backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
            windowWidth: 1200 // Force standard desktop width for responsive charts
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        
        // Calculate image dimensions to fit A4 width
        const imgProps = pdf.getImageProperties(imgData);
        let imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        // If it's too tall, scale down to fit the page vertically, keeping aspect ratio
        if (imgHeight > (pdfHeight - margin * 2)) {
          const ratio = (pdfHeight - margin * 2) / imgHeight;
          imgHeight = imgHeight * ratio;
          const adjustedWidth = contentWidth * ratio;
          pdf.addImage(imgData, "JPEG", margin + ((contentWidth - adjustedWidth)/2), margin, adjustedWidth, imgHeight);
        } else {
          pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, imgHeight);
        }

        // Add page footers
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // Slate-400
        pdf.text("ContextIQ Enterprise", margin, pdfHeight - 10);
        pdf.text(`Page ${i + 2}`, pdfWidth - margin - 10, pdfHeight - 10);
    }

    if (onProgress) onProgress(100, 'Saving PDF...');
    pdf.save(reportMeta.filename ? `ContextIQ_${reportMeta.filename.replace('.csv', '')}_Report.pdf` : 'ContextIQ_Enterprise_Report.pdf');
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
