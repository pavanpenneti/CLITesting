import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const DataRetrivel = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workbookData, setWorkbookData] = useState(null);

  // Extract sheetId from URL
  const parseSheetUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const sheetId = pathParts[3];
      return sheetId;
    } catch {
      return null;
    }
  };

  const handleLoadSheet = async () => {
    const sheetId = parseSheetUrl(sheetUrl);
    if (!sheetId) {
      alert('⚠️ Invalid Google Sheets URL!');
      return;
    }

    const downloadUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

    setLoading(true);
    setTableData([]);
    setSheetNames([]);
    setSelectedSheet('');
    setWorkbookData(null);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Network response not OK');

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        setWorkbookData(workbook);
        setSheetNames(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0]); // auto-select first sheet
        loadSheetData(workbook, workbook.SheetNames[0]);
        setLoading(false);
      };

      reader.readAsArrayBuffer(blob);
    } catch (err) {
      alert('❌ Failed to fetch. Ensure the sheet is public and URL is correct.');
      setLoading(false);
    }
  };

  const loadSheetData = (workbook, sheetName) => {
    if (!workbook || !sheetName) return;
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const columnCount = rawRows[0]?.length || 0;
    const normalized = rawRows
      .map((row) => {
        const newRow = [...row];
        while (newRow.length < columnCount) newRow.push('');
        return newRow;
      })
      .filter((row) => row.some((cell) => cell !== ''));

    setTableData(normalized);
  };

  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    loadSheetData(workbookData, sheetName);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Paste your Google Sheet URL..."
            style={styles.input}
          />
          
          <button onClick={handleLoadSheet} style={styles.button}>
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {sheetNames.length > 0 && (
          <div style={styles.dropdownWrapper}>
            <label style={styles.label}>Select Sheet:</label>
            <select
              value={selectedSheet}
              onChange={handleSheetChange}
              style={styles.select}
            >
              {sheetNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!loading && tableData.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {tableData[0].map((header, i) => (
                    <th key={i} style={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                    }}
                  >
                    {row.map((cell, j) => (
                      <td key={j} style={styles.td}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Styling
const styles = {
  page: {
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    padding: '10px 5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '99%',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    gap: '5px',
    marginBottom: '5px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '4px 6px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    marginLeft: '25%',
    maxWidth:'40%'
  },
  button: {
    padding: '10px 20px',
    fontSize: '15px',
    backgroundColor: 'green',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  dropdownWrapper: {
    marginBottom: '15px',
    marginLeft: '40%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontWeight: '500',
    color: '#333',
  },
  select: {
    padding: '8px 12px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '10px',
    backgroundColor: '#f2f2f2',
    border: '1px solid #ddd',
    textAlign: 'left',
    //color: '#333',
  },
  td: {
    padding: '10px',
    border: '1px solid #aea',
    whiteSpace: 'nowrap',
    //color: '#555',
  },
};

export default DataRetrivel;
