import React, { useState } from "react";

/* ---------- Styles ---------- */
const paperStyles = {
  paper: {
    maxWidth: "1700px",
    margin: "10px auto",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "6px",
    color: "#333",
  },
  tableWrapper: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "monospace",
    fontSize: "12px",
  },
  th: {
    border: "1px solid #ccc",
    padding: "6px",
    backgroundColor: "#eaeaea",
    position: "sticky",
    top: 0,
  },
  td: {
    border: "1px solid #ccc",
    padding: "6px",
    whiteSpace: "nowrap",
  },
};

const JSONUpload = () => {
  const [tables, setTables] = useState([]);
  const [textareaInput, setTextareaInput] = useState("");

  /* ---------- Helpers ---------- */
  const extractNumber = (name) =>
    parseInt(name.match(/\d+/)?.[0] || "999999", 10);
  const extractType = (name) =>
    name.includes("Enhanced") ? 0 : name.includes("Standard") ? 1 : 2;

  // Flatten while preserving key order
  const flattenObjectOrdered = (obj, parentKey = "", result = {}, order = []) => {
    for (const key of Object.keys(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObjectOrdered(obj[key], newKey, result, order);
      } else {
        result[newKey] = obj[key];
        order.push(newKey);
      }
    }
    return { result, order };
  };

  /* ---------- CSV ---------- */
  const convertTableToCSV = (table) => {
    const { fileNames, tableData, keyOrder } = table;
    const headers = ["Variable", ...fileNames];
    const rows = [headers.join(",")];

    keyOrder.forEach((variable) => {
      const row = [
        `"${variable}"`,
        ...fileNames.map(
          (file) =>
            `"${(tableData[variable][file] ?? "-").toString().replace(/"/g, '""')}"`
        ),
      ];
      rows.push(row.join(","));
    });

    return rows.join("\n");
  };

  const downloadCSV = (content, name) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Upload JSON ---------- */
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const tableData = {};
    const fileNames = [];
    const keyOrder = [];
    let done = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = JSON.parse(ev.target.result);
        fileNames.push(file.name);

        let flat = {};
        let order = [];

        if (json["Profile Data"]) {
          json["Profile Data"].forEach((sec) => {
            const { result, order: secOrder } = flattenObjectOrdered(sec);
            flat = { ...flat, ...result };
            order = [...order, ...secOrder];
          });
        } else {
          const { result, order: secOrder } = flattenObjectOrdered(json);
          flat = result;
          order = secOrder;
        }

        Object.entries(flat).forEach(([k, v]) => {
          if (!tableData[k]) tableData[k] = {};
          tableData[k][file.name] = String(v);
        });

        order.forEach((k) => {
          if (!keyOrder.includes(k)) keyOrder.push(k);
        });

        done++;
        if (done === files.length) {
          const sortedFiles = [...new Set(fileNames)].sort((a, b) => {
            const t = extractType(a) - extractType(b);
            return t !== 0 ? t : extractNumber(a) - extractNumber(b);
          });

          setTables((prev) => [
            ...prev,
            { id: Date.now(), fileNames: sortedFiles, tableData, keyOrder },
          ]);
        }
      };
      reader.readAsText(file);
    });
  };

  /* ---------- Copy Table ---------- */
  const copyTableToClipboard = (table) => {
    const { fileNames, tableData, keyOrder } = table;

    let text = "";
    keyOrder.forEach((variable) => {
      const row = [
        variable,
        ...fileNames.map((file) => tableData[variable][file] ?? "-"),
      ];
      text += row.join("\t") + "\n";
    });

    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  /* ---------- Textarea → JSON ---------- */
  /* ---------- Textarea → JSON (Preserve Order) ---------- */
/* ---------- Textarea → JSON (All values as strings) ---------- */
/* ---------- Textarea → JSON (Strings except true/false) ---------- */
const handleTextareaSubmit = () => {
  const lines = textareaInput.split("\n");
  const result = {};
  const keyOrder = []; // preserve order

  lines.forEach((line) => {
    if (!line.trim()) return;
    const parts = line.split("\t");
    if (parts.length !== 2) return;

    const key = parts[0].trim();
    let value = parts[1].trim();

    // Convert "true" or "false" to boolean
    if (/^true$/i.test(value)) value = true;
    else if (/^false$/i.test(value)) value = false;
    // Otherwise, keep as string

    keyOrder.push({ key, value });
  });

  // Function to set nested object by key path
  const setNested = (obj, path, val) => {
    const keys = path.split(".");
    let temp = obj;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) temp[k] = val;
      else {
        if (!temp[k]) temp[k] = {};
        temp = temp[k];
      }
    });
  };

  const orderedObj = {};
  keyOrder.forEach(({ key, value }) => setNested(orderedObj, key, value));

  const jsonStr = JSON.stringify(orderedObj, null, 4);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.json";
  a.click();
  URL.revokeObjectURL(url);
};
  /* ---------- UI ---------- */
  return (
    <div style={{ padding: "20px" }}>
      <h3>📂 Upload JSON Files</h3>
      <input type="file" accept=".json" multiple onChange={handleUpload} />

      <h3 style={{ marginTop: "20px" }}>📝 Paste Tab-Separated Data</h3>
      <textarea
        rows={10}
        cols={80}
        value={textareaInput}
        onChange={(e) => setTextareaInput(e.target.value)}
        placeholder="Paste your tab-separated data here: key[TAB]value"
      />
      <br />
      <button
        onClick={handleTextareaSubmit}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          fontSize: "14px",
          cursor: "pointer",
          borderRadius: "5px",
          backgroundColor: "#17a2b8",
          color: "#fff",
          border: "none",
        }}
      >
        ⬇️ Download JSON
      </button>

      {tables.map((table, index) => (
        <div key={table.id} style={paperStyles.paper}>
          <div style={paperStyles.title}>
            📄 Table {index + 1}
            <button
              onClick={() =>
                downloadCSV(convertTableToCSV(table), `Table_${index + 1}.csv`)
              }
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "5px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
              }}
            >
              ⬇️ CSV
            </button>
            <button
              onClick={() => copyTableToClipboard(table)}
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "5px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
              }}
            >
              📋 Copy
            </button>
          </div>

          <div style={paperStyles.tableWrapper}>
            <table style={paperStyles.table}>
              <thead>
                <tr>
                  <th style={paperStyles.th}>Variable</th>
                  {table.fileNames.map((f) => (
                    <th key={f} style={paperStyles.th}>
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.keyOrder.map((v, i) => (
                  <tr
                    key={v}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#fff",
                    }}
                  >
                    <td style={paperStyles.td}>{v}</td>
                    {table.fileNames.map((f) => (
                      <td key={f} style={paperStyles.td}>
                        {table.tableData[v][f] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JSONUpload;