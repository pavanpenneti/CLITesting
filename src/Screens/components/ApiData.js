import React, { useState, useEffect} from 'react';
import axios from 'axios';
import {CustomTable,CustomTable1, OATable, SpectrumTable} from '../../buttonscreen/CustomTable';
import styles from "../../css/CustomTable.module.css";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faTerminal, faClipboard, faCalendarAlt, faNetworkWired, faSyncAlt, faLaptop, faPaperPlane, faEye, faEyeSlash  } from "@fortawesome/free-solid-svg-icons";

function FetchData() {
  const [data, setData] = useState({});
  const [data1, setData1] = useState([{},{},{},{},{}]);
   const [data3, setData3] = useState([{},{},{}]);
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([],[]);
  const [data6, setData6] = useState([]);
  const [data7, setData7] = useState({});
  const [data8, setData8] = useState([]);
  const [data9, setData9] = useState([]);
  const [data10, setData10] = useState([]);
  const [data11, setData11] = useState([]);
  const [data12, setData12] = useState([],[]);
  const [data13, setData13] = useState({});
  const [isVisible] = useState(true);
  const [ipAddress, setIpAddress] = useState('');
  const [serialNo, setSerialNo] = useState("");
  const ipaddress =`http://${ipAddress}`;
  const serialno= serialNo;
  const [timestamp, setTimestamp] = useState(new Date());
  const [inputData, setInputData] = useState('');
    const [cardType, setCardType] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [showResponse, setShowResponse] = useState(false); 
    const iconStyle = { color: "green" };
    const formattedTimestamp = timestamp
    .toLocaleString('en-IN', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).replace(/(\d+:\d+:\d+)( [ap]m)/, '$1 PM');
    
  const getUSBDevices= async () =>{
    try{
    const response =await axios.get(`${ipaddress}/getusbdevices`)
    setData4(response.data);}
    catch(e){
      alert(`If IP Address entered is correct \nPlease check whether Server or Internet/VPN is connected and try again`);
    }
  } 

  const refresh = async () => {
    if (serialNo.startsWith("MB") || serialNo.startsWith("BLE") || serialNo.startsWith("XPR") || serialNo.startsWith("FM")) {
    try {
       
      const [response1, response2,response3] = await Promise.all([
        axios.get(`${ipaddress}/getcmsslotinfo?ipaddress=${serialno}&slotno=1&subslotno=0`),
        // axios.get(`${ipaddress}/getamplifierprofiles?ipaddress=${serialno}&slotno=1`),
        //axios.get(`${ipaddress}/getactivitylog?ipaddress=${serialno}&slotno=1`)
      ]);
      
      setData(response1.data);
      // setData1(response2.data);
      // setData3(response3.data);
      console.log(data3)
      setTimestamp(new Date());
    } catch (error) { 
      console.error(error);
    } }
    else{
      const response1 =await axios.get(`${ipaddress}/getcmsslotinfo?ipaddress=${serialno}&slotno=1&subslotno=0`)
      console.log(response1.data)
        setData9(response1.data);
    }
  };

  const handleInputChange = (e) => {
    setInputData(e.target.value);
};

// Update card type whenever the user types in the card type textbox
const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
};

// Function to send POST request with inputData and cardType included
const postData = async () => {
      try {
        const response = await axios.post(`http://${ipAddress}/setcmsdata?deviceid=${serialno}&cardtype=${cardType}&slotno=1&data=${inputData}`);
        setResponseData(response.data);
        setShowResponse(true);
        setTimestamp(new Date());
    } catch (error) {
        console.error('Error posting data:', error);
    }
};
const toggleResponseVisibility = () => {
  setShowResponse(prev => !prev);  // Toggle visibility of response
};

  useEffect(() => {
    // Update timestamp once when the component mounts
    //setTimestamp(new Date());
  }, []); 

   const  handleSelectChange = (event) => {
    const newValue = event.target.value;
    setSerialNo(newValue);   
    console.log(newValue);
  };

  const dspowerlevels = async () => { 
    try {
      const response = await fetch(`${ipaddress}/powerLevelStatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=DS`); // Replace <API_ENDPOINT> with the actual API endpoint
      const jsonData = await response.json();
      const firstFiveEntries = Object.entries(jsonData).slice(0, 6);
      const formattedData = firstFiveEntries.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      setData10(formattedData);
      setTimestamp(new Date());
    }catch (error) { 
      console.error(error);
     
  }}

  const uspowerlevels = async () => { 
    try {
      const response = await fetch(`${ipaddress}/powerLevelStatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=US`); // Replace <API_ENDPOINT> with the actual API endpoint
      const jsonData = await response.json();
      const firstEntries = Object.entries(jsonData).slice(0, 2);
      const formattedData = firstEntries.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      setData11(formattedData);
      setTimestamp(new Date());
    }catch (error) { 
      console.error(error);
     
  }}

  const usSpectrumData = async () => { 
    try {
      const response = await fetch(`${ipaddress}/getdnspectstatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=US&strtFreqncy=10`); // Replace <API_ENDPOINT> with the actual API endpoint
      const jsonData = await response.json();
      const extractedData1 = jsonData[0]; 
        setData8([extractedData1]);
        
      const extractedData = jsonData[1];
      setData6(Object.keys(extractedData).map((key) => extractedData[key]));
      console.log(data8)
    }catch (error) { 
      console.error(error);
     
  }}

   const  dsSpectrumData =  async () => {
    try {
    const response = await fetch(`${ipaddress}/getdnspectstatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=DS&strtFreqncy=10`); // Replace <API_ENDPOINT> with the actual API endpoint
    const jsonData = await response.json(); 
    const extractedData1 = jsonData[0]; 
        setData7([extractedData1]);
        console.log(data7)
    const extractedData = jsonData[1]; 
    setData5(Object.keys(extractedData).map((key) => extractedData[key]));
      }   catch (error) { 
      console.error(error);
    } }

    const  dsInputSpectrumData =  async () => {
      try {
      const response = await fetch(`${ipaddress}/getdnspectstatus?ipaddress=${serialno}&slotno=1&subslotno=0&stream=DSIN&strtFreqncy=10`); // Replace <API_ENDPOINT> with the actual API endpoint
      const jsonData = await response.json(); 
      const extractedData1 = jsonData[0]; 
          setData13([extractedData1]);
          console.log(data7)
      const extractedData = jsonData[1]; 
      setData12(Object.keys(extractedData).map((key) => extractedData[key]));
        }   catch (error) { 
        console.error(error);
      } }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (ipAddress && serialNo) {
      console.log(`Submitting form with IP address: ${ipAddress} and serial number: ${serialNo}`);
    }
  }
  const data2 = data1.map(item =>{return {...item}})
  const keys = [
    { startKey: "siCardType", endKey: "siHardwareRev1" },
    { startKey: "siHardwareRev1", endKey: "byStatus" },
    { startKey: "byStatus", endKey: "supportStatus" },    
    { startKey: "supportStatus", endKey: "bIsModuleID" },
    { startKey: "bIsModuleID", endKey: "alarm_summary" },
    { startKey: "byScrtchpadStatus", endKey: "bySerModStatus" },
    { startKey: "bySerModStatus", endKey: "bySysStatus" },
    { startKey: "bySysStatus", endKey: "byAmpStatus" },
    { startKey: "byAmpStatus", endKey: "byAlmStatus" },
    { startKey: "byAlmStatus", endKey: "byAlmThresStatus" },

    { startKey: "byAlmThresStatus", endKey: "byTranspOnlineStatus" },
    { startKey: "byTranspOnlineStatus", endKey: "byNameType" },
    { startKey: "byNameType", endKey: "byDsAGCMode" },
    { startKey: "byDsAGCMode", endKey: "byAlmThresholdStatus"  },
    { startKey: "byAlmThresholdStatus", endKey: "byLocaltimeStatus" },
    { startKey: "byLocaltimeStatus", endKey: "byActivityLogStatus" },
    { startKey: "byActivityLogStatus", endKey: "bySpecStatus" },
    { startKey: "bySpecStatus", endKey: "byNodeIdAmplifIdStatus" },
    { startKey: "byNodeIdAmplifIdStatus", endKey: "byAddrsStatus" },
    { startKey: "byAddrsStatus", endKey: "byPwrLvlStatus" },

    { startKey: "byPwrLvlStatus", endKey: "byAlmProfStatus" },
    { startKey: "byAlmProfStatus", endKey: "bySysStat" },
    { startKey: "bySysStat", endKey: "bySetupRecStatus" },
    { startKey: "bySetupRecStatus", endKey: "siCardType" },
    { startKey: "byTransLocalTimeStatus", endKey: "byTransParmStatus" },
    { startKey: "byTransParmStatus", endKey: "byTranschannelPlanStatus" },
    { startKey: "byTranschannelPlanStatus", endKey: "byIAPStatus" },
    { startKey: "byTransMSStatus", endKey: "bypad" },
    { startKey: "bypad", endKey: "byTransStatus" },
    { startKey: "byTransStatus", endKey: "byTranscfgStatus" },

    { startKey: "byTranscfgStatus", endKey: "byTransLocalTimeStatus" },  
    { startKey: "byTranscfgStatus", endKey: "byCurChannelPlanNum" },
    { startKey: "byCurChannelPlanNum", endKey: "byTranschannelPlanNameStatus" },
    { startKey: "byTranschannelPlanNameStatus", endKey: "byIAPStatus" },
    	
    
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
for (let index = 0; index < 34; index++) {
  result1.push(results(data, keys[index].startKey, keys[index].endKey));
}
const result2 = [];
for (let index = 0; index < 5; index++) {
  result2.push(results1(data2[index], keys1[0].startKey, keys1[0].endKey));
}

const tables= [
  {"title":"0x10", "data":result1[0]},
  {"title":"0x41", "data":result1[1]},
  {"title":"0x45", "data":result1[2]},
  {"title":"0x48", "data":result1[3]},
  {"title":"Extra Fields", "data":result1[4]},
  {"title":"0x1D", "data":result1[5]},
  {"title":"0x24", "data":result1[6]},
  {"title":"0x25", "data":result1[7]},
  {"title":"0x26", "data":result1[8]},
  {"title":"0x27", "data":result1[9]},
  {"title":"0x28", "data":result1[10]},
  {"title":"0x29", "data":result1[11]},
  {"title":"0x3B", "data":result1[12]},
  {"title":"0x2A", "data":result1[13]},
  {"title":"0x2B", "data":result1[14]},
  {"title":"0x2C", "data":result1[15]},
  {"title":"0x2D", "data":result1[16]},
  {"title":"0x2E", "data":result1[17]},
  {"title":"0x2F", "data":result1[18]},
  {"title":"0x38", "data":result1[19]},
  {"title":"0x39", "data":result1[20]},
  {"title":"0x30", "data":result1[21]},
  {"title":"0x3A", "data":result1[22]},
  {"title":"0x3C", "data":result1[23]},

  {"title":"0x11", "data":result1[24]},
  {"title":"0x12", "data":result1[25]},
  {"title":"0x13", "data":result1[26]},
  {"title":"0x20", "data":result1[27]},
  {"title":"0x21", "data":result1[28]},
  {"title":"0x22", "data":result1[29]},
  {"title":"0x23", "data":result1[30]},
  {"title":"0x23_MB", "data":result1[31]},
  {"title":"0x12_MB", "data":result1[32]},
  {"title":"0x13_MB", "data":result1[33]},

  
]

const tables1 =[ ]
// for tables1 currently removed from tables1
// {"title":" ---- ", "data":result2[0]},
// {"title":" --->", "data":result2[1]},
// {"title":"Profile Data(0x17, 0x19, 0x1C)", "data":result2[2]},
// {"title":" <---", "data":result2[3]},
// {"title":" ----", "data":result2[4]},

//OA Module Related 
function getNonObjectProperties(obj) {
  return Object.entries(obj)
    .filter(([_, value]) => typeof value !== "object")
    .reduce((acc, [key, value]) => {
     
      acc[key] = value;
      return acc;
    }, {});
}

const skey2 = getNonObjectProperties(data9)

const signalProperties = data9.signals ? Object.entries(data9.signals[0]) : [];
const signalProperties1 = data9.Splmnufsignals?Object.entries(data9.Splmnufsignals[4]) : [];
const signalProperties2 = data9.Spldbgsignals?Object.entries(data9.Spldbgsignals[8]) : [];

const dtTables = ["0x3D", 	"0x57", 	"0x3F", 	"0x3A", 	"0x5B_0", 	"0x5B_1", 	"0x5B_2", 	"0x5C_0", 	"0x5C_1", 	"0x5C_2", 	"0x5C_3", 	"0x5C_4", 	"0x5C_5", 	"0x48", 	"0x32", 	"0x21", 	"0x27", 	"0x20", 	"0x38", 	"0x50-1", 	"0x50-2", 	"0x50-3", 	"0x3E-1", 	"0x3E-2", 	"0x26", 	"0x25", 	"0x18-C0", 	"0x18-5C",  ]
const spldtTables=["bandwidth", 	"opMode50", 	"opMode100", 	"opMode200", 	"rfselection", ]
const renderTableRows = () => {
  if (Object.keys(data9).length > 0) {
    return dtTables.map(tableKey => (
      <tr key={tableKey}>
        <th colSpan="12" align="left">{tableKey}</th>
        {data9[tableKey] && Object.entries(data9[tableKey]).map(([key, value]) => (
          <tr key={key}>
            <td>
              {key}:
            </td>
            <td>
              {value}
            </td>
          </tr>
        ))}
      </tr>
    ));
  }
  return null; // Render nothing if data9 is empty
};
const rendersplTableRows = () => {
  if (Object.keys(data9).length > 0) {
    return spldtTables.map((key) => (
      data9[key].map((item, index) => (
        <tr key={`${key}_${index}`}>
          {index === 0 && (
            <th colSpan="12" align="left" rowSpan={data9[key].length}>
              {key}
            </th>
          )}
          <td>{item.name}</td>
          <td>{item.value}</td>
        </tr>
      ))
    ));
  }
  return null;
};

  return (  
    <div>
    <div style={{backgroundColor:"#D8DAE3"}}>
    
       <form onSubmit={handleSubmit} style={{paddingLeft:'10px',position: 'fixed', zIndex:1, backgroundColor:"#D8DAE3", width: '100%',  }}>
      
       <datalist id="ipAddresss">
       <option value="10.27.105.99"/>
          <option value="192.168.1.170" />
          <option value="192.168.1.219" />
          <option value="192.168.20.1"/>
          
        </datalist>
        <input type="text" style={{marginLeft:"300px"}} placeholder="Enter IP Address" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} list= "ipAddresss"/>
       
      <button
      type="submit"
      onClick={getUSBDevices}
      style={{marginLeft:"2px"}}
    >
      <FontAwesomeIcon icon={faLaptop} style={iconStyle} title="GET Devices" />
     
    </button>
      {/* <button type="submit" onClick={getUSBDevices}>Get Devices</button>
      
      {"  "}   */}
      <select value={serialNo} onChange={handleSelectChange} style={{marginLeft:"2px"}}>
      <option selected >select device</option>
        {data4.map((item,index) => (         
          <option key={index} value={item.data.usbaddress}>
            {item.data.usbaddress}
          </option>
        ))}
      </select>
      {"  "}  
     
       {/* <button type="submit" onClick={refresh} >Get Info</button>{"  "}  
       <button type="submit" onClick={refresh} >Refresh</button>  {"  "}  */}
       

      {/* Refresh Button */}
      <button type="submit" onClick={refresh} style={{iconStyle}}>
        <FontAwesomeIcon icon={faSyncAlt} style={iconStyle} title="GET/Refresh data"/>
       
      </button>
       
       {/* <button>
        <Link to="/LogData">Log Data</Link>
      </button>
      <button>
        <Link to="/CLIData">CLI Data</Link>
      </button>
      
      <button>
        <Link to="/SetDataFormat">SET Data </Link>
      </button>
      <button   >
        <Link to="/dailyReport">Daily Report </Link>
      </button>
      <button  >
        <Link to="/snm
        pData">SNMP Data </Link>
      </button> */}
   
      <button style={{marginLeft:"2px"}}>
        <Link to="/LogData">
          <FontAwesomeIcon icon={faFileAlt} size="1.5x" style={iconStyle} title="Log Data" />
        </Link>
      </button>
      <button style={{marginLeft:"2px"}}>
        <Link to="/CLIData">
          <FontAwesomeIcon icon={faTerminal} size="1.5x" style={iconStyle} title="CLI Data" />
        </Link>
      </button>
      <button style={{marginLeft:"2px"}}>
        <Link to="/SetDataFormat">
          <FontAwesomeIcon icon={faClipboard} size="1.5x" style={iconStyle} title="Set Data Format" />
        </Link>
      </button>
      <button style={{marginLeft:"2px"}}>
        <Link to="/dailyReport">
          <FontAwesomeIcon icon={faCalendarAlt} size="1.5x" style={iconStyle} title="Daily Report" />
        </Link>
      </button>
      <button style={{marginLeft:"2px", marginRight:"2px"}}>
        <Link to="/diagnosticstool">
          <FontAwesomeIcon icon={faNetworkWired} size="1.5x" style={iconStyle} title="Diagnostics Tool" />
        </Link>
      </button>
 
      <input 
                type="text" 
                value={inputData} 
                onChange={handleInputChange} 
                placeholder="Enter data"
                title='Ex: [{"key": "byIAPCtrl", "value": "1"}, {"key": "byIAPtoAssign", "value": "2"}]'
                style={{marginLeft:"2px"}}
            />
            <input 
                type="text" 
                value={cardType} 
                onChange={handleCardTypeChange} 
                placeholder="CardType"
                style={{width: "60px", marginLeft:'2px'}}
                title='Ex: 67, 42 ...'
            />
            {/* <button onClick={postData} >Submit</button> */}
            <button
      onClick={postData}
      style={{
       iconStyle,
       marginLeft:'2px'
      }}
    >
      <FontAwesomeIcon icon={faPaperPlane} style={iconStyle} title="Post Data"/>
      
    </button >
            {/* <button onClick={toggleResponseVisibility}>
                {showResponse ? 'Hide Response' : 'Show Response'}
            </button> */}
             <button onClick={toggleResponseVisibility} style={{marginLeft:"2px"}}>
      <FontAwesomeIcon
        icon={showResponse ? faEyeSlash : faEye}
        style={iconStyle}
        title={showResponse ? "Hide Response" : "Show Response"}
      />
      
    </button>
            {showResponse && responseData && (
                <div>
                    <h3>Response:</h3>
                    <pre>{JSON.stringify(responseData, null, 2)}</pre>
                </div>
            )}
            
      {/* {timestamp.toLocaleString('en-IN', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).replace(/(\d+:\d+:\d+)( [ap]m)/, '$1 PM')} */}
      <span style={{color: "green", fontSize: "12px", marginLeft:"20%"}}>{formattedTimestamp}</span>
      {isVisible && (serialNo.startsWith("MB") || serialNo.startsWith("BLE") || serialNo.startsWith("XPR")) &&
       <div style={{marginLeft: '350px'}}>
       <button type="submit" onClick={dsSpectrumData} >DS Spectrum Data</button> 
       <button type="submit" onClick={dsInputSpectrumData} >DS Input Spectrum Data</button> 
       <button type="submit" onClick={usSpectrumData} >US Spectrum Data</button>  
       <button type="submit" onClick={dspowerlevels} >DS Power Levels</button> 
       <button type="submit" onClick={uspowerlevels} >US Power Levels</button> </div>}

         </form>

         {/* DR Data  */}
         {isVisible && (serialNo.startsWith("DR") ) &&
          <div style={{position: 'relative', top:'25px'}}>
          {Object.keys(skey2).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{skey2[key].toString()}</td>
              </tr>
            ))}</div>}


      
             {/* DT Data  */}
         {isVisible && (serialNo.startsWith("DT") ) &&
          <div style={{position: 'relative', top:'25px'}}>
          {Object.keys(skey2).map(key => (
              <tr key={key}>
                <td   colSpan="12" align='left' >{key}</td>
                <td >{skey2[key].toString()}</td>
              </tr>
            ))}
            <br/>
            
            {renderTableRows()}
            {rendersplTableRows()}
   
            <br/>
    
  </div>}

{/* OA Data */}
        {isVisible && serialNo.startsWith("OA") &&
          <div style={{position: 'relative', top:'25px',alignItems:'baseline', border:"1px solid black" }}>
            <table>
              <tr style={{border: '1px solid black'}}>
                <td >
                {Object.keys(skey2).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{skey2[key]}</td>
              </tr>
            ))} 
                </td>
                <td style={{ textAlign: 'left',verticalAlign: 'top'}}>
                <b style={{textAlign:'center'}}>(0x2C Info)</b><br/>
                {(Object.keys(data9).length>0 )  && Object.keys(data9["0x2C"]).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{data9["0x2C"][key]}</td>
              </tr>
            ))}
                </td>
                <td style={{textAlign: 'left',verticalAlign: 'top'}}>
              <b>Node Info(0x21)</b><br/>
             {(Object.keys(data9).length>0 )  && Object.keys(data9["Node_Info"]).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{data9["Node_Info"][key]}</td>
              </tr>
            ))}
              </td>
              <td style={{ textAlign: 'left',verticalAlign: 'top'}}>
              <b>MCU Info(0x26)</b><br/>
            {(Object.keys(data9).length>0 )  && Object.keys(data9["Mcu_Info"]).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{data9["Mcu_Info"][key]}</td>
              </tr>
            ))}
              </td>
              <td style={{ textAlign: 'left',verticalAlign: 'top'}}>
              <b>Advanced Diagnostics(0x28)</b><br/>
            {(Object.keys(data9).length>0 )  && Object.keys(data9["Ingress_Info"]).map(key => (
              <tr key={key}>
                <td colSpan="12" align='left' >{key}</td>
                <td>{data9["Ingress_Info"][key]}</td>
              </tr>
            ))}
              </td>
              </tr>
             
            </table>

      <OATable property={signalProperties} data={data9.signals} title={"I2C Signals"}/>
      <OATable property={signalProperties1} data={data9.Splmnufsignals} title={"Manufacturing Signals"}/>
      <OATable property={signalProperties2} data={data9.Spldbgsignals} title={"Debug Signals"}/>
        </div>}

{/* MB Display Data */}
        {isVisible && (serialNo.startsWith("MB") || serialNo.startsWith("BLE") || serialNo.startsWith("XPR") || serialNo.startsWith("FM")) &&
        <div style={{position: 'relative', top:'55px'}}>
          
        {(Object.keys(data).length>0 )  && <div className={styles.tables} style={{alignItems:'baseline', border:"1px solid black" }}>   
        {<div className={styles.tables1} style={{alignItems:'baseline, border:"1px solid black'}}>
                <CustomTable title={"DS PWR Lvls(0x39)"} data={data10}/>
                <CustomTable title={"US PWR Lvls(0x39)"} data={data11}/>
                
          </div> } 
            {tables.map((data) => (
              
                <CustomTable className={styles.table} title={data.title} data={data.data}/>
              ))   }     
              {tables1.map((data) => (
                <CustomTable1 className={styles.table} title={data.title} data={data.data}/>
              ))   }        
          </div>}

          {<div className={styles.tables1} style={{alignItems:'baseline, border:"1px solid black'}}>
                <SpectrumTable title={"Downstream Output Graph"} data={data5}/>
                <SpectrumTable title={"Downstream Input Graph"} data={data12}/>
                <SpectrumTable title={"Upstream Graph"} data={data6}/>
                
          </div> } 
        
        </div>
}
     </div>
     </div>
  );




}




export default FetchData;