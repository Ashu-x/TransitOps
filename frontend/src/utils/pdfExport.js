import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // 1. Import autoTable as a function

export const exportTableToPDF = (title, columns, data, filename) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // 2. Call autoTable as a function, passing 'doc' as the first argument
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => 
      columns.map(col => {
        // If your column has a 'render' function, use it, otherwise use 'accessor'
        const value = col.render ? col.render(row) : row[col.accessor];
        return value || '';
      })
    ),
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  doc.save(`${filename}.pdf`);
};