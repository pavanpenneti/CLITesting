import React, { useState } from 'react';
import axios from 'axios';

function SnmpData() {
  const [ipAddress, setIpAddress] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [result, setResult] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        'http://10.27.104.60:5000/api/searchModel',
        {
          ipaddress: ipAddress,
        }
      );
      setResult(response.data.message);
    } catch (error) {
      console.error(error);
      setResult('Error retrieving model data');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter IP Address"
        value={ipAddress}
        onChange={(e) => setIpAddress(e.target.value)}
      />

      <button onClick={handleSearch}>Search Model</button>
      <p>{result}</p>
    </div>
  );
}

export default SnmpData;
