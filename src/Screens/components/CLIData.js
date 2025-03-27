import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faPaperPlane,
  faClipboard,
  faCalendarAlt,
  faNetworkWired,
  faDatabase,
  faLaptop,
} from '@fortawesome/free-solid-svg-icons';
function CLIData() {
  const [ipAddress, setIpAddress] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [input, setInput] = useState('');
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([]);
  const tableData = data5;
  const ipaddress = `https://${ipAddress}:5232`;
  const iconStyle = { color: 'green' };
  const getSerialPort1 = async () => {
    try {
      const response = await axios.get(`${ipaddress}/Read Ports`);
      setData4(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCLIData = async () => {
    try {
      const response = await axios.post(
        `${ipaddress}/Dynamic SET Commands?Command=${input}&portNo=${serialNo}`
      );
      setData5(response.data);
      console.log(data5);
    } catch (error) {
      console.error('POST Error:', error);
    }
  };
  const addPwdCLiData = async () => {
    try {
      const response = await axios.post(
        `${ipaddress}/Dynamic SET Commands?Command=24cs5z&portNo=${serialNo}`
      );
      setData5(response.data);
      console.log(data5);
    } catch (error) {
      console.error('POST Error:', error);
    }
  };

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    setSerialNo(newValue);
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
          backgroundColor: '#f1f1f1',
          zindex: -1,
          margin: '0 auto',
        }}
      >
        <label>
          <input
            type="text"
            style={{ marginLeft: '400px' }}
            placeholder="Enter IP Address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
          />

          {/* <button type="submit" style={{ margin: "5px" }}  onClick={getSerialPort1} >Get Ports</button> */}
          <button
            type="submit"
            onClick={getSerialPort1}
            style={{ iconStyle, marginLeft: '5px' }}
          >
            <FontAwesomeIcon
              icon={faLaptop}
              style={iconStyle}
              title="GET Devices"
            />
          </button>
        </label>
        <select
          value={serialNo}
          onChange={handleSelectChange}
          style={{ iconStyle, marginLeft: '5px' }}
        >
          <option selected>select device</option>

          {data4.map((item, index) => (
            <option key={index} value={item.port}>
              {`${item.devicename}(${item.port})`}
            </option>
          ))}
        </select>
        <input
          type="text"
          style={{ margin: '5px' }}
          placeholder="Enter Commands"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {/* <button type="submit" style={{ margin: "2px" }}  onClick={getCLIData} >Get Data</button> */}
        <button
          onClick={getCLIData}
          style={{
            iconStyle,
            marginLeft: '0.1px',
          }}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            style={iconStyle}
            title="Post and GET Data"
          />
        </button>
        {/* <button style={{ margin: "2px" }} > 
        <Link to="/ApiData">API Data</Link>
      </button>
      <button style={{ margin: "2px" }} >
        <Link to="/LogData">Log Data</Link>
      </button>
      <button>
        <Link to="/SetDataFormat">SET Data </Link>
      </button> */}
        <button
          style={{
            marginLeft: '10px',
          }}
        >
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
      </div>
      <div
        style={{
          padding: '2px 0',
          width: '100%',
          color: 'black',
          top: 45,
          backgroundColor: '',
        }}
      >
        <table style={{ margin: '0 auto' }}>
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => {
              const [command, description] = item.split(/\s{2,}/);
              return (
                <tr key={index}>
                  <td>{command} </td>
                  <td>{description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
    
      </div>
    </div>
  );
}

export default CLIData;
