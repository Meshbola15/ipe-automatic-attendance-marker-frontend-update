// src/utils/exportCSV.js
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const escape = (val) => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = Object.keys(data[0]).join(",");
  const csvRows = data.map((row) => Object.values(row).map(escape).join(","));
  const csvData = [headers, ...csvRows].join("\n");

  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
  