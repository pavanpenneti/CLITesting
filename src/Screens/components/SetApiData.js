import React, { useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSyncAlt,
  faLaptop,
  faPaperPlane,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Collapse,
} from '@mui/material';

function SetAPIData() {
  const [data, setData] = useState({});
  const [data4, setData4] = useState([]);
  const [ipAddress, setIpAddress] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [cardType, setCardType] = useState('');
  const [inputData, setInputData] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date());
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [showBox, setShowBox] = useState(false);
  const [rows, setRows] = useState([
    { input1: '', input2: '', input3: '', result: '', success: null },
  ]);
  const [output, setOutput] = useState('');
  const ipaddress = `http://${ipAddress}`;
  const serialno = serialNo;
  const iconStyle = { color: 'green' };

  const formattedTimestamp = timestamp
    .toLocaleString('en-IN', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    })
    .replace(/(\d+:\d+:\d+)( [ap]m)/, '$1 PM');

  // Fetch USB Devices
  const getUSBDevices = async () => {
    try {
      const response = await axios.get(`${ipaddress}/getusbdevices`);
      setData4(response.data);
    } catch (e) {
      alert('Check if the IP address is correct and the server is running.');
    }
  };

  // Refresh data for selected serialNo
  const refresh = async () => {
    if (
      serialNo.startsWith('MB') ||
      serialNo.startsWith('BLE') ||
      serialNo.startsWith('XPR') ||
      serialNo.startsWith('FM')
    ) {
      try {
        const response = await axios.get(
          `${ipaddress}/getcmsslotinfo?ipaddress=${serialno}&slotno=1&subslotno=0`
        );
        setData(response.data);
        setTimestamp(new Date());
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Post data with inputData and cardType
  const postData = async () => {
    try {
      const response = await axios.post(
        `http://${ipAddress}/setcmsdata?deviceid=${serialno}&cardtype=${cardType}&slotno=1&data=${inputData}`
      );
      setResponseData(response.data);
      setShowResponse(true);
      setTimestamp(new Date());
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  // Add new row
  const addRow = () => {
    setRows((prev) => {
      const updated = [
        ...prev,
        { input1: '', input2: '', input3: '', result: '', success: null },
      ];
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
      return updated;
    });
  };

  // Remove a row by index
  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };
  const clearResponses = () => {
    const clearedRows = rows.map(() => ({
      result: '',
      success: null,
    }));
    setRows(clearedRows);
  };

  // Update row field
  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // Handle SET action per row
  const handleSet = async (index) => {
    const row = rows[index];
    if (!row.input1 || !row.input2) {
      alert('Key and Value are required.');
      return;
    }

    const dataNew = `[{"key":"${row.input1.trim()}","value":"${row.input2.trim()}"}]`;

    try {
      const response = await axios.post(
        `http://${ipAddress}/setcmsdata?deviceid=${serialno}&cardtype=${cardType}&slotno=1&data=${dataNew}`
      );
      const updated = [...rows];
      updated[index].success = true;
      updated[index].result = JSON.stringify(response.data);
      setRows(updated);
      setTimestamp(new Date());
    } catch (error) {
      console.error(error);
      const updated = [...rows];
      updated[index].success = false;
      updated[index].result = 'Failed';
      setRows(updated);
    }
  };

  // Handle GET action per row
  const handleGet = async (index) => {
    const row = rows[index];
    const key = row.input3;
    if (!key) {
      alert('Input 3 (key to fetch) is required.');
      return;
    }

    try {
      const response = await axios.get(
        `${ipaddress}/getcmsslotinfo?ipaddress=${serialno}&slotno=1&subslotno=0`
      );
      const value = response.data?.[key] ?? 'Key not found';
      const updated = [...rows];
      updated[index].result = value;
      updated[index].success = value !== 'Key not found';
      setRows(updated);
      setTimestamp(new Date());
    } catch (error) {
      console.error(error);
      const updated = [...rows];
      updated[index].result = 'Error fetching data';
      updated[index].success = false;
      setRows(updated);
    }
  };

  // Export rows data as JSON file
  const exportData = () => {
    // Prompt for file name
    let filename = window.prompt('Enter file name:', 'XML_Cardtype_0x');
    if (!filename) return; // Exit if user cancels

    try {
      const blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`"${filename}.json" has been downloaded.`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. See console for details.');
    }
  };

  // Import rows data from JSON file
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setRows(imported);
        } else {
          alert('Invalid format. Expected an array.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };
  const handleExtract = () => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(
      `<root>${rawInput}</root>`,
      'text/xml'
    );
    const msgbytes = xmlDoc.getElementsByTagName('msgbyte');

    let result = '';

    for (let i = 0; i < msgbytes.length; i++) {
      const bytemsg = msgbytes[i].getAttribute('bytemsg');
      if (bytemsg) result += `${bytemsg}\n`;

      const attributes = msgbytes[i].getElementsByTagName('attribute-binding');
      for (let j = 0; j < attributes.length; j++) {
        const name = attributes[j].getAttribute('name');
        if (name) result += `${name}\n`;
      }

      result += `\n`; // spacing between blocks
    }

    setOutput(result.trim());
  };
const handleExtractStartEndByte = () => {
  const parser = new DOMParser();
  
  // Ensure XML is wrapped in a single root to avoid parse errors from comments
  const xmlDoc = parser.parseFromString(
    `<root>${rawInput}</root>`,
    'text/xml'
  );

  const msgbytes = xmlDoc.getElementsByTagName('msgbyte');
  let result = '';

  for (let i = 0; i < msgbytes.length; i++) {
    const bytemsg = msgbytes[i].getAttribute('bytemsg');
    if (bytemsg) result += `Message Byte: ${bytemsg}\n`;

    const attributes = msgbytes[i].getElementsByTagName('attribute-binding');
    for (let j = 0; j < attributes.length; j++) {
      const name = attributes[j].getAttribute('name');
      const stxindex = attributes[j].getAttribute('stxindex');
      const endindex = attributes[j].getAttribute('endindex');

      if (name)
        result += `  ${name} (Start: ${stxindex}, End: ${endindex})\n`;
    }

    result += `\n`; // spacing between each msgbyte section
  }

  setOutput(result.trim());
};


  const handleGenerate = () => {
    const lines = output.split('\n').map((line) => line.trim());
    //.filter(line => line ); // ignore 0x lines

    const resultArray = lines.map((variable) => ({
      input1: variable,
      input2: '',
      input3: variable,
      result: '',
      success: null,
    }));

    const blob = new Blob([JSON.stringify(resultArray, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'XML.json';
    link.click();
  };

  return (
    <Box sx={{ backgroundColor: '#D8DAE3', minHeight: '100vh', p: 2 }}>
      {/* Fixed top bar */}
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          p: 2,
          backgroundColor: '#D8DAE3',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <datalist id="ipAddresss">
          <option value="10.27.105.99" />
          <option value="192.168.1.170" />
          <option value="192.168.1.219" />
          <option value="192.168.20.1" />
        </datalist>

        <input
          type="text"
          placeholder="Enter IP Address"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          list="ipAddresss"
          style={{
            flex: '1 1 200px',
            padding: '8px',
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />

        <Button
          variant="contained"
          color="success"
          onClick={getUSBDevices}
          startIcon={<FontAwesomeIcon icon={faLaptop} />}
          sx={{ whiteSpace: 'nowrap' }}
        ></Button>

        <select
          value={serialNo}
          onChange={(e) => setSerialNo(e.target.value)}
          style={{
            flex: '1 1 150px',
            padding: '8px',
            borderRadius: 4,
            border: '1px solid #ccc',
            minWidth: 150,
          }}
        >
          <option value="" disabled>
            Select Device
          </option>
          {data4.map((item, i) => (
            <option key={i} value={item.data.usbaddress}>
              {item.data.usbaddress}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={cardType}
          onChange={(e) => setCardType(e.target.value)}
          placeholder="CardType"
          style={{
            width: 80,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />
        <Button
          variant="outlined"
          color="success"
          onClick={refresh}
          startIcon={<FontAwesomeIcon icon={faSyncAlt} style={iconStyle} />}
          sx={{ width: 42, height: 32, minWidth: 0, padding: 0, border: 1 }}
          title="GET/Refresh data"
        ></Button>

        <Button
          variant="outlined"
          onClick={exportData}
          sx={{ width: 32, height: 32, minWidth: 0, padding: 0, border: 1 }}
        >
          ⬇️
        </Button>

        <label htmlFor="import-file" style={{ cursor: 'pointer' }}>
          <Button
            variant="outlined"
            component="span"
            sx={{ width: 32, height: 32, minWidth: 0, padding: 0, border: 1 }}
          >
            ⬆️
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
        </label>

        <Box sx={{ width: '10%', mt: 1, fontSize: 12, color: 'green' }}>
          {formattedTimestamp}
        </Box>
      </Paper>

      {/* Spacer so content isn't hidden behind fixed top bar */}
      <Box sx={{ height: '65px' }} />

      {/* Input Form */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box className="p-4">
          <Button
            variant="outlined"
            onClick={() => setShowBox((prev) => !prev)}
            sx={{ mb: 1 }}
          >
            {showBox ? 'Hide Input Form' : 'Show Input Form'}
          </Button>

          <Collapse in={showBox}>
            <Box className="flex justify-center mt-4">
              <Paper elevation={4} sx={{ p: 4, maxWidth: 1450, width: '100%' }}>
                <TextField
                  label="Add XML Data "
                  placeholder="Paste XML Data to extract the variables"
                  multiline
                  rows={10}
                  fullWidth
                  variant="outlined"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginBottom: 1, marginRight:2}}
                  onClick={handleExtract}
                  
                >
                  Extract Variables
                </Button> 
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginBottom: 1 }}
                  onClick={handleExtractStartEndByte}
                  
                >
                  Extract Variables (Start Byte & End Byte)
                </Button>
                {output && (
                  <TextField
                    label="Extracted Output"
                    multiline
                    rows={15}
                    fullWidth
                    sx={{ mt: 3 }}
                    value={output}
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerate}
                  fullWidth
                >
                  Generate & Download JSON
                </Button>
              </Paper>
            </Box>
          </Collapse>
        </Box>
        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            mt: 1,
          }}
        >
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder='Enter data e.g. [{"key": "byIAPCtrl", "value": "1"}]'
            title='Ex: [{"key": "byIAPCtrl", "value": "1"}]'
            style={{
              flex: '1 1 300px',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />

          <Button
            variant="contained"
            color="success"
            onClick={postData}
            startIcon={<FontAwesomeIcon icon={faPaperPlane} />}
          ></Button>

          <Button
            variant="outlined"
            color="success"
            onClick={() => setShowResponse(!showResponse)}
            startIcon={
              <FontAwesomeIcon icon={showResponse ? faEyeSlash : faEye} />
            }
          >
            {/* {showResponse ? 'Hide Response' : 'Show Response'} */}
          </Button>
        </Box>

        {showResponse && responseData && (
          <Box
            sx={{
              mt: 2,
              backgroundColor: '#f0f0f0',
              borderRadius: 2,
              p: 2,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            <strong>Response:</strong>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </Box>
        )}
      </Paper>

      {/* Rows Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
       
        {rows.map((row, index) => (
          <Box
            key={index}
            sx={{
              mb: 0.2,
              mt: 0.5,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Key"
              value={row.input1}
              onChange={(e) => handleRowChange(index, 'input1', e.target.value)}
              style={{
                width: '250px',
                padding: 4,
                borderRadius: 4,
                border: '1px solid #ccc',
                color: 'rgb(0, 116, 232)',
              }}
            />
            <input
              type="text"
              placeholder="Value"
              value={row.input2}
              onChange={(e) => handleRowChange(index, 'input2', e.target.value)}
              style={{
                width: '250px',
                padding: 4,
                borderRadius: 4,
                border: '1px solid #ccc',
                color: 'rgb(221, 0, 169)',
              }}
            />
            <input
              type="text"
              placeholder="Variable to GET"
              value={row.input3}
              onChange={(e) => handleRowChange(index, 'input3', e.target.value)}
              style={{
                width: '250px',
                padding: 4,
                borderRadius: 4,
                border: '1px solid #ccc',
                color: 'brown',
              }}
            />

            <Button
              variant="text"
              color="success"
              onClick={() => handleSet(index)}
              sx={{ width: 30, height: 24, minWidth: 0, padding: 0, border: 1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="green"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </Button>

            <Button
              variant="text"
              color="success"
              onClick={() => handleGet(index)}
              sx={{ width: 30, height: 24, minWidth: 0, padding: 0, border: 1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="blue"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </Button>
            {showDeleteButtons && (
              <Button
                variant="text"
                onClick={() => removeRow(index)}
                sx={{
                  width: 30,
                  height: 24,
                  minWidth: 0,
                  padding: 0,
                  border: 1,
                }}
                color="error"
                title="Remove Row"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="red"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14H7L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </Button>
            )}

            {/* {row.success === true && (
              <Box sx={{ color: 'green', ml: 1, fontWeight: 'bold' }}>✅</Box>
            )}
            {row.success === false && (
              <Box sx={{ color: 'red', ml: 1, fontWeight: 'bold' }}>❌</Box>
            )} */}

            <input
              type="text"
              placeholder="SET and GET Response"
              value={row.result}
              style={{
                width: '500px',
                marginLeft: '2px',
                padding: 4,
                borderRadius: 4,
                border: '1px solid #ccc',
                color: 'rgb(221, 0, 169)',
              }}
            />
          </Box>
        ))}
         <Button
          variant="outlined"
          onClick={addRow}
          color="secondary"
          sx={{ width: 24, height: 24, minWidth: 0, padding: 0, border: 1 }}
        >
          <strong>+</strong>
        </Button>
        <Button
          color="error"
          sx={{
            width: 24,
            height: 24,
            marginLeft: 1,
            minWidth: 0,
            padding: 0,
            border: 1,
          }}
          onClick={() => setShowDeleteButtons(!showDeleteButtons)}
        >
          <strong></strong>{' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14H7L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </Button>
        <Button
          variant="outlined"
          onClick={clearResponses}
          color="primary"
          sx={{
            width: 24,
            marginLeft: 1,
            height: 24,
            minWidth: 0,
            padding: 0,
            border: 1,
          }}
        >
          <strong>X</strong>
        </Button>
      </Paper>
    </Box>
  );
}

export default SetAPIData;
