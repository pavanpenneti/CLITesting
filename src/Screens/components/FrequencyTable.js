import React, { useState, useEffect } from 'react';

const FrequencyTable = () => {
  const downlinkFrequencies = [8, 9, 10, 11, 202, 203, 204, 205]; // MHz values
  const uplinkFrequencies = [253, 254, 255, 256, 830, 831, 832, 833]; // MHz values
  const BW = 160000; // Bandwidth value

  // Function to generate frequencies based on a downlink start frequency
  const generateFrequencies = (downlinkStartFreq) => {
    return uplinkFrequencies.flatMap((usFreq) =>
      downlinkFrequencies.slice(0, 6).map((downlinkFreq, index) => {
        // Dynamically calculate downlink frequency based on the start frequency
        const downlinkFreqFinal = (
          downlinkStartFreq +
          0.1 +
          index * 0.16
        ).toFixed(2);

        // Calculate uplink frequency with offset
        const uplinkFreqFinal = (usFreq + 0.1 + 0.16 * index).toFixed(2);

        return {
          label: `${downlinkFreqFinal}/${uplinkFreqFinal}`,
          dsFreq: parseFloat(downlinkFreqFinal),
          usFreq: parseFloat(uplinkFreqFinal),
        };
      })
    );
  };

  // Store the frequencies in the state
  const [frequencies, setFrequencies] = useState([]);

  // Effect hook to generate frequencies on component mount
  useEffect(() => {
    const allFrequencies = downlinkFrequencies.flatMap((downlinkFreq) =>
      generateFrequencies(downlinkFreq)
    );
    setFrequencies(allFrequencies);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.paper}>
        <div style={styles.headers}>
          <span style={styles.headerItem}>Select FSK Channel</span>
          <span style={styles.headerItem}>Tx/Uplink</span>
          <span style={styles.headerItem}>Rx1/Downlink</span>
          <span style={styles.headerItem}>Rx2/Downlink</span>
        </div>
        {frequencies.map((freq, index) => {
          const txUplink = 900000000 - freq.dsFreq * 1000000;
          const rx1Downlink = freq.usFreq * 1000000; // Convert MHz to Hz
          // const rx2Downlink = rx1Downlink + BW; // Add BW for Rx2
          // Index of the first row in the current group of 6
          const groupStartIndex = Math.floor(index / 6) * 6;

          // Rx1 of the first row in this group
          const firstRx1InGroup =
            frequencies[groupStartIndex]?.usFreq * 1000000;

          // If this is the 6th row, wrap Rx2 to first Rx1
          const rx2Downlink =
            (index + 1) % 6 === 0 ? firstRx1InGroup : rx1Downlink + BW;

          return (
            <React.Fragment key={index}>
              <div key={index} style={styles.row}>
                <span
                  style={styles.cell}
                >{`US/DS Freq ${freq.label} MHz`}</span>
               <span style={styles.cell}>
  {Math.round(txUplink)} Hz
</span>

<span style={styles.cell}>
  {Math.round(rx1Downlink)} Hz
</span>

<span style={styles.cell}>
  {Math.round(rx2Downlink)} Hz
</span>
              </div>
              {(index + 1) % 6 === 0 && <div style={styles.emptyRow}></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
const styles = {
  emptyRow: {
    height: '25px',
    border: '1px solid white', // You can adjust the height as needed
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  paper: {
    border: '1px solid #FF4D4D',
    padding: '5px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: 'auto',
    flex: '1 1 calc(40%)',
    maxWidth: 'calc(80%)',
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
    justifyContent: 'space-between',
    fontWeight: 'bold',
    paddingBottom: '10px',
    borderBottom: '1px solid #1E7E34',
    marginBottom: '10px',
    backgroundColor: '#fff',
  },
  headerItem: {
    flex: 1,
    textAlign: 'center',
    fontSize: '16px',
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
  cell: {
    flex: 1,
    padding: '0px',
    border: '0.1px solid #007BFF',
    textAlign: 'center',
  },
};

export default FrequencyTable;
