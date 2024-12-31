import React, { useState } from 'react';
import './DailyReport.css';
import axios from 'axios';

function DailyReport() {
  const [reports, setReports] = useState([]);
  const [version, setVersion] = useState('9.02.04');
  const [system, setSystem] = useState('EMS');
  const [installerVersion, setInstallerVersion] = useState('24.07.02');
  const [fwVersion, setFwVersion] = useState('2.32');
  const [mbInstallerVersion, setMbInstallerVersion] = useState('24.07.02');
  const [mbFwVersion, setMbFwVersion] = useState('4.22');
  const [customReport, setCustomReport] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [data, setData] = useState({});
  const fields = [
    "JIRA TT's Added",
    "JIRA TT's Modified",
    'JIRA Tested & Closed',
    'Test Track Added',
    'Test Track Modified',
    'Test Track Closed',
    'CMS Testing',
    'CMS Installer',
    'API Testing',
    'Automation Testing',
    'Test Build Issues',
    'Enhancements',
    'Firmware Testing',
    'Documentation',
  ];

  const addReport = (report) => setReports([...reports, report]);

  const removeLastReport = () => {
    setReports(reports.slice(0, -1));
  };
  const clearReports = () => setReports([]);
  const installer = () => {
    const report = (
      <div key={`installer-${reports.length}`} className="report">
        <p>
          {system} Installer Testing:
          <br />
          =================
          <br />
          1. Tested the Installers in Windows 7, Windows 10 & Windows 11
          <br />
          2. Verified the installer version {version} through the installation
          process by overriding the existing {system}, and the application is
          functioning properly.
          <br />
          3. Uninstalled the {system} via the control panel and successfully
          removed the application.
          <br />
          4. Installed the application as a new instance, and it is functioning
          properly.
          <br />
          5. Uninstalled the application using the installer, and it was
          successfully removed.
        </p>
      </div>
    );
    addReport(report);
  };

  const oaTestingReport = () => {
    const report = (
      <div key={`oa-${reports.length}`} className="report">
        <p>
          OA Testing with installer ({installerVersion}) with FW Version:{' '}
          {fwVersion}:<br />
          ================================================================================
          <br />
          1. Tested the health status alarms (set & query messages) and they are
          working fine.
          <br />
          2. Tested the downstream configuration parameters (set & query
          messages) and they are working fine.
          <br />
          3. Tested the upstream configuration parameters (set & query messages)
          and they are working fine.
          <br />
          4. Tested the utilities parameters (set & query messages) and they are
          working fine.
          <br />
        </p>
      </div>
    );
    addReport(report);
  };

  const mbBleTestingReport = () => {
    const report = (
      <div key={`mb-${reports.length}`} className="report">
        <p>
          MB/BLE Testing with installer ({mbInstallerVersion}) & Test builds and
          Dongle Package with FW Version {mbFwVersion}:<br />
          =========================================================================================
          <br />
          1. Tested the health status alarms (set & query messages) and they are
          working fine.
          <br />
          2. Tested the device configuration parameters (set & query messages)
          and they are working fine.
          <br />
          3. Tested the downstream configuration parameters (set & query
          messages) and they are working fine.
          <br />
          4. Tested the upstream configuration parameters (set & query messages)
          and they are working fine.
          <br />
          5. Tested the advanced diagnostics parameters (set & query messages)
          and they are working fine.
          <br />
          6. Tested the utilities parameters (set & query messages) and they are
          working fine.
          <br />
          7. Tested the profiles parameters (set & query messages) and they are
          working fine.
          <br />
          8. Tested the create profile and it is working fine.
          <br />
          9. Tested the spectrum (set & query messages) and they are working
          fine.
          <br />
          10. Tested the guided setup parameters (set & query messages) and they
          are working fine.
        </p>
      </div>
    );
    addReport(report);
  };

  const addCustomReport = () => {
    if (customReport.trim()) {
      const lines = customReport.split('\n');
      const report = (
        <div key={`custom-${reports.length}`} className="report">
          {lines.map((line, index) => (
            <p style={{ height: 0.3 }} key={index}>
              {line}
            </p>
          ))}
        </div>
      );
      addReport(report);
      setCustomReport(''); // Clear the text area after adding the report
    }
  };

  const addFieldReport = () => {
    if (selectedField && textareaValue.trim()) {
      const separator = '='.repeat(selectedField.length);

      const report = (
        <div key={`${selectedField}-${reports.length}`} className="report">
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {selectedField}:<br />
            {separator}
            <br />
            {textareaValue}
          </p>
        </div>
      );
      addReport(report);
      setTextareaValue(''); // Clear the textarea after adding the report
    }
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
        <input
          style={{ marginRight: 3, marginLeft: 170 }}
          type="text"
          placeholder="Installer Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
        <select
          style={{ height: 23, width: 120, marginRight: 3 }}
          value={system}
          onChange={(e) => setSystem(e.target.value)}
        >
          <option value="CMS">CMS</option>
          <option value="EMS">EMS</option>
          <option value="OTS">OTS</option>
          <option value="Opti-Trace Server">Opti-Trace Server</option>
        </select>
        <button
          style={{ marginRight: 3, background: 'green', color: 'white' }}
          type="button"
          className="set-button"
          onClick={installer}
        >
          Installer SET
        </button>
        <input
          style={{ marginRight: 3 }}
          type="text"
          placeholder="OA4544D Installer Version"
          value={installerVersion}
          onChange={(e) => setInstallerVersion(e.target.value)}
        />
        <input
          style={{ marginRight: 3 }}
          type="text"
          placeholder="Enter Firmware Version"
          value={fwVersion}
          onChange={(e) => setFwVersion(e.target.value)}
        />

        <button
          style={{ marginRight: 3, background: 'green', color: 'white' }}
          type="button"
          className="set-button"
          onClick={oaTestingReport}
        >
          OA SET
        </button>
        <input
          type="text"
          placeholder="MB180 Installer Version"
          value={mbInstallerVersion}
          onChange={(e) => setMbInstallerVersion(e.target.value)}
        />
        <input
          style={{ marginRight: 3 }}
          type="text"
          placeholder="Enter Firmware Version"
          value={mbFwVersion}
          onChange={(e) => setMbFwVersion(e.target.value)}
        />

        <button
          type="button"
          style={{ marginRight: 3, background: 'green', color: 'white' }}
          className="set-button"
          onClick={mbBleTestingReport}
        >
          MB180 SET
        </button>
        <button
          type="button"
          style={{ marginRight: 3, background: 'red', color: 'white' }}
          onClick={removeLastReport}
        >
          Remove Last Appended Data
        </button>
        <button
          type="button"
          style={{ marginRight: 3, background: 'red', color: 'white' }}
          onClick={clearReports}
        >
          Clear
        </button>
        <div>
          <select
            style={{ height: 23, marginLeft: 150, marginRight: 3, width: 150 }}
            id="field-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            <option value="">Select a field</option>
            {fields.map((field, index) => (
              <option key={index} value={field}>
                {field}
              </option>
            ))}
          </select>

          <textarea
            style={{ marginRight: 3, width: 500 }}
            id="field-textarea"
            placeholder="Select Field Type and Enter ........"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            rows="4"
            cols="50"
            className="textarea"
          />

          <button
            style={{ marginRight: 3, background: 'green', color: 'white' }}
            type="button"
            className="set-button"
            onClick={addFieldReport}
          >
            Field SET
          </button>

          {/* Custom Report */}

          <textarea
            style={{ marginRight: 3, width: 500 }}
            placeholder="Customize ....."
            value={customReport}
            onChange={(e) => setCustomReport(e.target.value)}
            rows="4"
            cols="50"
          />

          <button
            type="button"
            style={{ marginRight: 3, background: 'green', color: 'white' }}
            className="set-button"
            onClick={addCustomReport}
          >
            Customize SET
          </button>
        </div>
      </div>
      <div style={{ marginTop: 110 }}>
        {reports.map((report, index) => (
          <div key={index} className="report-item">
            {report}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DailyReport;
