import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LogData() {
    const [data, setData] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    
    const path =`http://${ipAddress}:5232`;
  
    const [filedata, setFiledata] = useState("");
    // useEffect(() => {
    //     getFileData1();
    // }, []);
    // const urlEncodedPath = encodeURIComponent(filedata.replace(/\\/g, '%5C'));
    const getFileData1= async () => {
        try {
            const response = await axios.get(`${path}/getlogdata?filename=${filedata}`);
            const data_remove = response.data.replace(/<[^>]*>/g, '');
            setData(data_remove)
        } catch (error) {
            console.error('Error fetching file data:', error);
        }
    };
    const clearData = async ()=>{
        try {
            const response = await axios.get(`${path}/clearlogdata?filename=${filedata}`);
            const data_remove = response.data.replace(/<[^>]*>/g, '');
            setData(data_remove)
            
        } catch (error) {
            console.error('Error fetching file data:', error);
        }
    }
    const searchData = async ()=>{
        
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
        var x = 3;
        characters[(x-1)*3+19] = <span key={(x-1)*3+19} style={{ color: 'red' }}>{characters[(x-1)*3+19]}</span>;
        characters[(x-1)*3+20] = <span key={(x-1)*3+20} style={{ color: 'red' }}>{characters[(x-1)*3+20]}</span>;
        return characters;
    };

    

    return (
        <div>
        <div style={{
            position: 'fixed',
            padding: '2px 0',
            width: '100%',
            color: 'black',
            top:0,
            marginLeft:'300px',
            backgroundColor: '#f1f1f1'}}>
                 <label>
         
        <input type="text" style={{ margin: "1px" }}  placeholder="Enter IP Address" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
        {"                                                  "}
      </label>
            
            <input
                type="text"
                style={{ marginRight: "10px" }} 
                placeholder="Enter file path"
                value={filedata}
                onChange={(e) => setFiledata(e.target.value)}
            />
            <button style={{ marginRight: "10px" }} type="submit" onClick={getFileData1}>Fetch Data or Refresh Data</button>
           
            <input
                    type="text"
                    style={{ marginRight: "10px" }}
                    placeholder="Search by Message Type"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    
                />
                <button style={{ marginRight: "10px" }} onClick ={searchData}>Search by Message Type</button>
                <button style={{ marginRight: "10px" }} type="submit" onClick={clearData}>Clear Data</button>
                <button>
        <Link to="/ApiData">API Data</Link>
      </button>
      <button>
        <Link to="/CLIData">CLI Data</Link>
      </button>
                </div>
            
                <div style={{
                    position: 'fixed',
                    marginRight:"8px",
                    top: 25,
                    width: '100%',
                    color: 'white',
                    backgroundColor: '#f1f1f1',
                    padding: '1px 0'
                }}>
                    <p1 style={{ color: 'red', fontFamily: 'monospace' }}>
                        <b>::::::::::::::::::::01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63</b>
                    </p1>
                </div>
                <pre style={{ textAlign: 'left', padding: '22px 7px'}}>
                    {data.split('\n').map((line, index) => (
                        <div key={index}>
                            
                            {line.startsWith("Tx") && <br />}
                            {addRedColorToCharacters(line)}
                        </div>
                    ))}
                    
                </pre>
            
        
        </div>
    );
}

export default LogData;
