// src/utils/exportCSV.js
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
      alert("No data to export");
      return;
    }
  
    // Create CSV headers based on object keys
    const headers = Object.keys(data[0]).join(",");
    
    // Create CSV rows for each entry
    const csvRows = data.map(row =>
      Object.values(row)
        .map(val => `"${val}"`)
        .join(",")
    );
    
    // Combine headers and rows into one CSV string
    const csvData = [headers, ...csvRows].join("\n");
    
    // Create a Blob and trigger the download
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
  