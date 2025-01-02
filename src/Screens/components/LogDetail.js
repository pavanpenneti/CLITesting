import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import axios from 'axios';
const LogDetail = () => {
  const x = 4;
  const [ipAddress, setIpAddress] = useState('');
  const [filedata, setFiledata] = useState('');
  const path = `http://${ipAddress}:5232`;
  const [results, setResults] = useState([]);
  const [data, setData] = useState('');
  const [inputData, setInputData] = useState('');
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [showHexValues, setShowHexValues] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleHexValues = () => {
    setShowHexValues((prev) => !prev);
  };

  const getFileData1 = async () => {
    try {
      const response = await axios.get(
        `${path}/getlogdata?filename=${filedata}`
      );
      const data_remove = response.data.replace(/<[^>]*>/g, '');
      const data_analayze = data_remove.replace(/ = /g, ': ');
      setInputData(data_analayze);
      setIsDataUpdated(true);
    } catch (e) {
      alert(
        `IP Address is Incorrect or Connection to host(CADA/VPN) is lost or Server is not running`
      );
    }
  };

  useEffect(() => {
    if (isDataUpdated) {
      processMessages();
      setIsDataUpdated(false);
    }
  }, [isDataUpdated]);

  const clearData = async () => {
    try {
      const response = await axios.get(
        `${path}/clearlogdata?filename=${filedata}`
      );
      const data_remove = response.data.replace(/<[^>]*>/g, '');
      setData(data_remove);
      setInputData([]);
      setResults([]);
    } catch (error) {
      console.error('Error fetching file data:', error);
    }
  };

  const searchData = async () => {
    // Split the input data by newline and trim each line
    const lines = inputData.split("\n").map((line) => line.trim());
    const processedResults = [];
  
    // Process each line
    lines.forEach((line) => {
      if (line.startsWith("Rx:") || line.startsWith("RX:")) {
        const message = line.split(":")[1].trim();
        const listData = message.split(" ");
        
        // Ensure listData has enough elements to avoid errors
        if (listData.length >= 8 && listData[4] === "C1") {
          const eighthByte = listData[7];
          processedResults.push({
            rawRx: message,
            messageType: `0x${eighthByte}`,
          });
        }
      }
    });
    const filtered = processedResults.filter((result, index) => {
      // Extract characters from index 26 to 27
      const chars26and27 = result.rawRx.substring(21, 23); 
      console.log(chars26and27)// Assuming `result.rawRx` holds the string
      return chars26and27.includes(searchQuery); // Check if searchQuery is present in the substring
    })
    if (filtered.length > 0) {
      const filteredData = filtered.map((item) => `Rx: ${item.rawRx}`).join("\n");
      setInputData(filteredData);
    } else {
      setInputData(""); 
      console.log(filtered.length)
    }
    setIsDataUpdated(true);
  };
  
  const convertToBinary = (hexValue) => {
    const binaryValue = parseInt(hexValue, 16).toString(2).padStart(8, '0');
    return binaryValue.split('').reverse().join('');
  };

  const convertHexToDouble = (text, x1, x2) => {
    const hexWithoutSpaces = text.slice(x1, x2 + 1).join('');
    const hexToBinary = (hex) => {
      return hex
        .split('')
        .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
        .join('');
    };

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

  const ConvertDotData = (text, x1, x2) => {
    const data1 = hexToDecimal(text[x1]);
    const data2 = hexToDecimal(text[x2]);
    const data = `${data1}.${data2}`; 
    return data;
  };

  const date = (text, x1, x2) => {
    const yy = hexToDecimal(text[x1]);
    const mm = hexToDecimal(text[x1 + 1]);
    const dd = hexToDecimal(text[x2]);
    const data = `${mm}-${dd}-${yy}`;
    return data;
  };

  const time = (text, x1, x2) => {
    const hr = hexToDecimal(text[x1]);
    const minute = hexToDecimal(text[x1 + 1]);
    const second = hexToDecimal(text[x2]);
    const data = `${hr}:${minute}:${second}`;
    return data;
  };

  const splitBytetoBit = (data, byteIndex, bitIndex, absentMsg, presentMsg) => {
    const hexValue = data[byteIndex];
    const binaryValue = convertToBinary(hexValue);
    const splitData = binaryValue[bitIndex] === '1' ? presentMsg : absentMsg;
    return splitData;
  };

  const hexToReversedString = (value) => {
    const val = Buffer.from(value, 'hex').toString();
    return val.split('').reverse().join('');
  };

  const ConvertLongData = (text, x1, x2) => {
    return text.slice(x1, x2 + 1).join('');
  };

  const ConvertLongDataHextoReverse = (text, x1, x2) => {
    const data = hexToReversedString(ConvertLongData(text, x1, x2));
    return data;
  };

  const ConvertLongDataHex = (text, x1, x2) => {
    const data = hexToString(ConvertLongData(text, x1, x2));
    return data;
  };

  const hexToString = (value) => {
    const val = Buffer.from(value, 'hex').toString();
    return val.split('').join('');
  };

  const hexToDecimal = (value) => {
    return parseInt(value, 16).toString();
  };

  function convert2ByteFloat(text, x1, x2) {
    const data1 = convert(text)[x1];
    const data2 = convert(text)[x2];
    const data = data2 + data1;
    let decimalData = hexToDecimal(data);
    if (decimalData > 32767) {
      decimalData = decimalData - Math.pow(2, 16);
    }
    return decimalData / 10;
  }

  function convert(text) {
    return Array.from(text);
  }

  function convert2ByteUnsigned(text, x1, x2) {
    const data1 = convert(text)[x1];
    const data2 = convert(text)[x2];
    const data = data2 + data1;
    return hexToDecimal(data);
  }

  function convert2ByteSigned(text, x1, x2) {
    const data1 = convert(text)[x1];
    const data2 = convert(text)[x2];
    const data = data2 + data1;
    let decimalData = hexToDecimal(data);
    if (decimalData > 32767) {
      decimalData = decimalData - Math.pow(2, 16);
    }
    return decimalData / 10;
  }

  function convert2Values(text, x1, x2, x3) {
    const data1 = convert(text)[x1];
    if (data1 === '00') {
      return x2;
    }
    if (data1 === '01') {
      return x3;
    }
    return data1;
  }

  function convert3Values(text, x1, x2, x3, x4) {
    const data1 = convert(text)[x1];

    if (data1 === '00') {
      return x2;
    }
    if (data1 === '01') {
      return x3;
    }
    if (data1 === '02') {
      return x4;
    }
    return data1;
  }

  function convert6Values(text, x1, x2, x3, x4, x5, x6, x7) {
    const data1 = convert(text)[x1];
    switch (data1) {
      case '00':
        return x2;
      case '01':
        return x3;
      case '02':
        return x4;
      case '03':
        return x5;
      case '04':
        return x6;
      case '05':
        return x7;
      default:
        return data1;
    }
  }

  function convert7Values(text, x1, x2, x3, x4, x5, x6, x7, x8) {
    const data1 = convert(text)[x1];
    switch (data1) {
      case '00':
        return x2;
      case '01':
        return x3;
      case '02':
        return x4;
      case '03':
        return x5;
      case '04':
        return x6;
      case '05':
        return x7;
      case '06':
        return x7;
      default:
        return data1;
    }
  }

  const processMessages = () => {
    try {
      const lines = inputData.split('\n').map((line) => line.trim());
      const processedResults = [];
      lines.forEach((line) => {
        if (line.startsWith('Rx:') || line.startsWith('RX:')) {
          const message = line.split(':')[1].trim();
          const listData = message.split(' ');
          if (listData[4] === 'C1') {
            const eighthByte = listData[7];

            processedResults.push({
              rawRx: message,
              messageType: `0x${eighthByte}`,
            });

            switch (eighthByte) {
              case '01':
                const result01 = handle0x01process(listData);
                if (result01) processedResults.push(...result01);
                break;
              case '10':
                const result10 = handle0x10process(listData);
                if (result10) processedResults.push(...result10);
                break;
              case '41':
                const result41 = handle0x41process(listData);
                if (result41) processedResults.push(...result41);
                break;
              case '45':
                const result45 = handle0x45process(listData);
                if (result45) processedResults.push(...result45);
                break;
              case '46':
                const result46 = handle0x46process(listData);
                if (result46) processedResults.push(...result46);
                break;
              case '48':
                const result48 = handle0x48process(listData);
                if (result48) processedResults.push(...result48);
                break;
              case '24':
                const result24 = handle0x24process(listData);
                if (result24) processedResults.push(...result24);
                break;
              case '25':
                const result25 = handle0x25process(listData);
                if (result25) processedResults.push(...result25);
                break;
              case '26':
                const result26 = handle0x26process(listData);
                if (result26) processedResults.push(...result26);
                break;
              case '27':
                const result27 = handle0x27process(listData);
                if (result27) processedResults.push(...result27);
                break;
              case '28':
                const result28 = handle0x28process(listData);
                if (result28) processedResults.push(...result28);
                break;
              case '2B':
                const result2B = handle0x2Bprocess(listData);
                if (result2B) processedResults.push(...result2B);
                break;
              case '2E':
                const result2E = handle0x2Eprocess(listData);
                if (result2E) processedResults.push(...result2E);
                break;
              case '38':
                const result38 = handle0x38process(listData);
                if (result38) processedResults.push(...result38);
                break;
              case '39':
                const result39 = handle0x39process(listData);
                if (result39) processedResults.push(...result39);
                break;
              case '2A':
                const result2A = handle0x2Aprocess(listData);
                if (result2A) processedResults.push(...result2A);
                break;
              case '2C':
                const result2C = handle0x2Cprocess(listData);
                if (result2C) processedResults.push(...result2C);
                break;
              case '2F':
                const result2F = handle0x2Fprocess(listData);
                if (result2F) processedResults.push(...result2F);
                break;
              case '3A':
                const result3A = handle0x3Aprocess(listData);
                if (result3A) processedResults.push(...result3A);
                break;
              case '3B':
                const result3B = handle0x3Bprocess(listData);
                if (result3B) processedResults.push(...result3B);
                break;
              case '3C':
                const result3C = handle0x3Cprocess(listData);
                if (result3C) processedResults.push(...result3C);
                break;
              default:
                processedResults.push({
                  label: 'Unknown message type',
                  value: `Unknown message type: ${eighthByte}`,
                });
            }
          }
        }
      });
      setResults(processedResults);
    } catch (e) {
      alert(`Please enter log data in TextArea`);
    }
  };

  const handle0x01process = (listData) => {
    const cardType = listData.slice(x + 1, x + 2).join('');
    return [
      {
        label: 'Input',
        value: listData.join(' '),
      },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3rd byte',
      },
      {
        label: 'CardType',
        value: hexToDecimal(cardType),
        rawData: listData.slice(1 + x, 2 + x).join(' '),
        databyte: '3rd byte',
      },
    ];
  };

  const handle0x10process = (listData) => {
    const serialNumber = listData.slice(x + 4, x + 11).join('');
    const model = listData.slice(x + 12, x + 19).join('');
    const date = `${hexToDecimal(listData[x + 21])}-${hexToDecimal(
      listData[x + 22]
    )}-${hexToDecimal(listData[x + 20])}`;
    const fpga = `${hexToDecimal(listData[x + 24])}.${hexToDecimal(
      listData[x + 25]
    )}`;
    const firmware = `${hexToDecimal(listData[x + 27])}.${hexToDecimal(
      listData[x + 26]
    )}`;
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Serial Number',
        value: hexToReversedString(serialNumber),
        rawData: listData.slice(4 + x, 11 + x).join(' '),
        databyte: '4 to 11 bytes',
      },
      {
        label: 'Model',
        value: hexToReversedString(model),
        rawData: listData.slice(12 + x, 19 + x).join(' '),
        databyte: '12 to 19 bytes',
      },
      {
        label: 'Date',
        value: date,
        rawData: listData.slice(20 + x, 24 + x).join(' '),
        databyte: '20 to 23 bytes',
      },
      {
        label: 'FPGA',
        value: fpga,
        rawData: listData.slice(24 + x, 26 + x).join(' '),
        databyte: '24 to 25 bytes',
      },
      {
        label: 'Firmware',
        value: firmware,
        rawData: listData.slice(26 + x, 28 + x).join(' '),
        databyte: '26 & 27 bytes',
      },
    ];
  };

  const handle0x41process = (listData) => {
    const hardwareRev = `${hexToString(listData[x + 4])}.${hexToString(
      listData[x + 5]
    )}`;
    const modelFeature = listData.slice(x + 6, x + 27).join('');
    const support = listData.slice(x + 27, x + 28).join('');
    const perstStatus1 = listData.slice(x + 28, x + 29).join('');
    const perstStatus2 = listData.slice(x + 29, x + 30).join('');
    const subSCap = listData.slice(x + 30, x + 31).join('');
    const subSlotStatus = listData.slice(x + 31, x + 32).join('');
    const cliframe = listData.slice(x + 32, x + 33).join('');
    const loaderPatchVer = `${hexToDecimal(listData[x + 33])}`;
    const firmwarePatchVer = `${hexToDecimal(listData[x + 34])}`;
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Hardware Revision',
        value: hardwareRev,
        rawData: listData.slice(4 + x, 6 + x).join(' '),
        databyte: '4 & 5 bytes',
      },
      {
        label: 'Model Feature',
        value: hexToString(modelFeature),
        rawData: listData.slice(6 + x, 27 + x).join(' '),
        databyte: '6 to 26 bytes',
      },
      {
        label: 'Support',
        value: support,
        rawData: listData.slice(27 + x, 28 + x).join(' '),
        databyte: '27 byte',
      },
      {
        label: 'Persistency status1',
        value: perstStatus1,
        rawData: listData.slice(28 + x, 29 + x).join(' '),
        databyte: '28 byte',
      },
      {
        label: 'Persistency status2',
        value: perstStatus2,
        rawData: listData.slice(29 + x, 30 + x).join(' '),
        databyte: '29 byte',
      },
      {
        label: 'SubSlot Capabilitye',
        value: subSCap,
        rawData: listData.slice(30 + x, 31 + x).join(' '),
        databyte: '30 byte',
      },
      {
        label: 'SubSlots Status',
        value: subSlotStatus,
        rawData: listData.slice(31 + x, 32 + x).join(' '),
        databyte: '31 byte',
      },
      {
        label: 'CLI frame message type',
        value: cliframe,
        rawData: listData.slice(32 + x, 33 + x).join(' '),
        databyte: '32 byte',
      },
      {
        label: 'Loader Patch Version',
        value: loaderPatchVer,
        rawData: listData.slice(33 + x, 34 + x).join(' '),
        databyte: '33 byte',
      },
      {
        label: 'Firmware Patch Version',
        value: firmwarePatchVer,
        rawData: listData.slice(34 + x, 35 + x).join(' '),
        databyte: '34 byte',
      },
    ];
  };

  const handle0x45process = (listData) => {
    const moduleId =
      listData[x + 8] + listData[x + 7] + listData[x + 6] + listData[x + 5];
    const hardwareRevision = `${String.fromCharCode(
      parseInt(listData[x + 9], 16)
    )}.${String.fromCharCode(parseInt(listData[x + 10], 16))}`;
    const ledStatus = `${String.fromCharCode(
      parseInt(listData[x + 11], 16)
    )}.${String.fromCharCode(parseInt(listData[x + 12], 16))}`;
    const constructionCount = `${hexToDecimal(listData[x + 13])}`;
    const constructionType = listData.slice(x + 14, x + 17).join('');
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Module ID',
        value: moduleId,
        rawData: listData.slice(5 + x, 9 + x).join(' '),
        databyte: '5 to 8 bytes',
      },

      {
        label: 'Hardware Revision',
        value: hardwareRevision,
        rawData: listData.slice(9 + x, 11 + x).join(' '),
        databyte: '9 & 10 bytes',
      },
      {
        label: 'Led Status',
        value: ledStatus,
        rawData: listData.slice(11 + x, 13 + x).join(' '),
        databyte: '11 to 12 bytes',
      },
      {
        label: 'Construction Count',
        value: constructionCount,
        rawData: listData.slice(13 + x, 14 + x).join(' '),
        databyte: '13 byte',
      },
      {
        label: 'Construction Type',
        value: hexToString(constructionType),
        rawData: listData.slice(14 + x, 18 + x).join(' '),
        databyte: '14 to 17 bytes',
      },
    ];
  };

  const handle0x46process = (listData) => {
    const commonMsgSupp = splitBytetoBit(listData, x + 4, 0, 'No', 'Yes');
    const diagnosticsSupp = splitBytetoBit(listData, x + 4, 2, 'No', 'Yes');
    const initDiagSupp = splitBytetoBit(listData, x + 4, 3, 'No', 'Yes');
    const slotNumSupp = splitBytetoBit(listData, x + 4, 4, 'No', 'Yes');
    const aIPSupp = splitBytetoBit(listData, 4, x + 5, 'No', 'Yes');
    const supportStatus2 = listData.slice(x + 5, x + 6).join('');
    const slotNum = listData.slice(x + 6, x + 7).join('');
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'support common parameters messages (0x47 and 0x42)',
        value: commonMsgSupp,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4th byte, bit 0',
      },
      {
        label: 'support for diagnostic status message (0x48)',
        value: diagnosticsSupp,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4th byte, bit 2',
      },
      {
        label: 'support for initiate diagnostic check message (0x44)',
        value: initDiagSupp,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4th byte, bit 3',
      },
      {
        label: ' support for slot number in byte 6',
        value: slotNumSupp,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4th byte, bit 4',
      },
      {
        label: ' support for Query ARRIS AIP data structure',
        value: aIPSupp,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4th byte, bit 5',
      },
      {
        label: 'support status 2',
        value: supportStatus2,
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5th byte',
      },
      {
        label: 'slot number',
        value: slotNum,
        rawData: listData.slice(6 + x, 7 + x).join(' '),
        databyte: '6th byte',
      },
    ];
  };

  const handle0x48process = (listData) => {
    const loaderVersion = `${hexToDecimal(listData[x + 23])}.${hexToDecimal(
      listData[x + 24]
    )}`;
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Loader Version',
        value: loaderVersion,
        rawData: listData.slice(23 + x, 25 + x).join(' '),
        databyte: '23 & 24 bytes',
      },
    ];
  };

  const handle0x24process = (listData) => {
    const firmwareRev = `${hexToDecimal(listData[x + 5])}.${hexToDecimal(
      listData[x + 6]
    )}`;
    const hardwareRev1 = `${hexToString(listData[x + 7])}.${hexToString(
      listData[x + 8]
    )}`;
    const date = `${hexToDecimal(listData[x + 10])}-${hexToDecimal(
      listData[x + 11]
    )}-${hexToDecimal(listData[x + 9])}`;
    const serialNumber = listData.slice(x + 13, x + 30).join('');
    const model = listData.slice(x + 30, x + 50).join('');
    const firmwaredate = `${hexToDecimal(listData[x + 51])}-${hexToDecimal(
      listData[x + 52]
    )}-${hexToDecimal(listData[x + 50])}`;
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Firmware Revision',
        value: firmwareRev,
        rawData: listData.slice(5 + x, 7 + x).join(' '),
        databyte: '5 to 6 bytes',
      },
      {
        label: 'Hardware Revision',
        value: hardwareRev1,
        rawData: listData.slice(7 + x, 9 + x).join(' '),
        databyte: '7 & 8 bytes',
      },
      {
        label: 'Date',
        value: date,
        rawData: listData.slice(9 + x, 12 + x).join(' '),
        databyte: '9 to 11 bytes',
      },
      {
        label: 'Serial Number',
        value: hexToString(serialNumber),
        rawData: listData.slice(13 + x, 29 + x).join(' '),
        databyte: '13 to 28 bytes',
      },
      {
        label: 'Model',
        value: hexToString(model),
        rawData: listData.slice(30 + x, 50 + x).join(' '),
        databyte: '30 to 49 bytes',
      },
      {
        label: 'Firware Date',
        value: firmwaredate,
        rawData: listData.slice(50 + x, 53 + x).join(' '),
        databyte: '50 to 52 bytes',
      },
    ];
  };

  const handle0x25process = (listData) => {
    const systemStatus = splitBytetoBit(listData, x + 4, 0, 'BLE180', 'MB180');
    const supportStatus = listData.slice(x + 5, x + 6).join('');
    const temperature = convert2ByteFloat(listData, x + 6, x + 7);
    const _24vdc = convert2ByteFloat(listData, x + 8, x + 9);
    const _8vdc = convert2ByteFloat(listData, x + 10, x + 11);
    const _5vdc = convert2ByteFloat(listData, x + 12, x + 13);
    const acInp = convert2ByteFloat(listData, x + 14, x + 15);
    const smuStatus = convert3Values(
      listData,
      x + 16,
      'Present',
      'Not Present.',
      'COMM Error'
    );
    const smuType = convert2Values(listData, x + 17, 'Standard', 'Enhanced');
    const dsInp = convert2ByteFloat(listData, x + 18, x + 19);
    const rpfSplit = convert7Values(
      listData,
      x + 20,
      'not installed',
      '085',
      '204',
      '396',
      '492',
      '684',
      'error'
    );
    const dsoutpPort2 = convert2ByteFloat(listData, x + 22, x + 23);
    const dsoutputPort34 = convert2ByteFloat(listData, x + 24, x + 25);
    const usoutput = convert2ByteFloat(listData, x + 26, x + 27);
    const ledStatus1 = listData.slice(x + 28, x + 29).join('');
    const ledStatus2 = listData.slice(x + 29, x + 30).join('');
    const rpfIdentSplit = convert6Values(
      listData,
      x + 30,
      'not installed',
      '085',
      '204',
      '396',
      '492',
      '684'
    );
    const dspilotlvl = convert2ByteFloat(listData, x + 31, x + 32);
    const dschl1 = convert2ByteFloat(listData, x + 33, x + 34);
    const dsch2 = convert2ByteFloat(listData, x + 35, x + 36);
    const dsch3 = convert2ByteFloat(listData, x + 37, x + 38);
    const dsch4 = convert2ByteFloat(listData, x + 39, x + 40);
    const universalplugin = convert6Values(
      listData,
      x + 41,
      'JMP',
      'HS1',
      'HS2',
      'PA1',
      'PA2',
      '2.4GHz Enhancer'
    );
    const auxPlugin = convert6Values(
      listData,
      x + 42,
      'JMP',
      '2-Way',
      'DC-08',
      'DC-10',
      'DC-12',
      'not used'
    );
    const auxPlugin3 = convert3Values(
      listData,
      x + 43,
      'Through',
      'Tap',
      'N/C'
    );
    const auxPlugin4 = convert3Values(
      listData,
      x + 44,
      'Through',
      'Tap',
      'N/C'
    );
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'System Status',
        value: systemStatus,
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte',
      },
      {
        label: 'SupportStatus',
        value: supportStatus,
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5 byte',
      },
      {
        label: 'Temperature',
        value: temperature,
        rawData: listData.slice(6 + x, 8 + x).join(' '),
        databyte: '6 to 7 bytes',
      },
      {
        label: '24 VDC',
        value: _24vdc,
        rawData: listData.slice(8 + x, 10 + x).join(' '),
        databyte: '8 to 9 bytes',
      },
      {
        label: '8 VDC',
        value: _8vdc,
        rawData: listData.slice(10 + x, 12 + x).join(' '),
        databyte: '10 to 11 bytes',
      },
      {
        label: '5 VDC',
        value: _5vdc,
        rawData: listData.slice(12 + x, 14 + x).join(' '),
        databyte: '12 to 13 bytes',
      },
      {
        label: 'AC Voltage',
        value: acInp,
        rawData: listData.slice(14 + x, 16 + x).join(' '),
        databyte: '14 to 15 bytes',
      },
      {
        label: 'SMU Status',
        value: smuStatus,
        rawData: listData.slice(16 + x, 17 + x).join(' '),
        databyte: '16 byte',
      },
      {
        label: 'SMU Type',
        value: smuType,
        rawData: listData.slice(17 + x, 18 + x).join(' '),
        databyte: '17 byte',
      },
      {
        label: 'DS Input',
        value: dsInp,
        rawData: listData.slice(18 + x, 20 + x).join(' '),
        databyte: '18 to 19 bytes',
      },
      {
        label: 'RPF Split Status',
        value: rpfSplit,
        rawData: listData.slice(20 + x, 21 + x).join(' '),
        databyte: '20 byte',
      },
      {
        label: 'DS Output Port 2',
        value: dsoutpPort2,
        rawData: listData.slice(22 + x, 24 + x).join(' '),
        databyte: '22 to 23 bytes',
      },
      {
        label: 'DS Output Port 34',
        value: dsoutputPort34,
        rawData: listData.slice(24 + x, 26 + x).join(' '),
        databyte: '24 to 25 bytes',
      },
      {
        label: 'US Output',
        value: usoutput,
        rawData: listData.slice(26 + x, 28 + x).join(' '),
        databyte: '26 to 27 bytes',
      },
      {
        label: 'LED Status1',
        value: ledStatus1,
        rawData: listData.slice(28 + x, 29 + x).join(' '),
        databyte: '28byte',
      },
      {
        label: 'LED Status2',
        value: ledStatus2,
        rawData: listData.slice(29 + x, 30 + x).join(' '),
        databyte: '29 byte',
      },
      {
        label: 'RPF Ident Split',
        value: rpfIdentSplit,
        rawData: listData.slice(30 + x, 31 + x).join(' '),
        databyte: '30 byte',
      },
      {
        label: 'DS Pilot Level',
        value: dspilotlvl,
        rawData: listData.slice(31 + x, 33 + x).join(' '),
        databyte: '31 to 32 bytes',
      },
      {
        label: 'DS Channel 1',
        value: dschl1,
        rawData: listData.slice(33 + x, 35 + x).join(' '),
        databyte: '33 to 34 bytes',
      },
      {
        label: 'DS Channel 2',
        value: dsch2,
        rawData: listData.slice(35 + x, 37 + x).join(' '),
        databyte: '35 to 36 bytes',
      },
      {
        label: 'DS Channel 3',
        value: dsch3,
        rawData: listData.slice(37 + x, 39 + x).join(' '),
        databyte: '37 to 38 bytes',
      },
      {
        label: 'DS Channel 4',
        value: dsch4,
        rawData: listData.slice(39 + x, 41 + x).join(' '),
        databyte: '39 to 40 bytes',
      },
      {
        label: 'Universal Plug In',
        value: universalplugin,
        rawData: listData.slice(41 + x, 42 + x).join(' '),
        databyte: '41 byte',
      },
      {
        label: 'Auxiliary Plug In',
        value: auxPlugin,
        rawData: listData.slice(42 + x, 43 + x).join(' '),
        databyte: '42 byte',
      },
      {
        label: 'Aux PlugIn 3',
        value: auxPlugin3,
        rawData: listData.slice(43 + x, 44 + x).join(' '),
        databyte: '43 byte',
      },
      {
        label: 'Aux PlugIn 4',
        value: auxPlugin4,
        rawData: listData.slice(44 + x, 45 + x).join(' '),
        databyte: '44 byte',
      },
    ];
  };

  const handle0x26process = (listData) => {
    const uiMode = convert2Values(
      listData,
      x + 5,
      'User mode',
      'Developer mode'
    );
    const ampMode = convert3Values(
      listData,
      x + 6,
      'Manual mode',
      'Auto mode (AGC)',
      'Test mode'
    );
    const smuMeasurement = convert2Values(
      listData,
      x + 7,
      'CHANNEL',
      'TOTAL-COMPOSITE-POWER'
    );
    const dsvatt1 = convert2ByteFloat(listData, x + 8, x + 9);
    const dsvatt2 = convert2ByteFloat(listData, x + 10, x + 11);
    const dsveq1 = convert2ByteFloat(listData, x + 12, x + 13);
    const dsveq2 = convert2ByteFloat(listData, x + 14, x + 15);
    const dsveq3 = convert2ByteFloat(listData, x + 16, x + 17);
    const dspwrctr1 = listData.slice(x + 18, x + 19).join('');
    const dspwrctr2 = listData.slice(x + 19, x + 20).join('');
    const usvattA = convert2ByteFloat(listData, x + 20, x + 21);
    const usvattB = convert2ByteFloat(listData, x + 22, x + 23);
    const usvatt2 = convert2ByteFloat(listData, x + 24, x + 25);
    const usrpfveq = convert2ByteFloat(listData, x + 26, x + 27);
    const usrpfveq1 = convert2ByteUnsigned(listData, x + 28, x + 29);
    const usrpfveq2 = convert2ByteUnsigned(listData, x + 30, x + 31);
    const usrpfveq3 = convert2ByteUnsigned(listData, x + 32, x + 33);
    const rpfswitch = convert6Values(
      listData,
      x + 34,
      'US-OUTPUT',
      'DS-INPUT',
      'DS-OUTPUT-PORT-2',
      'DS-OUTPUT-PORT-3/4',
      'Not used',
      'Not used'
    );
    const rpfctrlswitch = convert2Values(listData, x + 35, 'NO EQ', 'EQ');
    const dspltfreq = convert2ByteUnsigned(listData, x + 36, x + 37);
    const ch1freq = convert2ByteUnsigned(listData, x + 38, x + 39);
    const ch2freq = convert2ByteUnsigned(listData, x + 40, x + 41);
    const ch3freq = convert2ByteUnsigned(listData, x + 42, x + 43);
    const ch4freq = convert2ByteUnsigned(listData, x + 44, x + 45);
    const scanMode = listData.slice(x + 46, x + 47).join('');
    const dsagcStatus = convert6Values(
      listData,
      x + 47,
      'Locked state',
      'Pilot Hold state',
      'Unlocked state',
      'TGC state',
      'Not used',
      'Not used'
    );
    const usAgcStatus = convert3Values(
      listData,
      x + 48,
      'Locked state',
      'Pilot Hold state',
      'Out of Range state'
    );
    const trunckingpad2 = convert2ByteFloat(listData, x + 49, x + 50);
    const trunckingpad34 = convert2ByteFloat(listData, x + 51, x + 52);
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'UI Mode',
        value: uiMode,
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5 byte',
      },
      {
        label: 'Amplifier Mode',
        value: ampMode,
        rawData: listData.slice(6 + x, 7 + x).join(' '),
        databyte: '6 byte',
      },
      {
        label: 'Smu MeasurementMode Mod',
        value: smuMeasurement,
        rawData: listData.slice(7 + x, 8 + x).join(' '),
        databyte: '7 byte',
      },
      {
        label: 'DS VATT1',
        value: dsvatt1,
        rawData: listData.slice(8 + x, 10 + x).join(' '),
        databyte: '8 to 9 bytes',
      },
      {
        label: 'DS VATT2',
        value: dsvatt2,
        rawData: listData.slice(10 + x, 12 + x).join(' '),
        databyte: '10 to 11 bytes',
      },
      {
        label: 'DS VEQ1',
        value: dsveq1,
        rawData: listData.slice(12 + x, 14 + x).join(' '),
        databyte: '12 to 13 bytes',
      },
      {
        label: 'DS VEQ2',
        value: dsveq2,
        rawData: listData.slice(14 + x, 16 + x).join(' '),
        databyte: '14 to 15 bytes',
      },
      {
        label: 'DS VEQ3',
        value: dsveq3,
        rawData: listData.slice(16 + x, 18 + x).join(' '),
        databyte: '16 & 17 bytes',
      },
      {
        label: 'DS Power Control1',
        value: hexToDecimal(dspwrctr1),
        rawData: listData.slice(18 + x, 19 + x).join(' '),
        databyte: '18 byte',
      },
      {
        label: 'DS Power Control2',
        value: hexToDecimal(dspwrctr2),
        rawData: listData.slice(19 + x, 20 + x).join(' '),
        databyte: '19 byte',
      },
      {
        label: 'US VATT1A',
        value: usvattA,
        rawData: listData.slice(20 + x, 22 + x).join(' '),
        databyte: '20 & 21 bytes',
      },
      {
        label: 'US VATT1B',
        value: usvattB,
        rawData: listData.slice(22 + x, 24 + x).join(' '),
        databyte: '22 to 23 bytes',
      },
      {
        label: 'US VATT2',
        value: usvatt2,
        rawData: listData.slice(24 + x, 26 + x).join(' '),
        databyte: '24 to 25 bytes',
      },
      {
        label: 'US-RPF-VEQ',
        value: usrpfveq,
        rawData: listData.slice(26 + x, 28 + x).join(' '),
        databyte: '26 to 27 bytes',
      },
      {
        label: 'US-RPF-VEQ Drive 1',
        value: usrpfveq1,
        rawData: listData.slice(28 + x, 30 + x).join(' '),
        databyte: '28 & 29 bytes',
      },
      {
        label: 'US-RPF-VEQ Drive 2',
        value: usrpfveq2,
        rawData: listData.slice(30 + x, 32 + x).join(' '),
        databyte: '30 & 31 bytes',
      },
      {
        label: 'US-RPF-VEQ Drive 3',
        value: usrpfveq3,
        rawData: listData.slice(32 + x, 34 + x).join(' '),
        databyte: '32 & 33 bytes',
      },
      {
        label: 'RF Switch Control',
        value: rpfswitch,
        rawData: listData.slice(34 + x, 35 + x).join(' '),
        databyte: '34 byte',
      },
      {
        label: 'RPF Switch Control',
        value: rpfctrlswitch,
        rawData: listData.slice(35 + x, 36 + x).join(' '),
        databyte: '35 byte',
      },
      {
        label: 'DS Pilot Frequency',
        value: dspltfreq,
        rawData: listData.slice(36 + x, 38 + x).join(' '),
        databyte: '36 & 37 bytes',
      },
      {
        label: 'DS auto setup frequency 1',
        value: ch1freq,
        rawData: listData.slice(38 + x, 40 + x).join(' '),
        databyte: '38 & 39 bytes',
      },
      {
        label: 'DS auto setup frequency 2',
        value: ch2freq,
        rawData: listData.slice(40 + x, 42 + x).join(' '),
        databyte: '40 & 41 bytes',
      },
      {
        label: 'DS gain & tilt low frequency',
        value: ch3freq,
        rawData: listData.slice(42 + x, 44 + x).join(' '),
        databyte: '42 & 43 bytes',
      },
      {
        label: 'DS gain & tilt high frequency',
        value: ch4freq,
        rawData: listData.slice(44 + x, 46 + x).join(' '),
        databyte: '44 & 45 bytes',
      },
      {
        label: 'Scan Mode',
        value: scanMode,
        rawData: listData.slice(46 + x, 47 + x).join(' '),
        databyte: '46 byte',
      },
      {
        label: 'DS AGC State',
        value: dsagcStatus,
        rawData: listData.slice(47 + x, 48 + x).join(' '),
        databyte: '47 byte',
      },
      {
        label: 'US AGC State',
        value: usAgcStatus,
        rawData: listData.slice(48 + x, 49 + x).join(' '),
        databyte: '48 byte',
      },
      {
        label: 'Trunking Port2',
        value: trunckingpad2,
        rawData: listData.slice(49 + x, 51 + x).join(' '),
        databyte: '49 & 50 bytes',
      },
      {
        label: 'Trunking Port34',
        value: trunckingpad34,
        rawData: listData.slice(51 + x, 53 + x).join(' '),
        databyte: '51 & 52 bytes',
      },
    ];
  };

  const handle0x28process = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Temp low threshold',
        value: convert2ByteFloat(listData, x + 5, x + 6),
        rawData: listData.slice(5 + x, 7 + x).join(' '),
        databyte: '5 to 6 bytes',
      },
      {
        label: 'Temp high threshold',
        value: convert2ByteFloat(listData, x + 7, x + 8),
        rawData: listData.slice(7 + x, 9 + x).join(' '),
        databyte: '7 to 8 bytes',
      },
      {
        label: '24VDC high threshold',
        value: convert2ByteFloat(listData, x + 9, x + 10),
        rawData: listData.slice(9 + x, 11 + x).join(' '),
        databyte: '9 to 10 bytes',
      },
      {
        label: '24VDC high threshold',
        value: convert2ByteFloat(listData, x + 11, x + 12),
        rawData: listData.slice(11 + x, 13 + x).join(' '),
        databyte: '11 to 12 bytes',
      },
      {
        label: '8VDC low threshold',
        value: convert2ByteFloat(listData, x + 13, x + 14),
        rawData: listData.slice(13 + x, 15 + x).join(' '),
        databyte: '13 to 14 bytes',
      },
      {
        label: '8VDC high threshold',
        value: convert2ByteFloat(listData, x + 15, x + 16),
        rawData: listData.slice(15 + x, 17 + x).join(' '),
        databyte: '15 to 16 bytes',
      },
      {
        label: '5VDC low threshold',
        value: convert2ByteFloat(listData, x + 17, x + 18),
        rawData: listData.slice(17 + x, 19 + x).join(' '),
        databyte: '17 to 18 bytes',
      },
      {
        label: '5VDC high threshold',
        value: convert2ByteFloat(listData, x + 19, x + 20),
        rawData: listData.slice(19 + x, 21 + x).join(' '),
        databyte: '19 to 20 bytes',
      },
      {
        label: 'AC Input low threshold',
        value: convert2ByteFloat(listData, x + 21, x + 22),
        rawData: listData.slice(21 + x, 23 + x).join(' '),
        databyte: '21 to 22 bytes',
      },
      {
        label: 'AC Input high threshold',
        value: convert2ByteFloat(listData, x + 23, x + 24),
        rawData: listData.slice(23 + x, 25 + x).join(' '),
        databyte: '23 to 24 bytes',
      },
      {
        label: 'DS-Input low threshold',
        value: convert2ByteFloat(listData, x + 25, x + 26),
        rawData: listData.slice(25 + x, 27 + x).join(' '),
        databyte: '25 to 26 bytes',
      },
      {
        label: 'DS-Input high threshold',
        value: convert2ByteFloat(listData, x + 27, x + 28),
        rawData: listData.slice(27 + x, 29 + x).join(' '),
        databyte: '27 to 28 bytes',
      },
      {
        label: 'DS Pilot low threshold',
        value: convert2ByteFloat(listData, x + 29, x + 30),
        rawData: listData.slice(29 + x, 31 + x).join(' '),
        databyte: '29 to 30 bytes',
      },
      {
        label: 'DS Pilot high threshold',
        value: convert2ByteFloat(listData, x + 31, x + 32),
        rawData: listData.slice(31 + x, 33 + x).join(' '),
        databyte: '31 to 32 bytes',
      },
      {
        label: 'DS Channel 1 low threshold',
        value: convert2ByteFloat(listData, x + 33, x + 34),
        rawData: listData.slice(33 + x, 35 + x).join(' '),
        databyte: '33 to 34 bytes',
      },
      {
        label: 'DS Channel 1 high threshold',
        value: convert2ByteFloat(listData, x + 35, x + 36),
        rawData: listData.slice(35 + x, 37 + x).join(' '),
        databyte: '35 to 36 bytes',
      },
      {
        label: 'DS Channel 2 low threshold',
        value: convert2ByteFloat(listData, x + 37, x + 38),
        rawData: listData.slice(37 + x, 39 + x).join(' '),
        databyte: '37 to 38 bytes',
      },
      {
        label: 'DS Channel 2 high threshold',
        value: convert2ByteFloat(listData, x + 39, x + 40),
        rawData: listData.slice(39 + x, 41 + x).join(' '),
        databyte: '39 to 40 bytes',
      },
      {
        label: 'DS Channel 3 low threshold',
        value: convert2ByteFloat(listData, x + 41, x + 42),
        rawData: listData.slice(41 + x, 43 + x).join(' '),
        databyte: '41 to 42 bytes',
      },
      {
        label: 'DS Channel 3 high threshold',
        value: convert2ByteFloat(listData, x + 43, x + 44),
        rawData: listData.slice(43 + x, 45 + x).join(' '),
        databyte: '43 to 44 bytes',
      },
      {
        label: 'DS Channel 4 low threshold',
        value: convert2ByteFloat(listData, x + 45, x + 46),
        rawData: listData.slice(45 + x, 47 + x).join(' '),
        databyte: '45 to 46 bytes',
      },
      {
        label: 'DS Channel 4 high threshold',
        value: convert2ByteFloat(listData, x + 47, x + 48),
        rawData: listData.slice(47 + x, 49 + x).join(' '),
        databyte: '47 to 48 bytes',
      },
      {
        label: 'DS Pilot 2 Level low threshold',
        value: convert2ByteFloat(listData, x + 49, x + 50),
        rawData: listData.slice(49 + x, 51 + x).join(' '),
        databyte: '49 to 50 bytes',
      },
      {
        label: 'DS Pilot 2 Level high threshold',
        value: convert2ByteFloat(listData, x + 51, x + 52),
        rawData: listData.slice(51 + x, 53 + x).join(' '),
        databyte: '51 to 52 bytes',
      },
    ];
  };

  const handle0x2Bprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Temp low threshold',
        value: convert2ByteFloat(listData, x + 5, x + 6),
        rawData: listData.slice(5 + x, 7 + x).join(' '),
        databyte: '5 to 6 bytes',
      },
      {
        label: 'Temp high threshold',
        value: convert2ByteFloat(listData, x + 7, x + 8),
        rawData: listData.slice(7 + x, 9 + x).join(' '),
        databyte: '7 to 8 bytes',
      },
      {
        label: '24VDC high threshold',
        value: convert2ByteFloat(listData, x + 9, x + 10),
        rawData: listData.slice(9 + x, 11 + x).join(' '),
        databyte: '9 to 10 bytes',
      },
      {
        label: '24VDC high threshold',
        value: convert2ByteFloat(listData, x + 11, x + 12),
        rawData: listData.slice(11 + x, 13 + x).join(' '),
        databyte: '11 to 12 bytes',
      },
      {
        label: '8VDC low threshold',
        value: convert2ByteFloat(listData, x + 13, x + 14),
        rawData: listData.slice(13 + x, 15 + x).join(' '),
        databyte: '13 to 14 bytes',
      },
      {
        label: '8VDC high threshold',
        value: convert2ByteFloat(listData, x + 15, x + 16),
        rawData: listData.slice(15 + x, 17 + x).join(' '),
        databyte: '15 to 16 bytes',
      },
      {
        label: '5VDC low threshold',
        value: convert2ByteFloat(listData, x + 17, x + 18),
        rawData: listData.slice(17 + x, 19 + x).join(' '),
        databyte: '17 to 18 bytes',
      },
      {
        label: '5VDC high threshold',
        value: convert2ByteFloat(listData, x + 19, x + 20),
        rawData: listData.slice(19 + x, 21 + x).join(' '),
        databyte: '19 to 20 bytes',
      },
      {
        label: 'AC Input low threshold',
        value: convert2ByteFloat(listData, x + 21, x + 22),
        rawData: listData.slice(21 + x, 23 + x).join(' '),
        databyte: '21 to 22 bytes',
      },
      {
        label: 'AC Input high threshold',
        value: convert2ByteFloat(listData, x + 23, x + 24),
        rawData: listData.slice(23 + x, 25 + x).join(' '),
        databyte: '23 to 24 bytes',
      },
      {
        label: 'DS-Input low threshold',
        value: convert2ByteFloat(listData, x + 25, x + 26),
        rawData: listData.slice(25 + x, 27 + x).join(' '),
        databyte: '25 to 26 bytes',
      },
      {
        label: 'DS-Input high threshold',
        value: convert2ByteFloat(listData, x + 27, x + 28),
        rawData: listData.slice(27 + x, 29 + x).join(' '),
        databyte: '27 to 28 bytes',
      },
      {
        label: 'DS Pilot low threshold',
        value: convert2ByteFloat(listData, x + 29, x + 30),
        rawData: listData.slice(29 + x, 31 + x).join(' '),
        databyte: '29 to 30 bytes',
      },
      {
        label: 'DS Pilot high threshold',
        value: convert2ByteFloat(listData, x + 31, x + 32),
        rawData: listData.slice(31 + x, 33 + x).join(' '),
        databyte: '31 to 32 bytes',
      },
      {
        label: 'DS Channel 1 low threshold',
        value: convert2ByteFloat(listData, x + 33, x + 34),
        rawData: listData.slice(33 + x, 35 + x).join(' '),
        databyte: '33 to 34 bytes',
      },
      {
        label: 'DS Channel 1 high threshold',
        value: convert2ByteFloat(listData, x + 35, x + 36),
        rawData: listData.slice(35 + x, 37 + x).join(' '),
        databyte: '35 to 36 bytes',
      },
      {
        label: 'DS Channel 2 low threshold',
        value: convert2ByteFloat(listData, x + 37, x + 38),
        rawData: listData.slice(37 + x, 39 + x).join(' '),
        databyte: '37 to 38 bytes',
      },
      {
        label: 'DS Channel 2 high threshold',
        value: convert2ByteFloat(listData, x + 39, x + 40),
        rawData: listData.slice(39 + x, 41 + x).join(' '),
        databyte: '39 to 40 bytes',
      },
      {
        label: 'DS Channel 3 low threshold',
        value: convert2ByteFloat(listData, x + 41, x + 42),
        rawData: listData.slice(41 + x, 43 + x).join(' '),
        databyte: '41 to 42 bytes',
      },
      {
        label: 'DS Channel 3 high threshold',
        value: convert2ByteFloat(listData, x + 43, x + 44),
        rawData: listData.slice(43 + x, 45 + x).join(' '),
        databyte: '43 to 44 bytes',
      },
      {
        label: 'DS Channel 4 low threshold',
        value: convert2ByteFloat(listData, x + 45, x + 46),
        rawData: listData.slice(45 + x, 47 + x).join(' '),
        databyte: '45 to 46 bytes',
      },
      {
        label: 'DS Channel 4 high threshold',
        value: convert2ByteFloat(listData, x + 47, x + 48),
        rawData: listData.slice(47 + x, 49 + x).join(' '),
        databyte: '47 to 48 bytes',
      },
      {
        label: 'DS Pilot 2 Level low threshold',
        value: convert2ByteFloat(listData, x + 49, x + 50),
        rawData: listData.slice(49 + x, 51 + x).join(' '),
        databyte: '49 to 50 bytes',
      },
      {
        label: 'DS Pilot 2 Level high threshold',
        value: convert2ByteFloat(listData, x + 51, x + 52),
        rawData: listData.slice(51 + x, 53 + x).join(' '),
        databyte: '51 to 52 bytes',
      },
    ];
  };

  const handle0x2Eprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Number of points',
        value: convert2ByteUnsigned(listData, x + 5, x + 6),
        rawData: listData.slice(5 + x, 7 + x).join(' '),
        databyte: '5 to 6 bytes',
      },
      {
        label: 'No. of points in message',
        value: hexToDecimal(listData.slice(x + 7, x + 8).join('')),
        rawData: listData.slice(7 + x, 8 + x).join(' '),
        databyte: '7 byte',
      },
      {
        label: 'Starting Frequency',
        value: convert2ByteUnsigned(listData, x + 8, x + 9),
        rawData: listData.slice(8 + x, 10 + x).join(' '),
        databyte: '8 to 9 bytes',
      },
      {
        label: 'Frequency step size',
        value: convert2ByteUnsigned(listData, x + 10, x + 11),
        rawData: listData.slice(10 + x, 12 + x).join(' '),
        databyte: '10 to 11 bytes',
      },
      {
        label: 'Level 1',
        value: convert2ByteFloat(listData, x + 12, x + 13),
        rawData: listData.slice(12 + x, 14 + x).join(' '),
        databyte: '12 to 13 bytes',
      },
      {
        label: 'Level 2',
        value: convert2ByteFloat(listData, x + 14, x + 15),
        rawData: listData.slice(14 + x, 16 + x).join(' '),
        databyte: '14 to 15 bytes',
      },
      {
        label: 'Level 3',
        value: convert2ByteFloat(listData, x + 16, x + 17),
        rawData: listData.slice(16 + x, 18 + x).join(' '),
        databyte: '16 to 17 bytes',
      },
      {
        label: 'Level 4',
        value: convert2ByteFloat(listData, x + 18, x + 19),
        rawData: listData.slice(18 + x, 20 + x).join(' '),
        databyte: '18 to 19 bytes',
      },
      {
        label: 'Level 5',
        value: convert2ByteFloat(listData, x + 20, x + 21),
        rawData: listData.slice(20 + x, 22 + x).join(' '),
        databyte: '20 to 21 bytes',
      },
      {
        label: 'Level 6',
        value: convert2ByteFloat(listData, x + 22, x + 23),
        rawData: listData.slice(22 + x, 24 + x).join(' '),
        databyte: '22 to 23 bytes',
      },
      {
        label: 'Level 7',
        value: convert2ByteFloat(listData, x + 24, x + 25),
        rawData: listData.slice(24 + x, 26 + x).join(' '),
        databyte: '24 to 25 bytes',
      },
      {
        label: 'Level 8',
        value: convert2ByteFloat(listData, x + 26, x + 27),
        rawData: listData.slice(26 + x, 28 + x).join(' '),
        databyte: '26 to 27 bytes',
      },
      {
        label: 'Level 9',
        value: convert2ByteFloat(listData, x + 28, x + 29),
        rawData: listData.slice(28 + x, 30 + x).join(' '),
        databyte: '28 to 29 bytes',
      },
      {
        label: 'Level 10',
        value: convert2ByteFloat(listData, x + 30, x + 31),
        rawData: listData.slice(30 + x, 32 + x).join(' '),
        databyte: '30 to 31 bytes',
      },
      {
        label: 'Level 11',
        value: convert2ByteFloat(listData, x + 32, x + 33),
        rawData: listData.slice(32 + x, 34 + x).join(' '),
        databyte: '32 to 33 bytes',
      },
      {
        label: 'Level 12',
        value: convert2ByteFloat(listData, x + 34, x + 35),
        rawData: listData.slice(34 + x, 36 + x).join(' '),
        databyte: '34 to 35 bytes',
      },
      {
        label: 'Level 13',
        value: convert2ByteFloat(listData, x + 36, x + 37),
        rawData: listData.slice(36 + x, 38 + x).join(' '),
        databyte: '36 to 37 bytes',
      },
      {
        label: 'Level 14',
        value: convert2ByteFloat(listData, x + 38, x + 39),
        rawData: listData.slice(38 + x, 40 + x).join(' '),
        databyte: '38 to 39 bytes',
      },
      {
        label: 'Level 15',
        value: convert2ByteFloat(listData, x + 40, x + 41),
        rawData: listData.slice(40 + x, 42 + x).join(' '),
        databyte: '40 to 41 bytes',
      },
      {
        label: 'Level 16',
        value: convert2ByteFloat(listData, x + 42, x + 43),
        rawData: listData.slice(42 + x, 44 + x).join(' '),
        databyte: '42 to 43 bytes',
      },
      {
        label: 'Level 17',
        value: convert2ByteFloat(listData, x + 44, x + 45),
        rawData: listData.slice(44 + x, 46 + x).join(' '),
        databyte: '44 to 45 bytes',
      },
      {
        label: 'Level 18',
        value: convert2ByteFloat(listData, x + 46, x + 47),
        rawData: listData.slice(46 + x, 48 + x).join(' '),
        databyte: '46 to 47 bytes',
      },
      {
        label: 'Level 19',
        value: convert2ByteFloat(listData, x + 48, x + 49),
        rawData: listData.slice(48 + x, 50 + x).join(' '),
        databyte: '48 to 49 bytes',
      },
      {
        label: 'Level 20',
        value: convert2ByteFloat(listData, x + 50, x + 51),
        rawData: listData.slice(50 + x, 52 + x).join(' '),
        databyte: '50 to 51 bytes',
      },
      {
        label: 'Level 21',
        value: convert2ByteFloat(listData, x + 52, x + 53),
        rawData: listData.slice(52 + x, 54 + x).join(' '),
        databyte: '52 to 53 bytes',
      },
      {
        label: 'Level 22',
        value: convert2ByteFloat(listData, x + 54, x + 55),
        rawData: listData.slice(54 + x, 56 + x).join(' '),
        databyte: '54 to 55 bytes',
      },
    ];
  };

  const handle0x39process = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'DS-INPUT',
        value: convert2ByteFloat(listData, x + 6, x + 7),
        rawData: listData.slice(6 + x, 8 + x).join(' '),
        databyte: '6 to 7 bytes',
      },
      {
        label: 'DS OUTPUT PORT 2',
        value: convert2ByteFloat(listData, x + 8, x + 9),
        rawData: listData.slice(8 + x, 10 + x).join(' '),
        databyte: '8 to 9 bytes',
      },
      {
        label: 'DS OUTPUT PORT 3/4',
        value: convert2ByteFloat(listData, x + 10, x + 11),
        rawData: listData.slice(10 + x, 12 + x).join(' '),
        databyte: '10 to 11 bytes',
      },
      {
        label: 'US OUTPUT',
        value: convert2ByteFloat(listData, x + 12, x + 13),
        rawData: listData.slice(12 + x, 14 + x).join(' '),
        databyte: '12 to 13 bytes',
      },
      {
        label: 'DS Pilot Level',
        value: convert2ByteFloat(listData, x + 14, x + 15),
        rawData: listData.slice(14 + x, 16 + x).join(' '),
        databyte: '14 to 15 bytes',
      },
      {
        label: 'DS Pilot 2 Level',
        value: convert2ByteFloat(listData, x + 16, x + 17),
        rawData: listData.slice(16 + x, 18 + x).join(' '),
        databyte: '16 to 17 bytes',
      },
    ];
  };

  const handle0x2Aprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4).join(''),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'DS AGC Mode',
        value: convert2Values(listData, 4 + x, 'Off', 'ON'),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte',
      },
      {
        label: 'US AGC Mode',
        value: convert2Values(listData, 5 + x, 'Off', 'ON'),
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5 byte',
      },
      {
        label: 'DS Pilot Status',
        value: convert6Values(
          listData,
          6 + x,
          'normal',
          'pilot 1 low',
          'pilot 2 low',
          'pilot 1 & 2 low',
          '',
          ''
        ),
        rawData: listData.slice(6 + x, 7 + x).join(' '),
        databyte: '6 byte',
      },
      {
        label: 'DS AGC SP1 frequency',
        value: convert2ByteUnsigned(listData, x + 7, x + 8),
        rawData: listData.slice(7 + x, 9 + x).join(' '),
        databyte: '7 to 8 bytes',
      },
      {
        label: 'DS AGC SP2 frequency',
        value: convert2ByteUnsigned(listData, x + 9, x + 10),
        rawData: listData.slice(9 + x, 11 + x).join(' '),
        databyte: '9 to 10 bytes',
      },
      {
        label: 'DS AGC SP1 level',
        value: convert2ByteFloat(listData, x + 11, x + 12),
        rawData: listData.slice(11 + x, 13 + x).join(' '),
        databyte: '11 to 12 bytes',
      },
      {
        label: 'DS AGC SP2 level',
        value: convert2ByteFloat(listData, x + 13, x + 14),
        rawData: listData.slice(13 + x, 15 + x).join(' '),
        databyte: '13 to 14 bytes',
      },
      {
        label: 'DS AGC Gain',
        value: convert2ByteFloat(listData, x + 15, x + 16),
        rawData: listData.slice(15 + x, 17 + x).join(' '),
        databyte: '15 to 16 bytes',
      },
      {
        label: 'DS AGC Tilt',
        value: convert2ByteFloat(listData, x + 17, x + 18),
        rawData: listData.slice(17 + x, 19 + x).join(' '),
        databyte: '17 to 18 bytes',
      },
      {
        label: 'DS auto setup target level 1',
        value: convert2ByteFloat(listData, x + 19, x + 20),
        rawData: listData.slice(19 + x, 21 + x).join(' '),
        databyte: '19 to 20 bytes',
      },
      {
        label: 'DS auto setup target level 2',
        value: convert2ByteFloat(listData, x + 21, x + 22),
        rawData: listData.slice(21 + x, 23 + x).join(' '),
        databyte: '21 to 22 bytes',
      },
      {
        label: 'DS Pilot frequency 2',
        value: convert2ByteUnsigned(listData, x + 25, x + 26),
        rawData: listData.slice(25 + x, 27 + x).join(' '),
        databyte: '25 to 26 bytes',
      },
      {
        label: 'DS Pilot level 2',
        value: convert2ByteFloat(listData, x + 27, x + 28),
        rawData: listData.slice(27 + x, 29 + x).join(' '),
        databyte: '27 to 28 bytes',
      },
      {
        label: 'Auto Setup Status',
        value: hexToDecimal(listData.slice(x + 29, x + 30)),
        rawData: listData.slice(29 + x, 30 + x).join(' '),
        databyte: '29 byte',
      },
      {
        label: 'US Inp lvl target level',
        value: convert2ByteFloat(listData, x + 30, x + 31),
        rawData: listData.slice(30 + x, 32 + x).join(' '),
        databyte: '30 to 31 bytes',
      },
      {
        label: 'US Balancing Tilt-low',
        value: convert2ByteFloat(listData, x + 32, x + 33),
        rawData: listData.slice(32 + x, 34 + x).join(' '),
        databyte: '32 to 33 bytes',
      },
      {
        label: 'US Balancing Tilt-high',
        value: convert2ByteFloat(listData, x + 34, x + 35),
        rawData: listData.slice(34 + x, 36 + x).join(' '),
        databyte: '34 to 35 bytes',
      },
      {
        label: 'US Balancing Level',
        value: convert2ByteFloat(listData, x + 36, x + 37),
        rawData: listData.slice(36 + x, 38 + x).join(' '),
        databyte: '36 to 37 bytes',
      },
      {
        label: 'US AGC Gain',
        value: convert2ByteFloat(listData, x + 38, x + 39),
        rawData: listData.slice(38 + x, 40 + x).join(' '),
        databyte: '38 to 39 bytes',
      },
      {
        label: 'US AGC Tilt',
        value: convert2ByteFloat(listData, x + 40, x + 41),
        rawData: listData.slice(40 + x, 42 + x).join(' '),
        databyte: '40 to 41 bytes',
      },
      {
        label: 'Ingress control switch port 2',
        value: convert3Values(listData, 42 + x, '0 dB.', '6 dB.', 'Max.'),
        rawData: listData.slice(42 + x, 43 + x).join(' '),
        databyte: '42 bytes',
      },
      {
        label: 'Ingress control switch port 3/4',
        value: convert3Values(listData, 43 + x, '0 dB.', '6 dB.', 'Max.'),
        rawData: listData.slice(43 + x, 44 + x).join(' '),
        databyte: '43 bytes',
      },
      {
        label: 'Preceding amplifier DS levels',
        value: convert2Values(listData, 44 + x, 'standard', 'trunk'),
        rawData: listData.slice(44 + x, 45 + x).join(' '),
        databyte: '44 bytes',
      },
      {
        label: 'Trunk feed back-off',
        value: hexToDecimal(listData.slice(x + 45, x + 46)),
        rawData: listData.slice(45 + x, 46 + x).join(' '),
        databyte: '45 bytes',
      },
      {
        label: 'Press button DS step Size',
        value: hexToDecimal(listData.slice(x + 46, x + 47)),
        rawData: listData.slice(46 + x, 47 + x).join(' '),
        databyte: '46 bytes',
      },
      {
        label: 'Press button US step Size',
        value: hexToDecimal(listData.slice(x + 47, x + 48)),
        rawData: listData.slice(47 + x, 48 + x).join(' '),
        databyte: '47 bytes',
      },
      {
        label: 'DS and US press button status',
        value: hexToDecimal(listData.slice(x + 48, x + 49)),
        rawData: listData.slice(48 + x, 49 + x).join(' '),
        databyte: '48 bytes',
      },
      {
        label: 'DS and US press button boundary status',
        value: hexToDecimal(listData.slice(x + 49, x + 50)),
        rawData: listData.slice(49 + x, 50 + x).join(' '),
        databyte: '49 bytes',
      },
    ];
  };

  const handle0x3Cprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Part1 status',
        value: splitBytetoBit(
          listData,
          4 + x,
          0,
          'Response absent',
          'Response is present'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 0',
      },
      {
        label: 'Part2 status',
        value: splitBytetoBit(
          listData,
          4 + x,
          1,
          'Response absent',
          'Response is present'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 1',
      },
      {
        label: 'Part3 status',
        value: splitBytetoBit(
          listData,
          4 + x,
          2,
          'Response absent',
          'Response is present'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 2',
      },
      {
        label: 'Part4 status',
        value: splitBytetoBit(
          listData,
          4 + x,
          3,
          'Response absent',
          'Response is present'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 3',
      },
      {
        label: 'Recorder Availiablity status',
        value: splitBytetoBit(
          listData,
          4 + x,
          7,
          'setup record is not available',
          'setup record is available'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 7',
      },
      {
        label: 'Firmware Version',
        value: ConvertDotData(listData, x + 5, x + 6),
        rawData: listData.slice(5 + x, 7 + x).join(' '),
        databyte: '5 & 6 bytes',
      },
      {
        label: 'Loader version',
        value: ConvertDotData(listData, x + 7, x + 8),
        rawData: listData.slice(7 + x, 9 + x).join(' '),
        databyte: '7 & 8 bytes',
      },
      {
        label: 'split',
        value: convert6Values(
          listData,
          9,
          'not installed',
          '085',
          '204',
          '396',
          '492',
          '684'
        ),
        rawData: listData.slice(9 + x, 10 + x).join(' '),
        databyte: '9 byte',
      },
      {
        label: 'SMU Type',
        value: convert2Values(listData, 10, 'Standard', 'Premium'),
        rawData: listData.slice(10 + x, 11 + x).join(' '),
        databyte: '10 byte',
      },
      {
        label: 'SMU Serial No.',
        value: ConvertLongDataHex(listData, x + 11, x + 26),
        rawData: listData.slice(11 + x, 27 + x).join(' '),
        databyte: '11 to 26 bytes',
      },
      {
        label: 'DS gain & tilt low frequency',
        value: convert2ByteUnsigned(listData, x + 27, x + 28),
        rawData: listData.slice(27 + x, 29 + x).join(' '),
        databyte: '27 & 28 bytes',
      },
      {
        label: 'DS gain & tilt high frequency',
        value: convert2ByteUnsigned(listData, x + 29, x + 30),
        rawData: listData.slice(29 + x, 31 + x).join(' '),
        databyte: '29 & 30 bytes',
      },
      {
        label: 'DS gain (@high frequency)',
        value: convert2ByteFloat(listData, x + 31, x + 32),
        rawData: listData.slice(31 + x, 33 + x).join(' '),
        databyte: '31 & 32 bytes',
      },
      {
        label: 'DS tilt (@low frequency)',
        value: convert2ByteFloat(listData, x + 33, x + 34),
        rawData: listData.slice(33 + x, 35 + x).join(' '),
        databyte: '33 & 34 bytes',
      },
      {
        label: 'US gain (@high frequency)',
        value: convert2ByteFloat(listData, x + 35, x + 36),
        rawData: listData.slice(35 + x, 37 + x).join(' '),
        databyte: '35 & 36 bytes',
      },
      {
        label: 'US tilt (@low frequency)',
        value: convert2ByteFloat(listData, x + 37, x + 38),
        rawData: listData.slice(37 + x, 39 + x).join(' '),
        databyte: '37 & 38 bytes',
      },
      {
        label: 'US input attenuation Port2',
        value: convert2ByteFloat(listData, x + 39, x + 40),
        rawData: listData.slice(39 + x, 41 + x).join(' '),
        databyte: '39 & 40 bytes',
      },
      {
        label: 'Local Date',
        value: date(listData, x + 41, x + 43),
        rawData: listData.slice(41 + x, 44 + x).join(' '),
        databyte: '41 to 43 bytes',
      },
      {
        label: 'Local Time',
        value: time(listData, x + 44, x + 46),
        rawData: listData.slice(44 + x, 47 + x).join(' '),
        databyte: '44 to 46 bytes',
      },
      {
        label: 'US input attenuation Port3/4',
        value: convert2ByteFloat(listData, x + 47, x + 48),
        rawData: listData.slice(47 + x, 49 + x).join(' '),
        databyte: '47 & 48 bytes',
      },
      {
        label: 'Temperature',
        value: convert2ByteFloat(listData, x + 49, x + 50),
        rawData: listData.slice(49 + x, 51 + x).join(' '),
        databyte: '49 & 50 bytes',
      },
    ];
  };

  const handle0x3Aprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Extended Model Number',
        value: ConvertLongDataHex(listData, x + 6, x + 42),
        rawData: listData.slice(6 + x, 42 + x).join(' '),
        databyte: '6 to 41 bytes',
      },
    ];
  };

  const handle0x38process = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'address status',
        value: splitBytetoBit(
          listData,
          x + 4,
          0,
          'address is absent.',
          'address is present.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 0',
      },
      {
        label: 'scratch pad status',
        value: splitBytetoBit(
          listData,
          x + 4,
          1,
          'scratch pad is absent.',
          'scratch pad is present.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 1',
      },
      {
        label: 'Address',
        value: ConvertLongDataHex(listData, x + 5, x + 56),
        rawData: listData.slice(5 + x, 57 + x).join(' '),
        databyte: '5 to 56 bytes',
      },
    ];
  };

  const handle0x2Fprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Node ID status',
        value: convert2Values(
          listData,
          x + 4,
          0,
          'node ID is absent',
          'node ID is present'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 0',
      },
      {
        label: 'Amplifier ID status',
        value: convert2Values(
          listData,
          x + 4,
          1,
          'amplifier ID is absent',
          'amplifier ID is present.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 1',
      },
      {
        label: 'Node ID',
        value: ConvertLongDataHex(listData, x + 5, x + 20),
        rawData: listData.slice(5 + x, 21 + x).join(' '),
        databyte: '5 to 20 bytes',
      },
      {
        label: 'Amplifier ID',
        value: ConvertLongDataHex(listData, x + 21, x + 36),
        rawData: listData.slice(21 + x, 37 + x).join(' '),
        databyte: '21 to 36 bytes',
      },
    ];
  };

  const handle0x3Bprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Status',
        value: convert3Values(
          listData,
          x + 4,
          'name type not supported.',
          'universal plug-in(enhancer) name',
          'GPS location string.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte',
      },
      {
        label: 'Plug-in name support',
        value: hexToDecimal(listData.slice(x + 5, x + 6).join(''), x + 5),
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5 byte',
      },
      {
        label: 'Plug-in name size',
        value: hexToDecimal(listData.slice(x + 6, x + 7).join(''), x + 6),
        rawData: listData.slice(6 + x, 7 + x).join(' '),
        databyte: '6 byte',
      },
      {
        label: 'plug-in',
        value: ConvertLongDataHex(listData, x + 7, x + 38),
        rawData: listData.slice(7 + x, 39 + x).join(' '),
        databyte: '7 to 38 bytes',
      },
    ];
  };

  const handle0x2Cprocess = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Local time setting',
        value: splitBytetoBit(
          listData,
          x + 4,
          0,
          'local time has not been set.',
          'local time has been set.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 0',
      },
      {
        label: 'SMU presence',
        value: splitBytetoBit(
          listData,
          x + 4,
          1,
          'SMU is absent.',
          'SMU is present.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 1',
      },
      {
        label: 'Transponder presence',
        value: splitBytetoBit(
          listData,
          x + 4,
          2,
          'transponder is absent..',
          'transponder is present.'
        ),
        rawData: listData.slice(4 + x, 5 + x).join(' '),
        databyte: '4 byte bit 2',
      },
      {
        label: 'Local Time',
        value:
          date(listData, x + 5, x + 7) + ' ' + time(listData, x + 8, x + 10),
        rawData: listData.slice(5 + x, 11 + x).join(' '),
        databyte: '5 to 10 bytes',
      },
      {
        label: 'SMU Serial Number',
        value: ConvertLongDataHex(listData, x + 11, 26 + x),
        rawData: listData.slice(11 + x, 27 + x).join(' '),
        databyte: '11 to 26 bytes',
      },
      {
        label: 'GPS Latitude',
        value: convertHexToDouble(listData, x + 27, x + 34),
        rawData: listData.slice(27 + x, 35 + x).join(' '),
        databyte: '27 to 34 bytes',
      },
      {
        label: 'Adaptive Power Status',
        value: convert2Values(listData, x + 35, 'disabled', 'enabled'),
        rawData: listData.slice(35 + x, 36 + x).join(' '),
        databyte: '35 byte',
      },
      {
        label: 'Transponder enable status',
        value: convert2Values(listData, x + 36, 'disabled', 'enabled'),
        rawData: listData.slice(36 + x, 37 + x).join(' '),
        databyte: '36 byte',
      },
      {
        label: 'GPS Longitude',
        value: convertHexToDouble(listData, x + 37, x + 44),
        rawData: listData.slice(37 + x, 45 + x).join(' '),
        databyte: '37 to 44 bytes',
      },
      {
        label: 'Transponder Serial Number',
        value: ConvertLongDataHex(listData, x + 45, x + 60),
        rawData: listData.slice(45 + x, 61 + x).join(' '),
        databyte: '45 to 60 bytes',
      },
    ];
  };

  const handle0x27process = (listData) => {
    return [
      { label: 'Input', value: listData.join(' '), databyte: ' ' },
      {
        label: 'Msg No',
        value: listData.slice(x + 3, x + 4),
        rawData: listData.slice(x + 3, x + 4),
        databyte: '3 byte',
      },
      {
        label: 'Alarm Low byte',
        value: hexToDecimal(listData.slice(x + 5, x + 6)),
        rawData: listData.slice(5 + x, 6 + x).join(' '),
        databyte: '5 byte',
      },
      {
        label: 'Alarm Low byte2',
        value: hexToDecimal(listData.slice(x + 6, x + 7)),
        rawData: listData.slice(6 + x, 7 + x).join(' '),
        databyte: '6 byte',
      },
      {
        label: 'Alarm High byte1',
        value: hexToDecimal(listData.slice(x + 7, x + 8)),
        rawData: listData.slice(7 + x, 8 + x).join(' '),
        databyte: '7 byte',
      },
      {
        label: 'Alarm High byte2',
        value: hexToDecimal(listData.slice(x + 8, x + 9)),
        rawData: listData.slice(8 + x, 9 + x).join(' '),
        databyte: '8 byte',
      },
      {
        label: 'Alarm Summary',
        value: hexToDecimal(listData.slice(x + 15, x + 16)),
        rawData: listData.slice(15 + x, 16 + x).join(' '),
        databyte: '15 byte',
      },
      {
        label: 'warning low byte1',
        value: hexToDecimal(listData.slice(x + 21, x + 22)),
        rawData: listData.slice(21 + x, 22 + x).join(' '),
        databyte: '21 byte',
      },
      {
        label: 'warning low byte2',
        value: hexToDecimal(listData.slice(x + 22, x + 23)),
        rawData: listData.slice(22 + x, 23 + x).join(' '),
        databyte: '22 byte',
      },
      {
        label: 'warning high byte1',
        value: hexToDecimal(listData.slice(x + 23, x + 24)),
        rawData: listData.slice(23 + x, 24 + x).join(' '),
        databyte: '23 byte',
      },
      {
        label: 'warning high byte2',
        value: hexToDecimal(listData.slice(x + 24, x + 25)),
        rawData: listData.slice(24 + x, 25 + x).join(' '),
        databyte: '24 byte',
      },
    ];
  };
  const handleClear = () => {
    setResults([]);
  };

  const renderTable = (index) => (
    <div style={styles.wrapper}>
      {results.length > 0 && (
        <div style={styles.paper}>
          <div style={styles.headers}>
            <span style={styles.headerItem}>
              <strong>Variables</strong>
            </span>

            <span style={styles.headerItem}>
              <strong>Values</strong>
              <button
                onClick={toggleHexValues}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {showHexValues ? 'Hide Hex Values' : 'Show Hex Values'}
              </button>
            </span>
            {showHexValues && (
              <span style={styles.headerItem}>
                <strong>Hex Values</strong>
              </span>
            )}
          </div>
          <div style={styles.dataBlock}>
            {results.map((row, index) => (
              <div
                key={index}
                style={{
                  ...styles.row,
                  color: row.label === 'Input' ? 'red' : 'inherit',
                }}
              >
                {row.label === 'Input' ? (
                  <span style={styles.item}>{`Rx: ${row.value || ''}`}</span>
                ) : (
                  <>
                    <span
                      style={{
                        ...styles.item,
                        color: 'rgb(0, 116, 232)', // Color for label and databyte
                      }}
                    >
                      {row.label && row.databyte
                        ? `${row.label} (${row.databyte})`
                        : ''}
                    </span>
                    <span
                      style={{
                        ...styles.item,
                        color: 'rgb(221, 0, 169)', // Color for values
                      }}
                    >
                      {row.value !== undefined && row.value !== null
                        ? `${row.value}`
                        : ''}
                    </span>
                    {showHexValues && (
                      <span
                        style={{
                          ...styles.item,
                          color: 'green',
                        }}
                      >
                        {row.rawData !== undefined && row.rawData !== null
                          ? `[${row.rawData}]`
                          : ''}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <datalist id="ipAddresss">
          <option value="192.168.1.170" />
          <option value="192.168.1.219" />
        </datalist>
        <label>
          <input
            type="text"
            style={{ marginLeft: '300px' }}
            placeholder="Enter IP Address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            list="ipAddresss"
          />
          {'                                                  '}
        </label>
        <datalist id="fileSuggestions">
          <option value="/storage/emulated/0/Download/cmstxrx.log" />
          <option value="/home/dongle/cada-server/cmslog.txt" />
          <option value="C:\Program Files (x86)\CommScope\Opti-Trace Server\cmslog.txt" />
          <option value="C:\Users\pavan\Downloads\spectrum.txt" />
        </datalist>
        <input
          type="text"
          style={{ marginRight: '10px' }}
          placeholder="Enter file path"
          value={filedata}
          onChange={(e) => setFiledata(e.target.value)}
          list="fileSuggestions"
        />

        <button
          style={{ marginRight: '10px' }}
          type="submit"
          onClick={getFileData1}
        >
          Fetch Data or Refresh Data
        </button>
        <button
          onClick={processMessages}
          style={{
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            marginRight: '5px',
          }}
        >
          SET
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'red',
            color: '#fff',
            cursor: 'pointer',
            marginRight: '5px',
          }}
        >
          Clear
        </button>
        <button
          onClick={clearData}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'red',
            color: '#fff',
            cursor: 'pointer',
             marginRight: '5px'
          }}
        >
          Clear Logfile
        </button>
        <input
          type="text"
          style={{ marginRight: '10px' }}
          placeholder="Search by Message Type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button style={{ marginRight: '10px' }} onClick={searchData}>
          Search by Message Type
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <textarea
          rows="1"
          cols="10"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Enter your Tx and Rx data here..."
          style={{
            width: '95%',
            padding: '10px',
            marginBottom: '10px',
            fontFamily: 'monospace',
          }}
        />
      </div>
      {renderTable(1)}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',

    gap: '1px',
  },
  paper: {
    border: '2px solid #ddd',
    padding: '5px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',

    margin: 'auto',
    flex: '1 1 calc(40% )',
    maxWidth: 'calc(80% )',
    minWidth: '200px',
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: '2px',
    fontSize: '12px',
  },
  headers: {
    display: 'flex',
    justifyContent: 'center',
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
    textAlign: 'center',
    fontSize: '12px',
  },
  dataBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    justifyContent: 'flex-start',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0px',
    backgroundColor: '#fff',
    borderRadius: '1px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  item: {
    flex: 1,
    textAlign: 'left',
    fontSize: '12px',
  },
};

export default LogDetail;
