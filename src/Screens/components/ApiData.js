import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {CustomTable, ActivitylogTable, CustomTable1, SpectrumTable, SpectrumTable1} from '../../buttonscreen/CustomTable';
import styles from "../../css/CustomTable.module.css";
import { Link } from 'react-router-dom';

export default FetchData;

function FetchData() {
  const [data, setData] = useState({});
  const [data1, setData1] = useState([{},{},{},{},{}]);
   const [data3, setData3] = useState([{},{},{}]);
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([],[]);
  const [data6, setData6] = useState([]);
  const [data7, setData7] = useState({});
  const [data8, setData8] = useState([]);
  
  const [ipAddress, setIpAddress] = useState('');
  const [serialNo, setSerialNo] = useState("");
  const ipaddress =`http://${ipAddress}`;
  const serialno= serialNo;
  const getUSBDevices= async () =>{
    const response =await axios.get(`${ipaddress}/getusbdevices`)
    setData4(response.data);
  } 
  const refresh = async () => {
    
    try {
      const [response1, response2,response3] = await Promise.all([
        axios.get(`${ipaddress}/getcmsslotinfo?ipaddress=${serialno}&slotno=1&subslotno=0`),
        axios.get(`${ipaddress}/getamplifierprofiles?ipaddress=${serialno}&slotno=1`),
        axios.get(`${ipaddress}/getactivitylog?ipaddress=${serialno}&slotno=1`)
      ]);
      setData(response1.data);
      setData1(response2.data);
      setData3(response3.data);
    } catch (error) { 
      console.error(error);
    } 
  };
   const  handleSelectChange = (event) => {

    const newValue = event.target.value;
    setSerialNo(newValue);   
   
    console.log(newValue);
  };
  const usSpectrumData = async () => { 
    try {
      const response = await fetch(`${ipaddress}/getdnspectstatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=US&strtFreqncy=10`); // Replace <API_ENDPOINT> with the actual API endpoint
      const jsonData = await response.json();
      const extractedData1 = jsonData[0]; // Assuming the data you want to retrieve is at index 0
        setData8([extractedData1]);
        
      const extractedData = jsonData[1]; // Assuming the data you want to retrieve is at index 1
      setData6(Object.keys(extractedData).map((key) => extractedData[key]));
    }catch (error) { 
      console.error(error);
     
  }}
   const  dsSpectrumData =  async () => {
    // Your data retrieval logic here
    try {
    const response = await fetch(`${ipaddress}/getdnspectstatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=DS&strtFreqncy=10`); // Replace <API_ENDPOINT> with the actual API endpoint
    const jsonData = await response.json(); 
    const extractedData1 = jsonData[0]; // Assuming the data you want to retrieve is at index 0
        setData7([extractedData1]);
    const extractedData = jsonData[1]; // Assuming the data you want to retrieve is at index 1
    setData5(Object.keys(extractedData).map((key) => extractedData[key]));
      }   catch (error) { 
      console.error(error);
    } }
  
 
 
  const handleSubmit = (event) => {
    event.preventDefault();
    // Prevent default form submission behavior

    // Perform validation on IP address and serial number
    if (ipAddress && serialNo) {
      // Submit form data to server
      console.log(`Submitting form with IP address: ${ipAddress} and serial number: ${serialNo}`);
    }
  }
  const data2 = data1.map(item =>{return {...item}})
  const keys = [
    { startKey: "byScrtchpadStatus", endKey: "bySysStatus" },
    { startKey: "bySysStatus", endKey: "byAmpStatus" },
    { startKey: "byAmpStatus", endKey: "byAlmStatus" },
    { startKey: "byAlmStatus", endKey: "byAlmThresStatus" },
    { startKey: "byAlmThresStatus", endKey: "byTranspOnlineStatus" },
    { startKey: "byTranspOnlineStatus", endKey: "byDsAGCMode" },
    { startKey: "byDsAGCMode", endKey: "byAlmThresholdStatus"  },
    { startKey: "byAlmThresholdStatus", endKey: "byLocaltimeStatus" },
    { startKey: "byLocaltimeStatus", endKey: "byActivityLogStatus" },
    { startKey: "byActivityLogStatus", endKey: "bySpecStatus" },
    { startKey: "bySpecStatus", endKey: "byNodeIdAmplifIdStatus" },
    { startKey: "byNodeIdAmplifIdStatus", endKey: "byPwrLvlStatus" },
    { startKey: "byPwrLvlStatus", endKey: "siCardType" },
  ];
 const keys1 =[{ startKey: "byIAPNum", endKey: "strIAPname" }]
 
 function results(data, startkey,endkey) {
  const obj= Object.fromEntries(
    Object.entries(data).slice(
      Object.keys(data).indexOf(startkey),
      Object.keys(data).indexOf(endkey) + 1
    ));
    return obj;
 }
 function results1(data, startkey,endkey) {
  const obj= Object.fromEntries(
    Object.entries(data).slice(
      Object.keys(data).indexOf(startkey),
      Object.keys(data).indexOf(endkey) + 1
    ));
    return obj;
 }
 
const result1 = [];
for (let index = 0; index < 13; index++) {
  result1.push(results(data, keys[index].startKey, keys[index].endKey));
}
const result2 = [];
for (let index = 0; index < 5; index++) {
  result2.push(results1(data2[index], keys1[0].startKey, keys1[0].endKey));
}
const tables= [
  {"title":"0x24, 0x1D", "data":result1[0]},
  {"title":"0x25", "data":result1[1]},
  {"title":"0x26", "data":result1[2]},
  {"title":"0x27", "data":result1[3]},
  {"title":"0x28", "data":result1[4]},
  {"title":"0x29", "data":result1[5]},
  {"title":"0x2A", "data":result1[6]},
  {"title":"0x2B", "data":result1[7]},
  {"title":"0x2C", "data":result1[8]},
  {"title":"0x2D", "data":result1[9]},
  {"title":"0x2E", "data":result1[10]},
  {"title":"0x2F", "data":result1[11]},
  {"title":"0x39", "data":result1[12]},

]
const tables1 =[  {"title":" ---- ", "data":result2[0]},
{"title":" --->", "data":result2[1]},
{"title":"Profile Data(0x17, 0x19, 0x1C)", "data":result2[2]},
{"title":" <---", "data":result2[3]},
{"title":" ----", "data":result2[4]},]

  return (  
    <div>
    <div style={{backgroundColor:"#D8DAE3"}}>
       <form onSubmit={handleSubmit} style={{marginLeft:'300px'}}>
       <label>
        IP address:{"  "}   
        <input type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
        {"                                                  "}
      </label>
      <button type="submit" onClick={getUSBDevices}>Get Devices</button>
      {"  "}  
      <select value={serialNo} onChange={handleSelectChange}>
      <option selected >select device</option>
        {data4.map((item,index) => (         
          <option key={index} value={item.data.usbaddress}>
            {item.data.usbaddress}
          </option>
        ))}
      </select>
      {"  "}  
       <button type="submit" onClick={refresh} >Get Info</button>{"  "}  
       <button type="submit" onClick={refresh} >Refresh</button>  {"  "} 
       <button type="submit" onClick={dsSpectrumData} >DS Spectrum Data</button>{"  "}  
       <button type="submit" onClick={usSpectrumData} >US Spectrum Data</button>   
       <button>
        <Link to="/LogData">Log Data</Link>
      </button>
      <button>
        <Link to="/CLIData">CLI Data</Link>
      </button>
         </form>
      {(Object.keys(data).length>0 )  && <div className={styles.tables} style={{alignItems:'baseline', border:"1px solid black" }}>
          
         {tables.map((data) => (
            <CustomTable className={styles.table} title={data.title} data={data.data}/>
          ))   }     
           {tables1.map((data) => (
            <CustomTable1 className={styles.table} title={data.title} data={data.data}/>
          ))   }  
            
            {/* <ActivitylogTable title="Activity Log" tableheading1="S.No." tableheading2 ="Activity Date"  activitydata={data5[1]}/>     */}
      </div>}
      {<div className={styles.tables1} style={{alignItems:'baseline'}}>
           {/* <CustomTable1  title = {"Downstream"} data={data7}/>  */}
             <SpectrumTable title={"Downstream Graph"} data={data5}/>
           {/* <CustomTable1  title = {"Upstream"} data={data8}/>  */}
            <SpectrumTable title={"Upstream Graph"} data={data6}/>
            
     </div>
     
}    


     </div>
     
     </div>
  );
}

