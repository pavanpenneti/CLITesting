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
    headerRow: {
  backgroundColor: "#ddd",
  fontWeight: "bold",
},
};

const JSONUpload = () => {
  const [tables, setTables] = useState([]);
  const [textareaInput, setTextareaInput] = useState("");
  const [megaTable, setMegaTable] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("");

  /* ---------- Helpers ---------- */
  const extractNumber = (name) =>
    parseInt(name.match(/\d+/)?.[0] || "999999", 10);

  const extractType = (name) =>
    name.includes("Enhanced") ? 0 : name.includes("Standard") ? 1 : 2;

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
            `"${(tableData[variable][file] ?? "-")
              .toString()
              .replace(/"/g, '""')}"`
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

  /* ---------- Copy ---------- */
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

  /* ---------- TEXTAREA → MEGA TABLE ---------- */
const parseTextareaToMegaTable = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const tableData = {};
  const columns = new Set();
  const rowOrder = []; // includes headers
  const headerAdded = new Set();

  lines.forEach(line => {
    const parts = line.split("\t");
    if (parts.length < 2) return;

    const fullKey = parts[0].trim();
    const value = parts.slice(1).join("\t").trim();

    const moduleMatch = fullKey.match(/(MB|BLE|FML|FMB|FMT)\d+_[^\.]+ MHz/);
    if (!moduleMatch) return;

    const moduleName = moduleMatch[0];
    columns.add(moduleName);

    let remainder = fullKey.split(moduleName)[1]?.replace(/^\./, "");
    if (!remainder) return;

    const pathParts = remainder.split(".");
    if (pathParts.length < 2) return;

    const heading = pathParts[pathParts.length - 2];
    const variable = pathParts[pathParts.length - 1];

    // Add heading row once
    if (!headerAdded.has(heading)) {
      headerAdded.add(heading);
      rowOrder.push({ type: "header", label: heading });
    }

    // Add variable row
    const rowKey = `${heading}::${variable}`;
    if (!tableData[rowKey]) {
      tableData[rowKey] = { __label: variable };
      rowOrder.push({ type: "data", key: rowKey });
    }

    tableData[rowKey][moduleName] = value;
  });

  setMegaTable({
    fileNames: Array.from(columns),
    tableData,
    rowOrder,
  });
};
const getFilteredColumns = () => {
  if (!moduleFilter.trim()) return megaTable.fileNames;

  const tokens = moduleFilter
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  return megaTable.fileNames.filter(col =>
    tokens.some(t => col.toUpperCase().startsWith(t))
  );
};

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: "20px" }}>
      <h3>📂 Upload JSON Files</h3>
      <input type="file" accept=".json" multiple onChange={handleUpload} />

      <h3 style={{ marginTop: "20px" }}>📝 Paste Module Values</h3>
      <textarea
        rows={12}
        cols={100}
        value={textareaInput}
        onChange={(e) => setTextareaInput(e.target.value)}
        placeholder={`Example:
MB180_85/102.Transponder=4.69
MB180_204/258.Pilot 1=303
BLE180_204/258.Pilot 1=303
FML180_396/492.Frequency 1 Target=36.8`}
      />

      <br />
      <button
        onClick={() => {
  setTables([]);      // clear JSON tables
  setMegaTable(null); // reset first
  parseTextareaToMegaTable(textareaInput);
}}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          fontSize: "14px",
          cursor: "pointer",
          borderRadius: "5px",
          backgroundColor: "#6f42c1",
          color: "#fff",
          border: "none",
        }}
      >
        📊 Generate Mega Table
      </button>

      {/* ---------- JSON TABLES ---------- */}

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
                    <th key={f} style={paperStyles.th}>{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.keyOrder.map((v, i) => (
                  <tr key={v} style={{ backgroundColor: i % 2 ? "#fff" : "#f9f9f9" }}>
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

      {/* ---------- MEGA TABLE ---------- */}
      {megaTable && (
        <div style={paperStyles.paper}>
          <div style={paperStyles.title}>📊 Mega Table (All Modules)</div>
                <div style={{ marginBottom: "10px" }}>
  <input
    type="text"
    placeholder="Search by Model Number(i.e MB, BLE ...)"
    value={moduleFilter}
    onChange={(e) => setModuleFilter(e.target.value)}
    style={{
      padding: "6px 10px",
      fontSize: "13px",
      width: "320px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontFamily: "monospace"
    }}
  />
</div>
          <div style={paperStyles.tableWrapper}>
            <table style={paperStyles.table}>
              <thead>
                <tr>
                  <th style={paperStyles.th}>Variable</th>
                  {getFilteredColumns().map(col => (
                    <th key={col} style={paperStyles.th}>{col}</th>
                  ))}
                </tr>
              </thead>
      <tbody>
  {megaTable.rowOrder.map((row) => {
    if (row.type === "header") {
      return (
      <tr key={`header-${row.label}`}>
  <td
   style={{
  ...paperStyles.td,
  ...paperStyles.headerRow,
  backgroundColor: "green",
  color: "white",
}}
  >
    {row.label}
  </td>

  {getFilteredColumns().map(c => (
    <td
      key={c}
      style={{
  ...paperStyles.td,
  ...paperStyles.headerRow,
  backgroundColor: "green",
  color: "white",
}}
    />
  ))}
</tr>
      );
    }

    return (
     <tr key={`data-${row.key}`}>
        <td style={{
  ...paperStyles.td,
  ...paperStyles.headerRow,
  backgroundColor: "white",
  color: "blue",
}}>
          {megaTable.tableData[row.key].__label}
        </td>
        {getFilteredColumns().map(c => (
          <td key={c}  style={{
  ...paperStyles.td,
  ...paperStyles.headerRow,
  backgroundColor: "white",
  color: "black",
}}>
            {megaTable.tableData[row.key][c] ?? "-"}
          </td>
        ))}
      </tr>
    );
  })}
</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JSONUpload;