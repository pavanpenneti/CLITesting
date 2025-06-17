import React, { useState } from 'react';
import upload from '../../assets/images/upload.png';
const DiagnosticsTool = () => {
  const [logData, setLogData] = useState('00 00 00 00 ');
  const [result, setResult] = useState([]);
  const [appendData, setAppendData] = useState([]);
  const [formattedJSON, setFormattedJSON] = useState('');
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([
    {
      varByte: '',
      startByte: '',
      endByte: '',
      selectedOption: 'Conversion Type',
      extraTextBoxes: [], // Stores dynamically added textboxes in each row
    },
  ]);

  const options = [
    'mergeData',
    'date',
    'Version',
    'Hardware Rev.',
    'Split Byte to Bit',
    'Split 2 Values',
    'Split 3 Values',
    'Split 6 Values',
    'Split 7 Values',
    'Split Hex',
    'Reverse',
    'Reverse & Merge',
    'Decimal',
    '~Decimal',
    'Binary',
    '~Binary',
    'Time',
    "Time_ms",
    'No. of Characters',
    'No. of Words',
    'Checksum',
    'Hex-ASCII',
    '~Hex-ASCII',
    'Hex_1b_uInt',
    'Hex_1b_Int',
    'Hex_2b_Int',
    '~Hex_2b_Int',
    'Hex_2b_uInt',
    '~Hex_2b_uInt',
    'Hex_4b_uInt',
    '~Hex_4b_uInt',
    'Hex_8b_Int',
    '~Hex_8b_Int',
    'Hex_4b_Int',
    '~Hex_4b_Int',
    'Hex_4b_Float',
    '~Hex_4b_Float',
  ];
  const handleFileUpload1 = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleClick = () => {
    document.getElementById("fileInput").click(); // Trigger click on the hidden file input
  };
  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString(); // Formats as "MM/DD/YYYY, HH:MM:SS AM/PM"
  };
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        varByte: '',
        startByte: '',
        endByte: '',
        selectedOption: 'Conversion Type',
        extraTextBoxes: [],
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };
  const handleAddTextBox = (index) => {
    const updatedRows = [...rows];
    updatedRows[index].extraTextBoxes.push('');
    setRows(updatedRows);
  };

  const handleRemoveTextBox = (index) => {
    const updatedRows = [...rows];
    if (updatedRows[index].extraTextBoxes.length > 0) {
      updatedRows[index].extraTextBoxes.pop();
      setRows(updatedRows);
    }
  };
  const handleInputChange = (index, field, value, extraIndex = null) => {
    const updatedRows = [...rows];

    if (extraIndex !== null) {
      // If updating extraTextBoxes inside a row
      updatedRows[index].extraTextBoxes[extraIndex] = value;
    } else {
      // If updating normal fields
      updatedRows[index][field] = value;
    }

    setRows(updatedRows);
  };
  const mergeData = (data) => {
    return data.replace(/\s+/g, '');
  };
  const reverseData = (data) => {
    return data.split(' ').reverse().join(' ');
  };
  const reverseMergeData = (data) => {
    return data.split(' ').reverse().join('');
  };
  const convertToHex = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    const asciiString = String.fromCharCode(...byteArray);
    return asciiString;
  };
  const convertToHexInReverse = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    byteArray.reverse();
    const asciiString = String.fromCharCode(...byteArray);
    return asciiString;
  };
  const convertTofloat = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);
    if (intValue >= 0 && intValue <= 255) {
      return intValue;
    }
  };
  const convertTofloat2 = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);
    if (intValue >= 0x80) {
      return intValue - 0x100;
    }
  };
  const hexToDecimal = (value) => {
    return parseInt(value, 16).toString();
  };
  const date = (data) => {
    let hexBytes = data.split(' ');
    const yy = hexToDecimal(hexBytes[0]);
    const mm = hexToDecimal(hexBytes[1]);
    const dd = hexToDecimal(hexBytes[2]);
    const date_ = `${mm}-${dd}-${yy}`;
    return date_;
  };
  const ConvertDotData = (splitdata) => {
    let hexBytes = splitdata.split(' ');
    const data1 = hexToDecimal(hexBytes[0]);
    const data2 = hexToDecimal(hexBytes[1]);
    const data = `${data1}.${data2}`;
    return data;
  };
  const hexToAscii = (hex) => {
    return String.fromCharCode(parseInt(hex, 16)); 
  };
  const HardwareVer= (splitdata) => {
    let hexBytes = splitdata.split(' ');
    const data1 = hexToAscii(hexBytes[0]);
    const data2 = hexToAscii(hexBytes[1]);
    const data = `${data1}.${data2}`;
    console.log(data);
    return data;

  };
  const convertToBinary = (hexValue) => {
    const binaryValue = parseInt(hexValue, 16).toString(2).padStart(8, '0');
    return binaryValue.split('').reverse().join('');
  };
  const splitBytetoBit = (splitdata, row) => {
    let hexBytes = splitdata.split(' ');
    const hexValue = hexToDecimal(hexBytes[row.extraTextBoxes[0]]);
    const binaryValue = convertToBinary(hexValue);
    return binaryValue[row.extraTextBoxes[0]] === '1'
      ? row.extraTextBoxes[2]
      : row.extraTextBoxes[1];
  };

  function convert2Values(splitdata, row) {
    const data1 = splitdata.split(' ');
    if (data1[0] === '00') {
      return row.extraTextBoxes[0];
    }
    if (data1[0] === '01') {
      return row.extraTextBoxes[1];
    }
    return data1[0];
  }

  function convert3Values(splitdata, row) {
    const data1 = splitdata.split(' ');

    if (data1[0] === '00') {
      return row.extraTextBoxes[0];
    }
    if (data1[0] === '01') {
      return row.extraTextBoxes[1];
    }
    if (data1[0] === '02') {
      return row.extraTextBoxes[2];
    }
    return data1[0];
  }

  function convert6Values(splitdata, row) {
    const data1 = splitdata.split(' ');

    if (data1[0] === '00') {
      return row.extraTextBoxes[0];
    }
    if (data1[0] === '01') {
      return row.extraTextBoxes[1];
    }
    if (data1[0] === '02') {
      return row.extraTextBoxes[2];
    }
    if (data1[0] === '03') {
      return row.extraTextBoxes[3];
    }
    if (data1[0] === '04') {
      return row.extraTextBoxes[4];
    }
    if (data1[0] === '05') {
      return row.extraTextBoxes[5];
    }
    return data1[0];
  }

  function convert7Values(splitdata, row) {
    const data1 = splitdata.split(' ');

    if (data1[0] === '00') {
      return row.extraTextBoxes[0];
    }
    if (data1[0] === '01') {
      return row.extraTextBoxes[1];
    }
    if (data1[0] === '02') {
      return row.extraTextBoxes[2];
    }
    if (data1[0] === '03') {
      return row.extraTextBoxes[3];
    }
    if (data1[0] === '04') {
      return row.extraTextBoxes[4];
    }
    if (data1[0] === '05') {
      return row.extraTextBoxes[5];
    }
    if (data1[0] === '06') {
      return row.extraTextBoxes[6];
    }
    return data1[0];
  }

  const splitHex = (data) => {
    const normalizedInput = data.match(/.{1,2}/g)?.join(' ') || ''; // Remove all spaces
    return normalizedInput;
  };
  const convertToDecimal = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    return decimalNumber;
  };
  const convertToDecimalReverse = (data) => {
    const reversedHex = data.split('').reverse().join('');
    const hexWithoutSpaces = reversedHex.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    return decimalNumber;
  };
  const ConvertToBinary = (data) => {
    const decimalNumber = parseInt(data, 16);
    const binaryString = decimalNumber.toString(2);
    return binaryString;
  };
  const ConvertToBinaryReverse = (data) => {
    const reversedHex = data.split('').reverse().join('');
    const decimalNumber = parseInt(reversedHex, 16);
    const binaryString = decimalNumber.toString(2);
    return binaryString;
  };
  const Display_time = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
  
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
  
    let signedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      signedInt += byteArray[i] << (i * 8);  // Correct bitwise shift approach
    }
  
    const daysValue = Math.floor(signedInt / (24 * 3600));
    const hoursValue = Math.floor((signedInt % (24 * 3600)) / 3600);
    const minutesValue = Math.floor((signedInt % 3600) / 60);
    const secondsValue = signedInt % 60;
  
    return `${daysValue} days ${hoursValue} hours ${minutesValue} mins ${secondsValue} secs`;
  };
  

  
  const Display_time_ms = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    //byteArray.reverse();

    let signedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      signedInt |= byteArray[i] << (i * 8);
    }

    const totalSeconds = Math.floor(signedInt)*0.01;
    console.log('Modified seconds:', totalSeconds);
    
    const daysValue = Math.floor(totalSeconds / (24 * 3600));
    const hoursValue = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutesValue = Math.floor((totalSeconds % 3600) / 60);
    const secondsValue = Math.abs(totalSeconds % 60);
    const time_data =
      daysValue +
      ' days ' +
      hoursValue +
      ' hours ' +
      minutesValue +
      ' mins ' +
      secondsValue +
      ' secs';
    return time_data;
  };
  const NoOfCharacters = (data) => {
    const characterslength = data.length;
    return characterslength;
  };

  const NoOfWords = (data) => {
    const wordslength = data.trim().split(/\s+/).filter(Boolean).length;
    return wordslength;
  };
  const checksum = (data) => {
    // Preprocess the inputText
    const normalizedInput = data.trim().replace(/ /g, ''); // Remove all spaces
    const hexArray = normalizedInput.match(/.{1,2}/g); // Split into 2-character chunks

    if (!hexArray) {
      throw new Error('Invalid input. Please provide valid hex values.');
    }

    const decimalValues = hexArray.map((hex) => {
      if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
        throw new Error(`Invalid hex value: ${hex}`);
      }
      return parseInt(hex, 16);
    });

    const totalSum = decimalValues.reduce((acc, value) => acc + value, 0);
    const checksum = totalSum > 0xff ? totalSum % 0xff : totalSum;
    const checksumHex = checksum.toString(16).toUpperCase().padStart(2, '0');
    return checksumHex;
  };
  const convertTofloattwoByte = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }

    // Create a Float32Array from the byte array
    const floatArray = new Float32Array(new Uint8Array(byteArray).buffer);

    // Extract the float value
    const floatValue = floatArray[0];

    // Set the float output
    return floatValue;
  };

  const convertTofloattwoByteReverse = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }

    // Reverse the byte array
    byteArray.reverse();

    // Create a Float32Array from the byte array
    const floatArray = new Float32Array(new Uint8Array(byteArray).buffer);

    // Extract the float value
    const floatValue = floatArray[0];
    return floatValue;
  };

  function hexToBinary(hex) {
    return parseInt(hex, 16).toString(2).padStart(64, '0');
  }
  const convertHexToDouble = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const binaryValue = hexToBinary(hexWithoutSpaces);
    const sign = binaryValue.charAt(0) === '1' ? -1 : 1;
    const exponent = parseInt(binaryValue.substr(1, 11), 2) - 1023;
    const mantissa =
      1 +
      binaryValue
        .substr(12)
        .split('')
        .reduce((sum, bit, index) => {
          return sum + (bit === '1' ? Math.pow(2, -index - 1) : 0);
        }, 0);
    const doubleValue = sign * Math.pow(2, exponent) * mantissa;

    return doubleValue;
  };
  const reverseconvertHexToDouble = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      const hexPair = hexWithoutSpaces.substr(i, 2);
      byteArray.push(hexPair);
    }

    const hexWithoutSpaces1 = byteArray.reverse().join('');

    const binaryValue = hexToBinary(hexWithoutSpaces1);
    const sign = binaryValue.charAt(0) === '1' ? -1 : 1;
    const exponent = parseInt(binaryValue.substr(1, 11), 2) - 1023;
    const mantissa =
      1 +
      binaryValue
        .substr(12)
        .split('')
        .reduce((sum, bit, index) => {
          return sum + (bit === '1' ? Math.pow(2, -index - 1) : 0);
        }, 0);
    const doubleValue = sign * Math.pow(2, exponent) * mantissa;

    return doubleValue;
  };
  const signedconvertToInt2Byte = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);
    if (intValue >= 0x8000 && intValue <= 32767) {
      return intValue - 0x10000;
    } else {
      return null;
    }
  };

  const signedconvertToInt2ByteReverse = (data) => {
  const hexWithoutSpaces = data.replace(/\s/g, '');
  if (hexWithoutSpaces.length !== 4) {
    throw new Error("Expected exactly 2 bytes (4 hex digits)");
  }

  // Split into bytes and reverse
  const byte1 = parseInt(hexWithoutSpaces.substr(0, 2), 16);
  const byte2 = parseInt(hexWithoutSpaces.substr(2, 2), 16);

  // Reverse the order for little-endian interpretation
  const reversed = (byte2 << 8) | byte1;

  // Convert to signed 16-bit
  return (reversed & 0x8000) ? reversed - 0x10000 : reversed;
};


  const signedconvertToInt4Byte = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    var intValue = parseInt(hexWithoutSpaces, 16);
    if (intValue & 0x80000000) {
      intValue = intValue - 0x100000000;
    }
    return intValue;
  };

  const signedconvertToInt4ByteReverse = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    byteArray.reverse();

    let signedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      signedInt |= byteArray[i] << (i * 8);
    }
    return signedInt;
  };
  const convertToInt4Byte = (data) => {
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);

    // Ensure that the value is within the valid uint32 range (0 to 4294967295)
    if (intValue >= 0 && intValue <= 4294967295) {
      return intValue;
    } else {
      // Handle out-of-range input
      return null;
    }
  };

  const convertToInt4ByteReverse = (data) => {
    // Remove spaces from the input hexadecimal string
    const hexWithoutSpaces = data.replace(/\s/g, '');
  
    // Create a byte array by parsing the hex string
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
  
    // Now interpret the byteArray in little-endian order
    let unsignedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      unsignedInt |= byteArray[i] << (i * 8); // Little-endian byte shifting
    }
  
    return unsignedInt;
  };
  
  const convertToInt2 = (data) => {
    // Remove any spaces and convert the hexadecimal input to an integer
    const hexWithoutSpaces = data.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);

    // Ensure that the value is within the valid uint16 range (0 to 65535)
    if (intValue >= 0 && intValue <= 65535) {
      return intValue;
    } else {
      // Handle out-of-range input
      return null;
    }
  };

//   const convertToInt2Reverse = (data) => {
//     console.log("Hi I am here");

//     // Remove spaces from input data
//     const hexWithoutSpaces = data.replace(/\s/g, '');
    
//     // Convert hex string to a byte array
//     const byteArray = [];
//     for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
//         byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
//     }

//     // Reverse the byte array
//     byteArray.reverse();

//     // Combine the bytes to form an unsigned integer
//     let uSignInt = (byteArray[0] << 8) | byteArray[1]; 

//     console.log(uSignInt);
//     return uSignInt;
// };
const convertToInt2Reverse = (data) => {
    console.log("Hi I am here");

    // Remove spaces from input data
    const hexWithoutSpaces = data.replace(/\s/g, '');

    // Convert hex string to byte array
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }

    // Reverse the byte array
    byteArray.reverse();

    // Combine reversed bytes into an unsigned integer
    const reversedValue = (byteArray[0] << 8) | byteArray[1];

    // Get original value from input hex string
    const originalValue = parseInt(hexWithoutSpaces, 16);

    let finalValue = reversedValue;

    // If result exceeds 2^16, subtract original
    if (reversedValue > 0xFFFF) {
        finalValue = reversedValue - originalValue;
    }

    console.log(finalValue);
    return finalValue;
};

  const downloadJSON = (data, filename = 'data.json') => {
    const jsonString = JSON.stringify(data, null, 2); // Convert data to JSON string with formatting
    const blob = new Blob([jsonString], { type: 'application/json' }); // Create a Blob object
    const url = URL.createObjectURL(blob); // Generate a temporary URL

    const a = document.createElement('a'); // Create a link element
    a.href = url;
    a.download = filename; // Set the download filename
    document.body.appendChild(a);
    a.click(); // Trigger download
    document.body.removeChild(a); // Remove the link after download
    URL.revokeObjectURL(url); // Free up memory
  };

  const testdata = appendData.map(
    (row) =>
      row[0]['localTime'].toString() +
      '\n' +
      'Rx: ' +
      row[0]['logData'].toString() +
      '\n' +
      row
        .map(
          (nodeData) =>
            `(${nodeData['startByte']}...${nodeData['endByte']} bytes)`.padEnd(
              20
            ) +
            nodeData['varByte'].toString().padEnd(80) +
            nodeData['processedData'].toString().padEnd(30) +
            `[${nodeData['slicedData']}]`
        )
        .join('\n') + // Ensures proper newline separation
      '\n'
  );
  const finalOutput = testdata.join('\n');

  const saveDataToNotepad = () => {
    let filename = window.prompt('Enter filename:', 'DiagnosticData');
    if (!filename || filename.trim() === "") {
      return; 
  }
  filename = filename.trim();
    if (!filename.endsWith('.txt')) {
      filename += '.txt';
    }
    const newEntries = finalOutput;
    const updatedLog = newEntries;
    const blob = new Blob([updatedLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
   
  const generateJSONcode = () => {
    const jsonData = [
      {
        label: 'Input',
        value: `listData.join(' ')`,
        databyte: ' '
      },
      {
        label: 'Msg No',
        value: `listData.slice(x + 3, x + 4).join('')`,
        rawData: `listData.slice(x + 3, x + 4).join(' ')`,
        databyte: '3 byte'
      },
      ...result.map(row => ({
        label: row.varByte,
        value: 
  ["splitBytetoBit", "convert2Values", "convert3Values", "convert6Values", "convert7Values"].includes(row.methodName)
    ? `${row.methodName}(listData, x + ${row.startByte}, ${row.extraTextBoxes.map(box => box).join(", ")})`
    : (row.startByte === row.endByte 
        ? `${row.methodName}(listData.slice(x + ${row.startByte}, x + ${parseInt(row.endByte) + 1}))` 
        : `${row.methodName}(listData, x + ${row.startByte}, x + ${parseInt(row.endByte)}))`
      ),
        rawData: `listData.slice(x + ${row.startByte}, x + ${parseInt(row.endByte) + 1}).join(' ')`,
        databyte: row.startByte === row.endByte ? `${row.startByte} byte` : `${row.startByte} to ${row.endByte} bytes`
      }))
    ];
    console.log(JSON.stringify(jsonData, null, 2)  // Indented and pretty-printed with 2 spaces.
      .replace(/"(\w+)":/g, '$1:')  // Remove quotes from keys
      .replace(/value:\s*"([^"]+)"/g, 'value: $1')  // Remove quotes from value
      .replace(/rawData:\s*"([^"]+)"/g, 'rawData: $1')  // Remove quotes from rawData
      .replace(/\n\s*\n/g, '\n')  // Remove extra empty lines between objects
      .replace(/(\{.*?\})/g, '$1\n'));  // Ensure each object starts and ends with braces on a new line

    
  
   return jsonData;
  };
  
  const handleSet = () => {
    const localTime = getTimestamp();
    const output = rows.map((row) => {
      const start = parseInt(row.startByte, 10);
      const end = parseInt(row.endByte, 10);
      const slicedData = logData
        .split(' ')
        .slice(start, end + 1)
        .join(' ');
      let processedData, methodName;
      switch (row.selectedOption) {
        case 'mergeData':
            methodName = 'mergeData';
            processedData = mergeData(slicedData); // Example for Merge: remove spaces
            break;
        case 'date':
            methodName = 'date';
            processedData = date(slicedData); // Example for  Merge: remove spaces
            break;
        case 'Version':
            methodName = 'ConvertDotData';
            processedData = ConvertDotData(slicedData); // Example for Merge: remove spaces
            break;
        case 'Hardware Rev.':
            methodName = 'HardwareVer';
            processedData = HardwareVer(slicedData); // Example for Merge: remove spaces
            break;
        case 'Split Byte to Bit':
            methodName = 'splitBytetoBit';
            processedData = splitBytetoBit(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Split 2 Values':
            methodName = 'convert2Values';
            processedData = convert2Values(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Split 3 Values':
            methodName = 'convert3Values';
            processedData = convert3Values(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Split 6 Values':
            methodName = 'convert6Values';
            processedData = convert6Values(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Split 7 Values':
            methodName = 'convert7Values';
            processedData = convert7Values(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Split Hex':
            methodName = 'splitHex';
            processedData = splitHex(slicedData, row); // Example for Merge: remove spaces
            break;
        case 'Reverse':
            methodName = 'reverseData';
            processedData = reverseData(slicedData);
            break;
        case 'Reverse & Merge':
            methodName = 'reverseMergeData';
            processedData = reverseMergeData(slicedData); // Reverse and remove spaces
            break;
        case 'Decimal':
            methodName = 'convertToDecimal';
            processedData = convertToDecimal(slicedData); // Convert hex to decimal
            break;
        case '~Decimal':
            methodName = 'convertToDecimalReverse';
            processedData = convertToDecimalReverse(slicedData); // Convert hex to decimal
            break;
        case 'Binary':
            methodName = 'ConvertToBinary';
            processedData = ConvertToBinary(slicedData);
            break;
        case '~Binary':
            methodName = 'ConvertToBinaryReverse';
            processedData = ConvertToBinaryReverse(slicedData); // Reverse and remove spaces
            break;
        case 'Time':
            methodName = 'time';
            processedData = Display_time(slicedData); // Example for Merge: remove spaces
            break;
        case 'Time_ms':
            methodName = 'time_ms';
            processedData = Display_time_ms(slicedData); // Example for Merge: remove spaces
              break;
        case 'No. of Characters':
            methodName = 'NoOfCharacters';
            processedData = NoOfCharacters(slicedData); // Convert hex to decimal
            break;
        case 'No. of Words':
            methodName = 'NoOfWords';
            processedData = NoOfWords(slicedData); // Reverse and remove spaces
            break;
        case 'Checksum':
            methodName = 'checksum';
            processedData = checksum(slicedData); // Example for Merge: remove spaces
            break;
        case 'Hex-ASCII':
            methodName = 'ConvertLongDataHex';
            processedData = convertToHex(slicedData); // Example for Merge: remove spaces
            break;
        case '~Hex-ASCII':
            methodName = 'ConvertLongDataHextoReverse';
            processedData = convertToHexInReverse(slicedData); // Convert hex to decimal
            break;
        case 'Hex_1b_uInt':
            methodName = 'convertTofloat';
            processedData = convertTofloat(slicedData);
            break;
        case 'Hex_1b_Int':
            methodName = 'convertTofloat2';
            processedData = convertTofloat2(slicedData); // Reverse and remove spaces
            break;
        case 'Hex_2b_Int':
            methodName = 'signedconvertToInt2Byte';
            processedData = signedconvertToInt2Byte(slicedData); // Convert hex to decimal
            break;
        case '~Hex_2b_Int':
            methodName = 'signedconvertToInt2ByteReverse';
            processedData = signedconvertToInt2ByteReverse(slicedData); // Convert hex to decimal
            break;
        case 'Hex_2b_uInt':
            methodName = 'convertToInt2';
            processedData = convertToInt2(slicedData);
            break;
        case '~Hex_2b_uInt':
            methodName = 'convertToInt2Reverse';
            processedData = convertToInt2Reverse(slicedData); // Reverse and remove spaces
            break;
        case 'Hex_4b_uInt':
            methodName = 'convertToInt4Byte';
            processedData = convertToInt4Byte(slicedData); // Example for Merge: remove spaces
            break;
        case '~Hex_4b_uInt':
            methodName = 'convertToInt4ByteReverse';
            processedData = convertToInt4ByteReverse(slicedData); // Convert hex to decimal
            break;
        case 'Hex_4b_Int':
            methodName = 'signedconvertToInt4Byte';
            processedData = signedconvertToInt4Byte(slicedData); // Convert hex to decimal
            break;
        case '~Hex_4b_Int':
            methodName = 'signedconvertToInt4ByteReverse';
            processedData = signedconvertToInt4ByteReverse(slicedData); // Convert hex to decimal
            break;
        case 'Hex_4b_Float':
            methodName = 'convertTofloattwoByte';
            processedData = convertTofloattwoByte(slicedData);
            break;
        case '~Hex_4b_Float':
            methodName = 'convertTofloattwoByteReverse';
            processedData = convertTofloattwoByteReverse(slicedData); // Reverse and remove spaces
            break;
        case 'Hex_8b_Int':
            methodName = 'convertHexToDouble';
            processedData = convertHexToDouble(slicedData); // Example for Merge: remove spaces
            break;
        case '~Hex_8b_Int':
            methodName = 'reverseconvertHexToDouble';
            processedData = reverseconvertHexToDouble(slicedData); // Convert hex to decimal
            break;
        default:
            processedData = slicedData; // Default: no operation
            break;
    }
      return {
        ...row,
        methodName,
        processedData,
        slicedData,
        localTime,
        logData,
      };
    });
    setResult(output);

    setAppendData((prevData) => [...prevData, output]);
  };
  const splitHex1 = (event) => {
    event.preventDefault();
    try {
      const normalizedInput = logData.match(/.{1,2}/g)?.join(' ') || '';;
      console.log(normalizedInput) // Remove all spaces  
      setLogData(normalizedInput)
    } catch (error) {
      alert(error.message);
    }
  };
  const handleDownload = () => {
    let filename = window.prompt('Enter file name:', 'formData');
    if (!filename) return; // If user cancels, do nothing

    downloadJSON(result, `${filename}.json`); // Pass formData as JSON
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          // Parse JSON data
          setRows(jsonData);

          // Store data in state
        } catch (error) {
          console.error('Invalid JSON file', error);
        }
      };
      reader.readAsText(file);
    }
  };


  return (
    <>
      <div
        style={{
          maxWidth: '17000px',
          margin: '5px auto',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p
          style={{
            color: 'red',
           //fontFamily: 'MS Shell Dlg',
            
    fontFamily: 'monospace', 
    fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          <b>
            '00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21
            22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44
            45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63
          </b>
        </p>

        <div style={{ marginBottom: '3px', marginTop: '1px' }}>
          <input
            type="text"
            placeholder="Enter Log Data ..."
             
            value={logData}
            onChange={(e) => setLogData(e.target.value)}
            style={{
              width: '82%',
              padding: '5px',
              fontSize: '12px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontFamily: 'monospace',
              marginRight: '5px',
            }}
          />  <span
          role="img"
          aria-label="split-hex"
         onClick={splitHex1}
         style={{
                     cursor: 'pointer',
                     transition: 'background-color 0.3s',
          
         }}
       >
         📄✂️ </span>
             <span
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          // width: '20px',
          // height: '20px',
          // display: 'inline-block', // Ensures width & height are respected
          // backgroundSize: 'cover',
          // backgroundImage: `url(${upload})`,
          transition: 'background-color 0.3s',
          fontSize: '20px'
         
        }}
      >⬆️</span>

      {/* Hidden file input */}
      <input
        id="fileInput"
        type="file"
        style={{ display: 'none' }} // Hide the default file input button
        accept=".json"
        onChange={handleFileUpload}
      />
      
         
          <span
            onClick={handleDownload}
            style={{
              padding: '5px 7px',
              fontSize: '20px',
              borderRadius: '5px',
              //backgroundColor: '#28A745',
              // color: '#fff',
              // border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
               
            }}
          >
            ⬇️
 
          </span>
          <span
            onClick={saveDataToNotepad}
            style={{
              // padding: '5px 7px',
              fontSize: '20px',
              // borderRadius: '5px',
              // backgroundColor: '#28A745',
              // color: '#fff',
              // border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              
            }}
          >
            💾
          </span>
        
         
        
        </div>

        {rows.map((row, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '5px',
              alignItems: 'center',
              marginBottom: '2px',
            }}
          >
            <input
              type="text"
              placeholder="Enter Variable"
              value={row.varByte}
              onChange={(e) =>
                handleInputChange(index, 'varByte', e.target.value)
              }
              style={{
                flex: 1,
                padding: '5px',
                fontSize: '12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />

            {row.extraTextBoxes.map((text, textBoxIndex) => (
              <input
                key={textBoxIndex}
                type="text"
                placeholder={`Extra Text ${textBoxIndex + 1}`}
                value={text}
                onChange={(e) => {
                  const updatedRows = [...rows];
                  updatedRows[index].extraTextBoxes[textBoxIndex] =
                    e.target.value;
                  setRows(updatedRows);
                }}
                style={{
                  flex: 1,
                  padding: '5px',
                  fontSize: '11px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            ))}

            <input
              type="text"
              placeholder="Start Byte"
              value={row.startByte}
              onChange={(e) =>
                handleInputChange(index, 'startByte', e.target.value)
              }
              style={{
                flex: 1,
                padding: '5px',
                fontSize: '12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />

            <input
              type="text"
              placeholder="End Byte"
              value={row.endByte}
              onChange={(e) =>
                handleInputChange(index, 'endByte', e.target.value)
              }
              style={{
                flex: 1,
                padding: '5px',
                fontSize: '12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />

            <select
              value={row.selectedOption}
              onChange={(e) =>
                handleInputChange(index, 'selectedOption', e.target.value)
              }
              style={{
                flex: 1,
                padding: '5px',
                fontSize: '12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            >
              <option >Data</option>
              {options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleAddTextBox(index)}
              style={{
                padding: '5px 7px',
                fontSize: '11px',
                borderRadius: '5px',
                backgroundColor: '#28A745',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#1E7E34')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#28A745')}
            >
              +
            </button>

            {row.extraTextBoxes.length > 0 && (
              <button
                onClick={() => handleRemoveTextBox(index)}
                style={{
                  padding: '5px 7px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  backgroundColor: '#FF4D4D',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#CC0000')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#FF4D4D')}
              >
                -
              </button>
            )}

            <button
              onClick={handleAddRow}
              style={{
                padding: '5px 7px',
                fontSize: '12px',
                borderRadius: '5px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
            >
              Add Row
            </button>

            {rows.length > 1 && (
              <button
                onClick={() => handleRemoveRow(index)}
                style={{
                  padding: '5px 7px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  backgroundColor: '#DC3545',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#A71D2A')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#DC3545')}
              >
                Remove Row
              </button>
            )}
          </div>
        ))}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSet}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: '5px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              marginRight: '5px'
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
          >
            SET
          </button>
          <button
            onClick={generateJSONcode}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: '5px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
            title="Generated JSON Code in Inspect Console"
          >
            Generate JSON Code
          </button>
        </div>
        {result.length > 0 && (
          <div style={styles.paper}>
            <div style={styles.headers}>
              <span style={styles.headerItem}>
                <strong>Variables</strong>
              </span>
              <span style={styles.headerItem}>
                <strong>Conversion Values</strong>
              </span>
              <span style={styles.headerItem}>
                <strong>Hex Values</strong>
              </span>
            </div>
            <div style={styles.dataBlock}>
              {result.map((row, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.row,
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                  }}
                >
                  <span style={{ ...styles.item, color: 'rgb(0, 116, 232)' }}>
                    {row.varByte +
                      ' (' +
                      row.startByte +
                      '...' +
                      row.endByte +
                      ' bytes' +
                      ')'}
                  </span>
                  <span style={{ ...styles.item, color: 'rgb(221, 0, 169)' }}>
                    {row.processedData}
                  </span>
                  <span style={{ ...styles.item, color: 'green' }}>
                    [{row.slicedData}]
                  </span>
                </div>
              ))}
            </div>
            <div>
      
    </div>
          </div>
        )}
      </div>
    </>
  );
};
const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1px', // Increased the gap for better spacing
    justifyContent: 'flex-start', // Allows wrapping with alignment
  },
  paper: {
    border: '2px solid #ddd',
    padding: '1px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: '1px', // Added some margin for spacing
    flex: '1 1 calc(33% - 20px)', // Responsive: 3 columns for large screens
    maxWidth: '100%',
    minWidth: '300px', // Minimum width to prevent elements from getting too small
    textAlign: 'center',
  },
  title: {
    textAlign: 'left',
    marginBottom: '5px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  headers: {
    display: 'flex',
    justifyContent: 'flex-start',
    fontWeight: 'bold',
    paddingBottom: '1px',
    borderBottom: '1px solid #ddd',
    marginBottom: '1px',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerItem: {
    flex: 1,
    textAlign: 'left',
    fontSize: '12px',
    padding: '1px', // Added padding for spacing
  },
  dataBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px', // Added spacing between items
    justifyContent: 'flex-start',
  },
  dataBlock1: {
    display: 'flex',
    flexDirection: 'column', // Keeps items in a vertical stack
    alignItems: 'flex-start', // Align items to the left (start of the container)
    justifyContent: 'flex-start', // Ensure elements are aligned top to bottom in the column
    gap: '1px', // Optional: Adds spacing between items in the column
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'left',
  },
  item: {
    flex: 1,
    textAlign: 'left',
    fontSize: '12px',
    marginRight: '10px', // Adjusted margin for better spacing
    whiteSpace: 'nowrap',
  },

  // Media Queries for Responsiveness
  '@media (max-width: 1200px)': {
    paper: {
      flex: '1 1 calc(50% - 20px)', // 2 columns for medium screens
    },
    headerItem: {
      fontSize: '11px', // Slightly smaller font size for medium screens
    },
  },
  '@media (max-width: 768px)': {
    wrapper: {
      flexDirection: 'column', // Stack items on smaller screens
    },
    paper: {
      flex: '1 1 100%', // Full width for smaller screens
    },
    row: {
      flexDirection: 'column', // Stack row items vertically for small screens
      alignItems: 'flex-start', // Align items to the left
    },
    headerItem: {
      fontSize: '10px', // Smaller font size for small screens
    },
  },
};

export default DiagnosticsTool;
