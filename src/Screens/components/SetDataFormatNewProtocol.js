import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './button.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faTerminal,
  faClipboard,
  faCalendarAlt,
  faNetworkWired,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';
function SetDataFormatNewProtocol() {
  const [numZeros, setNumZeros] = useState(0);
  const [startNumber, setStartNumber] = useState('');
  const [endNumber, setEndNumber] = useState('');
  const [result, setResult] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputText, setInputText] = useState('');
  const [appendedData, setAppendedData] = useState([]);
  const [addappendData, setaddappenData] = useState([]);
  const iconStyle = { color: 'green' };
  const handleSubmit = (event) => {
    event.preventDefault();
    const start = parseInt(startNumber);
    const end = parseInt(endNumber);
    const zeros = '00 '.repeat(end - start + 1);
    setResult((prevResult) => prevResult + zeros + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, zeros]);
    setStartNumber('');
    setEndNumber('');
  };
  const handleInputChange1 = (event) => {
    const value = event.target.value;
    setInputValue(value);
  };

  const handleSubmit1 = (event) => {
    event.preventDefault();
    setResult((prevResult) => prevResult + inputValue + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, inputValue]);
    setInputValue('');
  };

  const convertToHex = (event) => {
    event.preventDefault();
    const asciiArray = [];
    for (let i = 0; i < inputText.length; i++) {
      const asciiValue = inputText.charCodeAt(i);
      const hexValue = asciiValue.toString(16).toUpperCase();
      asciiArray.push(hexValue);
    }
    const newHexString = asciiArray.join(' ');
    setResult((prevResult) => prevResult + ' ' + newHexString);
    setAppendedData((prevAppendedData) => [...prevAppendedData, newHexString]);
  };

  const convertToHexInReverse = (event) => {
    event.preventDefault();
    const asciiArray = [];
    for (let i = 0; i < inputText.length; i++) {
      const asciiValue = inputText.charCodeAt(i);
      const hexValue = asciiValue.toString(16).toUpperCase();
      asciiArray.push(hexValue);
    }
    const reversedHexArray = asciiArray.reverse();
    const newHexString = reversedHexArray.join(' ');
    setResult((prevResult) => prevResult + ' ' + newHexString);
    setAppendedData((prevAppendedData) => [...prevAppendedData, newHexString]);
  };

  const convertTofloat = (event) => {
    event.preventDefault();
    const floatValueParsed = parseFloat(inputText);
    if (!isNaN(floatValueParsed)) {
      const byteValue = Math.round(floatValueParsed) & 0xff;
      const hexValue = byteValue.toString(16).toUpperCase().padStart(2, '0');
      setResult((prevResult) => prevResult + ' ' + hexValue + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexValue]);
    }
  };

  const clearLastAppendedData = (event) => {
    event.preventDefault();
    if (appendedData.length > 0) {
      const updatedData = [...appendedData];
      updatedData.pop();
      setAppendedData(updatedData);
    }
  };

  const convertTofloattwoByte = (event) => {
    event.preventDefault();
    const floatValueParsed = parseFloat(inputText);
    if (!isNaN(floatValueParsed)) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, floatValueParsed);
      const hexArray = [];
      for (let i = 0; i < 4; i++) {
        const byteValue = view.getUint8(i);
        hexArray.push(byteValue.toString(16).toUpperCase().padStart(2, '0'));
        hexArray.push(' ');
      }
      const hexString = hexArray.join('');
      setResult((prevResult) => prevResult + ' ' + hexString);
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    }
  };

  const convertTofloattwoByteReverse = (event) => {
    event.preventDefault();
    const floatValueParsed = parseFloat(inputText);
    if (!isNaN(floatValueParsed)) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, floatValueParsed);
      const hexArray = [];
      for (let i = 3; i >= 0; i--) {
        const byteValue = view.getUint8(i);
        hexArray.push(byteValue.toString(16).toUpperCase().padStart(2, '0'));
        hexArray.push(' ');
      }
      const hexString = hexArray.join('');
      setResult((prevResult) => prevResult + ' ' + hexString);
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    }
  };

  const convertTofloat2 = (event) => {
    event.preventDefault();
    const floatValueParsed = parseFloat(inputText);
    if (!isNaN(floatValueParsed)) {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, Math.round(floatValueParsed), false);
      const hexValue = Array.from(new Uint8Array(buffer), (byte) =>
        byte.toString(16).toUpperCase().padStart(2, '0')
      ).join(' ');
      setResult((prevResult) => prevResult + ' ' + hexValue + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexValue]);
    }
  };

  const convertTofloat2Reverse = (event) => {
    event.preventDefault();
    const floatValueParsed = parseFloat(inputText);
    if (!isNaN(floatValueParsed)) {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, Math.round(floatValueParsed), true);
      const hexValue = Array.from(new Uint8Array(buffer), (byte) =>
        byte.toString(16).toUpperCase().padStart(2, '0')
      ).join(' ');
      setResult((prevResult) => prevResult + ' ' + hexValue + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexValue]);
    }
  };

  const convertToInt2 = (event) => {
    event.preventDefault();
    const spacedHexString = parseInt(inputText)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    const hexString = spacedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };

  const convertToInt2Reverse = (event) => {
    event.preventDefault();
    const spacedHexString = parseInt(inputText)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    const bytes = spacedHexString.match(/.{1,2}/g); // Split the string into 2-character bytes
    const reversedHexString = bytes.reverse().join('');
    const hexString = reversedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };

  const convertToInt4Byte = (event) => {
    event.preventDefault();
    const spacedHexString = parseInt(inputText)
      .toString(16)
      .toUpperCase()
      .padStart(8, '0');
    const hexString = spacedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };

  const convertToInt4ByteReverse = (event) => {
    event.preventDefault();
    const spacedHexString = parseInt(inputText)
      .toString(16)
      .toUpperCase()
      .padStart(8, '0');
    const bytes = spacedHexString.match(/.{1,2}/g); // Split the string into 2-character bytes
    const reversedHexString = bytes.reverse().join('');
    const hexString = reversedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };

  const signedconvertToInt2Byte = (event) => {
    event.preventDefault();
    if (parseInt(inputText) >= -32768 && parseInt(inputText) <= 32767) {
      const spacedHexString = (
        parseInt(inputText) >= 0
          ? parseInt(inputText)
          : 65536 + parseInt(inputText)
      )
        .toString(16)
        .toUpperCase()
        .padStart(4, '0'); // Convert to hex and pad to 8 characters
      const hexString = spacedHexString.replace(/(..)(?!$)/g, '$1 ');
      setResult((prevResult) => prevResult + ' ' + hexString + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    } else {
      // Handle invalid input
      setInputText('');
    }
  };

  const signedconvertToInt2ByteReverse = (event) => {
    event.preventDefault();
    if (parseInt(inputText) >= -32768 && parseInt(inputText) <= 32768) {
      const spacedHexString = (
        parseInt(inputText) >= 0
          ? parseInt(inputText)
          : 65536 + parseInt(inputText)
      )
        .toString(16)
        .toUpperCase()
        .padStart(4, '0'); // Convert to hex and pad to 8 characters
      const bytes = spacedHexString.match(/.{1,2}/g); // Split the string into 2-character bytes
      const reversedHexString = bytes.reverse().join('');
      const hexString = reversedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
      setResult((prevResult) => prevResult + ' ' + hexString + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    } else {
      // Handle invalid input
      setInputText('');
    }
  };

  const signedconvertToInt4Byte = (event) => {
    event.preventDefault();
    if (
      parseInt(inputText) >= -2147483648 &&
      parseInt(inputText) <= 2147483647
    ) {
      const spacedHexString = (
        parseInt(inputText) >= 0
          ? parseInt(inputText)
          : 4294967296 + parseInt(inputText)
      )
        .toString(16)
        .toUpperCase()
        .padStart(8, '0'); // Convert to hex and pad to 8 characters
      const hexString = spacedHexString.replace(/(..)(?!$)/g, '$1 ');
      setResult((prevResult) => prevResult + ' ' + hexString + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    } else {
      // Handle invalid input
      setInputText('');
    }
  };

  const signedconvertToInt4ByteReverse = (event) => {
    event.preventDefault();
    if (
      parseInt(inputText) >= -2147483648 &&
      parseInt(inputText) <= 2147483647
    ) {
      const spacedHexString = (
        parseInt(inputText) >= 0
          ? parseInt(inputText)
          : 4294967296 + parseInt(inputText)
      )
        .toString(16)
        .toUpperCase()
        .padStart(8, '0'); // Convert to hex and pad to 8 characters
      const bytes = spacedHexString.match(/.{1,2}/g); // Split the string into 2-character bytes
      const reversedHexString = bytes.reverse().join('');
      const hexString = reversedHexString.replace(/(..)(?!$)/g, '$1 '); // Convert to hex and pad to 4 characters
      setResult((prevResult) => prevResult + ' ' + hexString + ' ');
      setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
    } else {
      // Handle invalid input
      setInputText('');
    }
  };

  const doubleToHex = (event) => {
    event.preventDefault();

    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, inputText, true); // Assuming little-endian format
    const byteArray = new Uint8Array(buffer);
    const hexArray = Array.from(byteArray).map((byte) =>
      byte.toString(16).padStart(2, '0')
    );
    const hexString1 = hexArray.reverse().join('');
    const hexString = hexString1.replace(/(..)(?!$)/g, '$1 ');

    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };
  const reversedoubleToHex = (event) => {
    event.preventDefault();

    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, inputText, true); // Assuming little-endian format
    const byteArray = new Uint8Array(buffer);
    const hexArray = Array.from(byteArray).map((byte) =>
      byte.toString(16).padStart(2, '0')
    );
    const hexString1 = hexArray.join('');
    const hexString = hexString1.replace(/(..)(?!$)/g, '$1 ');

    setResult((prevResult) => prevResult + ' ' + hexString + ' ');
    setAppendedData((prevAppendedData) => [...prevAppendedData, hexString]);
  };

  const saveAppendedData = (event) => {
    event.preventDefault();
    const newData = (prevData) => [...prevData, appendedData];
    
    setaddappenData(newData);
    setAppendedData([]);
    
  };
  const clearAppendData = (event) => {
    event.preventDefault();
    setAppendedData([]);
  };

  const clearData = (event) => {
    event.preventDefault();
    setaddappenData([]);
  };

  const saveDataToNotepad = (event) => {
    event.preventDefault();
    const data1 = addappendData.join('\n');
    const data = data1.replace(/,/g, '');
    console.log(data);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LogData.txt'; // Set the desired file name
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        padding: '2px 0',
        width: '100%',
        color: 'black',
        top: 0,
        marginLeft: '0px',
        backgroundColor: '#f1f1f1',
      }}
    >
      <form>
        <label>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange1}
            placeholder="Append the data"
            style={{ marginLeft: '150px' }}
          />
        </label>
        <button
          className="primary-button"
          type="submit"
          onClick={handleSubmit1}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Append
        </button>

        <input
          type="text"
          value={startNumber}
          placeholder="Enter Starting No."
          style={{ marginLeft: '10px', marginRight: '10px' }}
          onChange={(e) => setStartNumber(e.target.value)}
        />
        <input
          type="text"
          value={endNumber}
          placeholder="Enter Ending No."
          onChange={(e) => setEndNumber(e.target.value)}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
          onClick={handleSubmit}
        >
          Generate 0's
        </button>
        <label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </label>
        <button
          onClick={convertToHex}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          ASCII-Hex
        </button>
        <button
          onClick={convertToHexInReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          ~ASCII-Hex
        </button>
        {/* <button style={{ marginLeft: "5px", marginRight: "5px"}}>
        <Link to="/ApiData">API Data</Link>
      </button>
      <button style={{ marginLeft: "5px", marginRight: "5px"}}>
        <Link to="/CLIData">CLI Data</Link>
      </button>
      <button style={{ marginLeft: "5px", marginRight: "5px"}}>
        <Link to="/LogData">Log Data</Link>
      </button> */}
        <button style={{ marginLeft: '2px' }}>
          <Link to="/apiData">
            <FontAwesomeIcon
              icon={faDatabase}
              size="1.5x"
              style={iconStyle}
              title="API Data"
            />
          </Link>
        </button>
        <button style={{ marginLeft: '2px' }}>
          <Link to="/LogData">
            <FontAwesomeIcon
              icon={faFileAlt}
              size="1.5x"
              style={iconStyle}
              title="Log Data"
            />
          </Link>
        </button>

        <button style={{ marginLeft: '2px' }}>
          <Link to="/CLIData">
            <FontAwesomeIcon
              icon={faTerminal}
              size="1.5x"
              style={iconStyle}
              title="CLI Data"
            />
          </Link>
        </button>
        <button style={{ marginLeft: '2px' }}>
          <Link to="/dailyReport">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              size="1.5x"
              style={iconStyle}
              title="Daily Report"
            />
          </Link>
        </button>
        <button style={{ marginLeft: '2px' }}>
          <Link to="/diagnosticstool">
            <FontAwesomeIcon
              icon={faNetworkWired}
              size="1.5x"
              style={iconStyle}
              title="Diagnostics tool"
            />
          </Link>
        </button>
        <br />

        <button
          onClick={convertTofloat}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          Float-Hex_1b{' '}
        </button>
        <button
          onClick={convertTofloat2}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          Float-Hex_2b{' '}
        </button>
        <button
          onClick={convertTofloat2Reverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          ~Float-Hex_2b
        </button>
        <button
          onClick={convertTofloattwoByte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          Float-Hex_4b{' '}
        </button>
        <button
          onClick={convertTofloattwoByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          ~Float-Hex_4b{' '}
        </button>
        <button
          onClick={doubleToHex}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          double-Hex_8b{' '}
        </button>

        <button
          onClick={reversedoubleToHex}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          ~double-Hex_8b{' '}
        </button>
        <button
          onClick={convertToInt2}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          uInt-Hex_2b{' '}
        </button>
        <button
          onClick={convertToInt2Reverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          ~uInt-Hex_2b
        </button>
        <button
          onClick={convertToInt4Byte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          uInt-Hex_4b{' '}
        </button>
        <button
          onClick={convertToInt4ByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          ~uInt-Hex_4b{' '}
        </button>
        <button
          onClick={signedconvertToInt2Byte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          Int-Hex_2b{' '}
        </button>
        <button
          onClick={signedconvertToInt2ByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#5c2049',
            color: 'white',
          }}
        >
          ~Int-Hex_2b
        </button>
        <button
          onClick={signedconvertToInt4Byte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          Int-Hex_4b{' '}
        </button>
        <button
          onClick={signedconvertToInt4ByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          ~Int-Hex_4b{' '}
        </button>
      </form>
      <div>
        <div
          style={{
            position: 'fixed',
  marginRight: '8px',
  top: '65px', // Keeps it fixed at a certain point from top
  width: '100%',
  color: 'black',
  backgroundColor: '#f1f1f1',
  fontFamily: 'monospace',
  whiteSpace: 'nowrap', // Prevents wrapping inside the div
  overflowX: 'auto', // Enables horizontal scrolling
  overflowY: 'auto', // Enables vertical scrolling
  height: '220px', // Limits the height for vertical scrolling
  padding: '5px'
          }}>
            <button
              onClick={clearLastAppendedData}
              style={{
                marginRight: '10px',
                background: 'green',
                color: 'white',
              }}
            >
              Clear Last Appended Data
            </button>
            <button
              onClick={clearAppendData}
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                background: 'green',
                color: 'white',
              }}
            >
              Clear Data
            </button>
            <button
              onClick={saveAppendedData}
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                background: 'green',
                color: 'white',
              }}
            >
              Save Data
            </button>

            <p style={{ 
    color: 'red', 
    fontFamily: 'monospace', 
    fontWeight: 'bold',
    margin: 0, 
    padding: '0px',
    position: 'sticky',  // Makes it sticky
    top: 0,  // Keeps it stuck at the top of the container
    backgroundColor: '#f1f1f1' // Optional: gives a background color to differentiate the sticky element
  }}>
    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 14 15 16 17 18 
    19 1A 1B 1C 1D 1E 1F 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 
    32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F 40 41 42 43 44 45 46 47 48 49 4A 
    4B 4C 4D 4E 4F 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F 60 61 62 63 
    64 65 66 67 68 69 6A 6B 6C 6D 6E 6F 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 
    7D 7E 7F 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 
    96 97 98 99 9A 9B 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE 
    AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5
  </p>
  <p style={{ 
    color: 'red', 
    fontFamily: 'monospace', 
    fontWeight: 'bold',
    margin: 0, 
    padding: '0px',
    position: 'sticky',  // Makes it sticky
    top: 0,  // Keeps it stuck at the top of the container
    backgroundColor: '#f1f1f1' // Optional: gives a background color to differentiate the sticky element
  }}>
    00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
    27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52
    53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78
    79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 00 01 02 03 04
    05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
    31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56
    57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82
    83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99
  </p>
          {appendedData.map((result, index) => (
            <span key={index}>{result} </span>
          ))}
        </div>
      </div>
      <div
        style={{
        position: 'fixed',
        marginRight: '8px',
        top: '295px', // Keeps it fixed at a certain point from top
        width: '99%',
        color: 'black',
        backgroundColor: '#f1f1f1',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap', // Prevents wrapping inside the div
        overflowX: 'auto', // Enables horizontal scrolling
        overflowY: 'auto', // Enables vertical scrolling
        height: '250px', // Limits the height for vertical scrolling
        padding: '5px'
        }}
      >
        <label>
          <b>History</b>
        </label>
        <button
          onClick={clearData}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Clear Data
        </button>
        <button
          onClick={saveDataToNotepad}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Save Data to Notepad
        </button>
      
        <p style={{ 
    color: 'red', 
    fontFamily: 'monospace', 
    fontWeight: 'bold',
    margin: 0, 
    padding: '0px',
    position: 'sticky',  // Makes it sticky
    top: 0,  // Keeps it stuck at the top of the container
    backgroundColor: '#f1f1f1' // Optional: gives a background color to differentiate the sticky element
  }}>
    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 14 15 16 17 18 
    19 1A 1B 1C 1D 1E 1F 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 
    32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F 40 41 42 43 44 45 46 47 48 49 4A 
    4B 4C 4D 4E 4F 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F 60 61 62 63 
    64 65 66 67 68 69 6A 6B 6C 6D 6E 6F 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 
    7D 7E 7F 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 
    96 97 98 99 9A 9B 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE 
    AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5
  </p>
  <p style={{ 
    color: 'red', 
    fontFamily: 'monospace', 
    fontWeight: 'bold',
    margin: 0, 
    padding: '0px',
    position: 'sticky',  // Makes it sticky
    top: 0,  // Keeps it stuck at the top of the container
    backgroundColor: '#f1f1f1' // Optional: gives a background color to differentiate the sticky element
  }}>
    00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
    27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52
    53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78
    79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 00 01 02 03 04
    05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
    31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56
    57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82
    83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99
  </p>
        <pre>{addappendData.join('\n').replace(/,/g, ' ')}</pre>
      </div>
      
      <div
        style={{
        position: 'fixed',
        marginRight: '8px',
        top: '550px', // Keeps it fixed at a certain point from top
        width: '99%',
        color: 'black',
        backgroundColor: '#f1f1f1',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap', // Prevents wrapping inside the div
        overflowX: 'auto', // Enables horizontal scrolling
        overflowY: 'auto', // Enables vertical scrolling
        height: '300px', // Limits the height for vertical scrolling
        padding: '5px'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: addappendData.join('<br/>').replace(/[,\s]/g, '') }} />
      </div>
    </div>
  );
}

export default SetDataFormatNewProtocol;
