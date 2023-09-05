import React from 'react';
import styles from "../css/CustomTable.module.css";

function CustomTable({ title, data }) {
    return (
      <table  >
        <thead>
          <tr className={styles.tr}>
            <th colSpan="2" className={styles.th}>{title}</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys((data)).slice(0, -1).map(key => (
            <tr key={key}>
              <td>{key}</td>
              <td>{data[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  function CustomTable1({ title, data }) {
    return (
      <table  >
        <thead>
          <tr className={styles.tr}>
            <th colSpan="2" className={styles.th}>{title}</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys((data)).map(key => (
            <tr key={key}>
              <td>{key}</td>
              <td>{data[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
function ActivitylogTable({title,tableheading1,tableheading2,tableheading3,tableheading4,activitydata}){
    return (
    <table>
    <thead>
      <tr className={styles.tr}> 
        <td colSpan="5" style={{textAlign: "center"}}>{title}</td></tr>
      <tr>
        <th className={styles.th}>{tableheading1}</th>
        <th className={styles.th}>{tableheading2}</th>
        <th className={styles.th}>{tableheading3}</th>
        <th className={styles.th}>{tableheading4}</th>
      </tr>
    </thead>
    <tbody>
      {activitydata.map((data, index) => (
        <tr key={index}>
          <td>{data.byActivitySeqNumber}</td>
          <td>{data.ActivityDate}</td>
          <td>{data.ActivityTime}</td>
          <td>{data.ActivityEvent}</td>
        </tr>
      ))}
    </tbody>
  </table>)
}

function SpectrumTable({title, data}){
  return (<div>
   <div>   <table>
        <thead>
          
          <tr className={styles.tr}><td className={styles.th} colSpan={3} style={{textAlign: "center"}}>{title}</td></tr>
          <tr>
          <th style={{textAlign: "center"}}>Index</th>
            <th style={{textAlign: "center"}}>X-Coordinates</th>
            <th style={{textAlign: "center"}}>Y-Coordinates</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
                <td style={{textAlign: "center"}}>{index} </td>
              <td style={{textAlign: "center"}}>{item.x} MHz</td>
              <td style={{textAlign: "center"}}>{item.y} dBmV</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      </div>
 )
}











export  {CustomTable, CustomTable1, ActivitylogTable, SpectrumTable}