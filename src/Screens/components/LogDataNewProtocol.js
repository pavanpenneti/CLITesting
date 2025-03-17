import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faTerminal,
  faClipboard,
  faCalendarAlt,
  faNetworkWired,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';

function LogDataNewProtocol() {
  const [data, setData] = useState('');
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [inputText, setInputText] = useState('');
  const [appendedData, setAppendedData] = useState([]);
  const [result, setResult] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const path = `https://${ipAddress}:5232`;
  const [filedata, setFiledata] = useState('');
  const iconStyle = { color: 'green' };
  const dictionary_data = [
    'DX4505',
    'FA45XX',
    'AR4001',
    'AR4002',
    'DT4000',
    'TECCurA',
    'TECCurB',
    'OutPwrA',
    'NM4001',
    'Inp Pwr',
    'Out Pwr',
    'Lsr Cur',
    'BF Cur',
    'PSVAC1',
    'PSVAC2',
    'PSStat1',
    'PSStat2',
    'FSStatA',
    'FSStatB',
    ' +24VDC',
    ' +12VDC',
    ' +5VDC',
    ' +3.3VDC',
    'InpPwrA',
    'InpPwrB',
    'AROpPwA',
    'AROpPwB',
    'BF CurA',
    'BF CurB',
    'AROpPwC',
    'AROpPwD',
    'RSStat1',
    'RSStat3',
    'RSStat4',
    'RSStat6',
    'NM4002',
    'RxPwrA',
    'RxPwrB',
    'TxPwrA',
    'TxPwrB',
    'SFPTmpA',
    'SFPTmpB',
    'FSThshA',
    'FSThshB',
    'AROpPwE',
    'PS24VDC',
    'PS12VDC',
    'OutPwrB',
    'LsrTmpA',
    'LsrTmpB',
    'DS4008',
    'ITU ch#',
    'DT3505',
    'Bo Temp',
    'ModeCtl',
    'InpPwr[0x01]',
    'OutPwr[0x01]',
    'LsrTmp[0x0D]',
    'FA4517B',
    'FA4517S',
    'OP4538',
    'OS42S1S',
    'SW Pos',
    'Setting',
    'DX4515',
    'FA4514S',
    'FA4522S',
    'FA4512S',
    'PASSIVE',
    'DS4004U',
    'FA4524S',
    'LsrCurA',
    'LsrCurB',
    'SM4002',
    'Lid',
    'Humidty',
    'AR4041',
    'GE4132M',
    'FA4527',
    'LsrTmp',
    'LsrCur',
    'TECCur',
    'BC Pwr',
    'NC Pwr',
    'BC/NC',
    'Attenu',
    'LC4002',
    'AR4003G',
    'FA4522',
    'Muting',
    'AR4103G',
    'AR4203G',
    'AR4403G',
    'Connect',
    'Laser',
    'FA4521S',
    'OR4168',
    'Gain',
    'NM41EEG',
    'Reboot',
    'SysTime',
    'NotUsed',
    'IS1_att',
    'IS3_off',
    'IS3_att',
    'IS1_off',
    'NM2002',
    'OR4148',
    'AR4503G',
    'PA4114G',
    'DC4520',
    'PSVDC1',
    'FactDef',
    'Alm',
    'Thrshd',
    'Modu ID',
    'Ext MID',
    'Version',
    'RSok1',
    'CPE',
    'Lambda',
    'WaveLen',
    'RF Port',
    'Current',
    'Config',
    'Usage',
    'Voltage',
    'RxPwrC',
    'RxPwrD',
  ];
  const display_units = [
    'dB',
    'dBm',
    'V',
    'mV',
    'mA',
    'uA',
    'mW',
    'nm',
    'Absent',
    'Present',
    'OK',
    'Failed',
    " ' '",
    'Celsius',
    'On',
    'Off',
    'Yes',
    'No',
    'Primary',
    'Secndry',
    ';',
    'dBm',
    'C',
    'A',
    'B',
    'Closed',
    'Open',
    'Percent',
    'ConGain',
    'ConCurr',
    'Invalid',
    'Enable',
    'Disable',
    'Second',
    'Manual',
    'Auto',
    'RF',
    'Optical',
    'TooHigh',
    'Single',
    'Dual',
    'FactDef',
    'Watt',
    'TooLow',
    'WL1310',
    'WL1550',
    'Low',
    'High',
    'dBmV',
    'ConPwr',
    'Active',
    'Inactiv',
  ];

  const getFileData1 = async () => {
    try {
      const response = await axios.get(
        `${path}/getlogdata?filename=${filedata}`
      );
      const data_remove = response.data.replace(/<[^>]*>/g, '');
      const data_analayze = data_remove.replace(/ = /g, ': ');
      setData(data_analayze);
    } catch (e) {
      alert(
        `IP Address is Incorrect or Connection to host(CADA/VPN) is lost or Server is not running`
      );
    }
  };

  const clearData = async () => {
    try {
      const response = await axios.get(
        `${path}/clearlogdata?filename=${filedata}`
      );
      const data_remove = response.data.replace(/<[^>]*>/g, '');
      setData(data_remove);
    } catch (error) {
      console.error('Error fetching file data:', error);
    }
  };

  const searchData = async () => {
    const messages = data.split('\n');

    // Filter the messages based on the search query
    const filtered = messages.filter((message) => {
      const chars26and27 = message.substring(25, 27); // Get the 26th and 27th characters
      return chars26and27.includes(searchQuery);
    });

    // Join the filtered messages back into a string (if needed)
    const filteredData = filtered.join('\n');

    // Update the state with the filtered data
    setData(filteredData);
  };

  const addRedColorToCharacters = (line) => {
    const characters = line.split('');
    var x = 1;
    var y = 5   ;
    var z = 10;
    characters[(x - 1) * 3 + y] = (
      <span key={(x - 1) * 3 + y} style={{ color: 'red' }}>
        {characters[(x - 1) * 3 + y]}
      </span>
    );
    characters[(x - 1) * 3 + z] = (
      <span key={(x - 1) * 3 + z} style={{ color: 'red' }}>
        {characters[(x - 1) * 3 + z]}
      </span>
    );

    return characters;
  };

  const applyColorToText = (line) => {
    const characters = line.split('');
    var x = (start - 1) * 3 + 19;
    var y = (end - 1) * 3 + 21;
    for (let i = x; i < y; i++) {
      characters[i] = (
        <span key={i} style={{ color: 'red' }}>
          {characters[i]}
        </span>
      );
    }
    return characters;
  };

  // Adding logic to conversion

  const convertToHex = (event) => {
    event.preventDefault();
    try {
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }
      const asciiString = String.fromCharCode(...byteArray);
      setResult(asciiString);
    } catch (error) {
      setResult('Invalid hexadecimal input');
    }
  };

  const convertToHexInReverse = (event) => {
    event.preventDefault();
    try {
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }
      byteArray.reverse();
      const asciiString = String.fromCharCode(...byteArray);
      setResult(asciiString);
    } catch (error) {
      setResult('Invalid hexadecimal input');
    }
  };

  const convertTofloat = (event) => {
    event.preventDefault();
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);

    // Ensure that the value is within the valid uint8 range (0 to 255)
    if (intValue >= 0 && intValue <= 255) {
      setResult(intValue);
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
    try {
      // Remove any spaces and convert the hexadecimal input to a byte array
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }

      // Create a Float32Array from the byte array
      const floatArray = new Float32Array(new Uint8Array(byteArray).buffer);

      // Extract the float value
      const floatValue = floatArray[0];

      // Set the float output
      setResult(floatValue);
    } catch (error) {
      // Handle invalid input
      setResult(null);
    }
  };

  const convertTofloattwoByteReverse = (event) => {
    event.preventDefault();
    try {
      // Remove any spaces and convert the hexadecimal input to a byte array
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }

      // Reverse the byte array
      byteArray.reverse();
      console.log(byteArray.reverse());
      // Create a Float32Array from the byte array
      const floatArray = new Float32Array(new Uint8Array(byteArray).buffer);

      // Extract the float value
      const floatValue = floatArray[0];

      // Set the float output
      setResult(floatValue);
    } catch (error) {
      // Handle invalid input
      setResult(null);
    }
  };

  const convertTofloat2 = (event) => {
    event.preventDefault();
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);

    // Ensure that the value is within the valid int8 range (-128 to 127)
    if (intValue >= 0x80) {
      // Handle negative value
      setResult(intValue - 0x100);
    }
  };
  const clearConversionText = (event) => {
    event.preventDefault();
    setResult(' ');
    setInputText(' ');
  };

  function hexToBinary(hex) {
    return parseInt(hex, 16).toString(2).padStart(64, '0');
  }
  const convertHexToDouble = () => {
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
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

    setResult(doubleValue);
  };

  const reverseconvertHexToDouble = () => {
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      const hexPair = hexWithoutSpaces.substr(i, 2);
      byteArray.push(hexPair);
    }

    const hexWithoutSpaces1 = byteArray.reverse().join('');
    console.log(hexWithoutSpaces1);
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

    setResult(doubleValue);
  };

  const convertToInt2 = (event) => {
    event.preventDefault();
    try {
      // Remove any spaces and convert the hexadecimal input to an integer
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const intValue = parseInt(hexWithoutSpaces, 16);

      // Ensure that the value is within the valid uint16 range (0 to 65535)
      if (intValue >= 0 && intValue <= 65535) {
        setResult(intValue);
      } else {
        // Handle out-of-range input
        setResult(null);
      }
    } catch (error) {
      // Handle invalid input
      setResult(null);
    }
  };

  const convertToInt2Reverse = (event) => {
    event.preventDefault();
    try {
      // Remove any spaces and convert the hexadecimal input to a byte array
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }

      // Reverse the byte array
      byteArray.reverse();
      console.log(byteArray.reverse());
      // Combine the bytes to form an unsigned integer
      let unsignedInt = 0;
      for (let i = 0; i < byteArray.length; i++) {
        unsignedInt |= byteArray[i] << (i * 8);
      }

      // Set the unsigned integer output
      setResult(unsignedInt);
    } catch (error) {
      // Handle invalid input
      setResult(null);
    }
  };

  const convertToInt4Byte = (event) => {
    event.preventDefault();
    try {
      // Remove any spaces and convert the hexadecimal input to an integer
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const intValue = parseInt(hexWithoutSpaces, 16);

      // Ensure that the value is within the valid uint32 range (0 to 4294967295)
      if (intValue >= 0 && intValue <= 4294967295) {
        setResult(intValue);
      } else {
        // Handle out-of-range input
        setResult(null);
      }
    } catch (error) {
      // Handle invalid input
      setResult(null);
    }
  };

  const convertToInt4ByteReverse = (event) => {
    event.preventDefault();
    try {
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }
      byteArray.reverse();
      console.log(byteArray.reverse());
      let unsignedInt = 0;
      for (let i = 0; i < byteArray.length; i++) {
        unsignedInt |= byteArray[i] << (i * 8);
      }
      setResult(unsignedInt);
    } catch (error) {
      setResult(null);
    }
  };

  const signedconvertToInt2Byte = (event) => {
    event.preventDefault();
    try {
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const intValue = parseInt(hexWithoutSpaces, 16);
      if (intValue >= 0x8000 && intValue <= 32767) {
        setResult(intValue - 0x10000);
      } else {
        setResult(null);
      }
    } catch (error) {
      setResult(null);
    }
  };

  const signedconvertToInt2ByteReverse = (event) => {
    event.preventDefault();
    try {
      const hexWithoutSpaces = inputText.replace(/\s/g, '');
      const byteArray = [];
      for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
        byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
      }
      byteArray.reverse();
      console.log(byteArray.reverse());
      let signedInt = 0;
      for (let i = 0; i < byteArray.length; i++) {
        signedInt |= byteArray[i] << (i * 8);
      }
      if (signedInt & 0x8000) {
        signedInt = signedInt - 0x10000;
      }
      setResult(signedInt);
    } catch (error) {
      setResult(null);
    }
  };

  const signedconvertToInt4Byte = (event) => {
    event.preventDefault();

    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const intValue = parseInt(hexWithoutSpaces, 16);
    if (intValue & 0x80000000) {
      intValue = intValue - 0x100000000;
    }
    setResult(intValue);
  };

  const signedconvertToInt4ByteReverse = (event) => {
    event.preventDefault();

    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    byteArray.reverse();
    console.log(byteArray.reverse());
    let signedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      signedInt |= byteArray[i] << (i * 8);
    }
    setResult(signedInt);
  };

  const reverseData = (event) => {
    event.preventDefault();
    const reversedHex = inputText.split('').reverse().join('');
    setResult(reversedHex);
  };

  const convertToDecimal = (event) => {
    event.preventDefault();
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    setResult(decimalNumber);
  };

  const convertToDecimalReverse = (event) => {
    event.preventDefault();
    const reversedHex = inputText.split('').reverse().join('');
    const hexWithoutSpaces = reversedHex.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    setResult(decimalNumber);
  };

  const ConvertToBinary = (event) => {
    event.preventDefault();
    const decimalNumber = parseInt(inputText, 16);
    const binaryString = decimalNumber.toString(2);
    setResult(binaryString);
  };
  const ConvertToBinaryReverse = (event) => {
    event.preventDefault();
    const reversedHex = inputText.split('').reverse().join('');
    const decimalNumber = parseInt(reversedHex, 16);
    const binaryString = decimalNumber.toString(2);
    setResult(binaryString);
  };

  const Dictionary_data = (event) => {
    event.preventDefault();
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    const value = dictionary_data[decimalNumber];
    setResult(value);
  };

  const Display_units = (event) => {  
    event.preventDefault();
    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const decimalNumber = parseInt(hexWithoutSpaces, 16).toString();
    const value = display_units[decimalNumber];
    setResult(value);
  };
  const Display_time = (event) => {
    event.preventDefault();

    const hexWithoutSpaces = inputText.replace(/\s/g, '');
    const byteArray = [];
    for (let i = 0; i < hexWithoutSpaces.length; i += 2) {
      byteArray.push(parseInt(hexWithoutSpaces.substr(i, 2), 16));
    }
    byteArray.reverse();
    console.log(byteArray.reverse());
    let signedInt = 0;
    for (let i = 0; i < byteArray.length; i++) {
      signedInt |= byteArray[i] << (i * 8);
    }
    console.log(signedInt);
    const totalSeconds = Math.floor(signedInt / 1000);
    console.log('seconds', +totalSeconds);
    const daysValue = Math.floor(signedInt / (24 * 3600));

    const hoursValue = Math.floor((signedInt % (24 * 3600)) / 3600);
    const minutesValue = Math.floor((signedInt % 3600) / 60);
    const secondsValue = signedInt % 60;
    const time_data =
      daysValue +
      ' days ' +
      hoursValue +
      ' hours ' +
      minutesValue +
      ' mins ' +
      secondsValue +
      ' secs';
    setResult(time_data);
  };

  const NoOfCharacters = (event) => {
    event.preventDefault();
    const characterslength = inputText.length;
    setResult(characterslength);
  };

  const NoOfWords = (event) => {
    event.preventDefault();
    const wordslength = inputText.trim().split(/\s+/).filter(Boolean).length;
    setResult(wordslength);
  };
  const checksum = (event) => {
    event.preventDefault();
    console.log(inputText);
    try {
      // Preprocess the inputText
      const normalizedInput = inputText.trim().replace(/ /g, ''); // Remove all spaces
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
      setResult(checksumHex);
    } catch (error) {
      alert(error.message);
    }
  };
  const splitHex = (event) => {
    event.preventDefault();
    try {
      const normalizedInput = inputText.match(/.{1,2}/g)?.join(' ') || '';; // Remove all spaces  
      setResult(normalizedInput);
    } catch (error) {
      alert(error.message);
    }
  };
  const handleChangeText = (event) => {
    setText(event.target.value);  // Update the state with the new value
  };
  return (
    <div>
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
        <datalist id="ipAddresss">
        <option value="10.27.105.99"/>
          <option value="192.168.1.170" />
          <option value="192.168.1.219" />
          <option value="192.168.20.1"/>
          
        </datalist>
        <label>
        
          <input
            type="text"
            style={{ marginLeft: '300px' }}
            placeholder="Enter IP Address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            list= "ipAddresss"
          />
          {'                                                  '}
        </label>
        <datalist id="fileSuggestions">
        <option value="C:\Users\Sw-Lab\PycharmProjects\Amplifier_API\cmslog.txt" />
          <option value="/storage/emulated/0/Download/cmstxrx.log" />
          <option value="/home/dongle/cada-server/cmslog.txt" />
          <option value="C:\Program Files (x86)\CommScope\Opti-Trace Server\cmslog.txt" />
        </datalist>
        <input
          type="text"
          style={{ marginRight: '10px' }}
          placeholder="Enter file path"
          value={filedata}
          onChange={(e) => setFiledata(e.target.value)}
          list="fileSuggestions"
          // title="/storage/emulated/0/Download/cmstxrx.log /home/dongle/cada-server/cmslog.txt"
        />

        <button
          style={{ marginRight: '10px' }}
          type="submit"
          onClick={getFileData1}
        >
          Fetch Data or Refresh Data
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
        <button
          style={{ marginRight: '10px' }}
          type="submit"
          onClick={clearData}
        >
          Clear Data
        </button>
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
          <Link to="/logDataNewProtocol">
            <FontAwesomeIcon
              icon={faDatabase}
              size="1.5x"
              style={iconStyle}
              title="Log Data New Protocol"
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
          <Link to="/SetDataFormat">
            <FontAwesomeIcon
              icon={faClipboard}
              size="1.5x"
              style={iconStyle}
              title="Set Data Format"
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
        <button style={{ marginLeft: '2px' }}>
          <Link to="/logDataDetail">
            <FontAwesomeIcon
              icon={faInfoCircle}
              size="1.5x"
              style={iconStyle}
              title="Log Data in Detail"
            />
          </Link>
        </button>
        {/* <button>
          <Link to="/ApiData">API Data</Link>
        </button>
        <button>
          <Link to="/CLIData">CLI Data</Link>
        </button>
        <button>
          <Link to="/SetDataFormat">SET Data </Link>
        </button> */}

        <br />

        {/* Adding logic for conversion  */}
        <div>
        <textarea
        rows="5 "
          cols="10000"
        id="inputText"
        value={text}  // Set the value of textarea to the state value
        onChange={handleChangeText}  // Call handleChange when the user types
        placeholder="Enter text here..."
        style={{
            width: '95%',
            padding: '0px',
            marginBottom: '1px',
            fontFamily: 'monospace',
            marginLeft: '10px',
            overflowX: 'auto',  // Enables horizontal scrolling
            overflowY: 'hidden', // Prevents vertical scrolling (adjust as needed)
            whiteSpace: 'nowrap', // Ensures text stays in a single line
            resize: 'none' // Prevents manual resizing
          }}
      ></textarea>
      </div>
        <input
          type="text"
          style={{ marginRight: '10px', marginLeft: '500px'  }}
          placeholder="Conversion Text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {result}
        <button
          onClick={clearConversionText}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'red',
            color: 'white',
          }}
        >
          Clear
        </button>
        <input
          type="number"
          style={{ marginLeft: '0px', marginRight: '10px' }}
          placeholder="Colored text Start Value"
          value={start}
          onChange={(e) => setStart(parseInt(e.target.value))}
        />
        <input
          type="number"
          style={{ marginLeft: '0px', marginRight: '10px' }}
          placeholder="Colored text End Value"
          value={end}
          onChange={(e) => setEnd(parseInt(e.target.value))}
        />

        <br />
        <button
          onClick={splitHex}
          style={{
            marginLeft: '300px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Split Hex{' '}
        </button>
        <button
          onClick={reverseData}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Reverse{' '}
        </button>

        <button
          onClick={convertToDecimal}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Decimal{' '}
        </button>
        <button
          onClick={convertToDecimalReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          ~Decimal{' '}
        </button>
        <button
          onClick={ConvertToBinary}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Binary{' '}
        </button>
        <button
          onClick={ConvertToBinaryReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          ~Binary{' '}
        </button>
        <button
          onClick={Dictionary_data}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Dictionary{' '}
        </button>
        <button
          onClick={Display_units}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Display Units{' '}
        </button>
        <button
          onClick={Display_time}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Time{' '}
        </button>
        <button
          onClick={NoOfCharacters}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          No. of Characters{' '}
        </button>
        <button
          onClick={NoOfWords}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          No. of Words{' '}
        </button>
        <button
          onClick={checksum}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Checksum{' '}
        </button>
        
        <br />
        <button
          onClick={convertToHex}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#FF5c26',
            color: 'white',
          }}
        >
          Hex-ASCII
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
          ~Hex-ASCII
        </button>

        <button
          onClick={convertTofloat}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          Hex_1b_uInt{' '}
        </button>
        <button
          onClick={convertTofloat2}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          Hex_1b_Int{' '}
        </button>

        <button
          onClick={convertTofloattwoByte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Hex_4b-Float{' '}
        </button>
        <button
          onClick={convertTofloattwoByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          ~Hex_4b-Float{' '}
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
          Hex_2b-uInt{' '}
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
          ~Hex_2b-uInt
        </button>
        <button
          onClick={convertToInt4Byte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Hex_4b-uInt{' '}
        </button>
        <button
          onClick={convertToInt4ByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          ~Hex_4b-uInt{' '}
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
          Hex_2b-Int{' '}
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
          ~Hex_2b-Int
        </button>
        <button
          onClick={signedconvertToInt4Byte}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          Hex_4b-Int{' '}
        </button>
        <button
          onClick={signedconvertToInt4ByteReverse}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: 'green',
            color: 'white',
          }}
        >
          ~Hex_4b-Int{' '}
        </button>
        <button
          onClick={convertHexToDouble}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          Hex_8b-Int{' '}
        </button>
        <button
          onClick={reverseconvertHexToDouble}
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            background: '#3366ff',
            color: 'white',
          }}
        >
          ~Hex_8b-Int{' '}
        </button>
        <br />
      </div>

      <div style={{ 
  position: 'fixed',
  marginRight: '8px',
  top: '180px', // Keeps it fixed at a certain point from top
  width: '100%',
  color: 'white',
  backgroundColor: '#f1f1f1',
  fontFamily: 'monospace',
  whiteSpace: 'nowrap', // Prevents wrapping inside the div
  overflowX: 'auto', // Enables horizontal scrolling
  overflowY: 'auto', // Enables vertical scrolling
  height: '650px', // Limits the height for vertical scrolling
  padding: '5px'
}}>

  <p style={{ 
    color: 'red', 
    fontFamily: 'monospace', 
    fontWeight: 'bold',
    margin: 0, 
    padding: '5px',
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
    padding: '5px',
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


  {/* <div style={{ 
    display: 'inline-block', 
    color: 'black', 
    fontFamily: 'monospace', 
    padding: '5px',
    width: '100%' // Ensures the div takes full width for horizontal scrolling
  }}> */}
    {text.split("\n").map((line, index) => (
      <div key={index} style={{ whiteSpace: 'nowrap', padding: '5px', color: 'black' }}>
        {/* Each line will display in a separate div */}
        {line.startsWith("Tx") && <br />}
        {start > 0 && end > 0
          ? applyColorToText(line)
          : addRedColorToCharacters(line)}
      </div>
    ))}
  {/* </div> */}
  <div style={{ 
    display: 'inline-block', 
    color: 'black', 
    fontFamily: 'monospace', 
    padding: '5px',
    width: '100%' // Ensures the div takes full width for horizontal scrolling
  }}>
  <pre style={{ textAlign: 'left', padding: '22px 7px', whiteSpace: 'pre' }}>
    {[...Array(7)].map((_, index) => (
      <br key={index} />
    ))}
    {data.split('\n').map((line, index) => (
      <div key={index} style={{ display: 'inline-block' }}>
        {line.startsWith('Tx') && <br />}
        {start > 0 && end > 0
          ? applyColorToText(line)
          : addRedColorToCharacters(line)}
      </div>
    ))}
  </pre>
</div>

</div>








    </div>
  );
}

export default LogDataNewProtocol;
