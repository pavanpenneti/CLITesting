import React, { useState, useRef, useEffect } from 'react';

export default function SNMPSearchTool() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchInputs, setSearchInputs] = useState({
    cardType: '',
    modelNumber: '',
    mChnlRxMFNModelNumber: '',
    i2cModuleModelNo: ''
  });
  const [searching, setSearching] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [results, setResults] = useState([]);
  const [ipAddresses, setIpAddresses] = useState([]);
  const abortControllerRef = useRef(null);
  const resultsEndRef = useRef(null);

  const tabs = [
    { name: 'CardType', key: 'cardType', placeholder: 'Enter CardType Number' },
    { name: 'ModelNumber', key: 'modelNumber', placeholder: 'Enter ModelNumber' },
    { name: 'mChnlRxMFNModelNumber', key: 'mChnlRxMFNModelNumber', placeholder: 'Enter mChnlRxMFNModelNumber' },
    { name: 'i2cModuleModelNo', key: 'i2cModuleModelNo', placeholder: 'Enter i2cModuleModelNo' }
  ];

  const cardTypeMap = {
    1: "edfa(1)",
    2: "powersupplyNoDisplay(2)",
    3: "receiver3x01(3)",
    4: "transponder(4)",
    5: "transmitter(5)",
    6: "loader(6)",
    7: "mininode(7)",
    8: "communication(8)",
    9: "powersupplyWithDisplay(9)",
    10: "loptiplex(10)",
    11: "networkInterface(11)",
    12: "dualAnalogRPR(12)",
    13: "analogTransmitter33xx(13)",
    14: "analogTransmitter351x(14)",
    17: "opticalSwitch(17)",
    18: "optical2x2Switch(18)",
    19: "receiver3x21(19)",
    20: "receiver3x02(20)",
    21: "nifNoShelfMonitor(21)",
    22: "miniOptiPlex(22)",
    23: "dualChnlTransmitter(23)",
    24: "analogReceiver(24)",
    25: "rfABSwitch(25)",
    26: "digitalTransceiver(26)",
    27: "ethernetSwitch(27)",
    28: "cxNoShelfMonitor(28)",
    29: "analogTransmitter33xxG(29)",
    30: "linModAT355x(30)",
    31: "optSwitchMaster(31)",
    32: "optSwitchSlave(32)",
    33: "aggregator(33)",
    34: "optSwitch32MxM(34)",
    35: "analogTransmitter33XXG(35)",
    36: "analogTransmitter351X(36)",
    37: "analogTransmitter33xXG(37)",
    40: "exModAT355X(40)",
    41: "t1ModuleGT34xx(41)",
    45: "highPwrEDFA(45)",
    46: "opticalReceiver(46)",
    48: "newTransponder(48)",
    49: "newOpticalReceiver(49)",
    50: "exModAnalogTransmitter(50)",
    51: "newOptical2x2Switch(51)",
    52: "backPlate_3100(52)",
    54: "subSlotsController1(54)",
    55: "quadChannelDigitalReceiver(55)",
    57: "quadAnalogReceiver(57)",
    58: "digitalTransceiverDT3550(58)",
    59: "analogReceiver_1_2G(59)",
    62: "new2x2OpticalSwitch(62)",
    63: "exModHT35xx(63)"
  };

  // Auto scroll to bottom when new results arrive
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const handleInputChange = (key, value) => {
    setSearchInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        setIpAddresses(lines);
        alert(`Loaded ${lines.length} IP addresses`);
      };
      reader.readAsText(file);
    }
  };

  const searchSNMP = async () => {
    const currentTab = tabs[activeTab];
    const searchValue = searchInputs[currentTab.key];

    if (!searchValue) {
      alert('Please enter a search value');
      return;
    }

    if (ipAddresses.length === 0) {
      alert('Please upload IP addresses CSV file first');
      return;
    }

    setSearching(true);
    setResults([]);
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < ipAddresses.length; i++) {
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        const ip = ipAddresses[i];
        setCurrentStatus(`Searching... ${ip} (${i + 1}/${ipAddresses.length})`);

        try {
          const response = await fetch('http://localhost:3001/api/snmp-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ipAddress: ip,
              searchType: currentTab.key,
              searchValue: searchValue
            }),
            signal: abortControllerRef.current.signal
          });

          const data = await response.json();

          if (data.success && data.results && data.results.length > 0) {
            setResults(prev => [...prev, ...data.results.map(r => ({
              ...r,
              ip: ip,
              timestamp: new Date().toLocaleTimeString()
            }))]);
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error(`Error searching ${ip}:`, err);
          }
        }
      }

      setCurrentStatus('');
      setResults(prev => [...prev, {
        isDone: true,
        message: '======================================= Done =======================================',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setSearching(false);
    }
  };

  const stopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setSearching(false);
      setCurrentStatus('Search stopped');
    }
  };

  const clearResults = () => {
    setResults([]);
    setCurrentStatus('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          SNMP Search Tool
        </h1>

        {/* IP Address Upload */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <label className="block text-sm font-medium mb-2 text-slate-300">
            Upload IP Addresses CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 file:cursor-pointer
              cursor-pointer"
          />
          {ipAddresses.length > 0 && (
            <p className="mt-2 text-sm text-green-400">
              ✓ {ipAddresses.length} IP addresses loaded
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700">
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(index)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  activeTab === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tabs.map((tab, index) => (
              <div key={tab.key} className={activeTab === index ? 'block' : 'hidden'}>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={searchInputs[tab.key]}
                    onChange={(e) => handleInputChange(tab.key, e.target.value)}
                    placeholder={tab.placeholder}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                      text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 
                      focus:border-transparent outline-none"
                    disabled={searching}
                  />
                  <button
                    onClick={searchSNMP}
                    disabled={searching}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold
                      disabled:bg-slate-600 disabled:cursor-not-allowed transition"
                  >
                    Search
                  </button>
                  <button
                    onClick={stopSearch}
                    disabled={!searching}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold
                      disabled:bg-slate-600 disabled:cursor-not-allowed transition"
                  >
                    Stop
                  </button>
                  <button
                    onClick={clearResults}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition"
                  >
                    Clear
                  </button>
                </div>

                {currentStatus && (
                  <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-300 text-sm">{currentStatus}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Search Results</h2>
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No results yet. Start a search to see results here.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-2">
                  {result.isDone ? (
                    <p className="text-green-400 font-bold">{result.message}</p>
                  ) : (
                    <p className="text-slate-300">
                      <span className="text-cyan-400">{result.ip?.padEnd(15)}</span>
                      <span className="text-yellow-400 ml-2">{result.field}=</span>
                      <span className="text-green-400">{result.value?.padEnd(30)}</span>
                      {result.slotNo && (
                        <span className="text-blue-400 ml-4">slotno={result.slotNo}</span>
                      )}
                      {result.cardType && (
                        <span className="text-purple-400 ml-4">{cardTypeMap[result.cardType] || result.cardType}</span>
                      )}
                      <span className="text-slate-500 ml-4 text-xs">[{result.timestamp}]</span>
                    </p>
                  )}
                </div>
              ))
            )}
            <div ref={resultsEndRef} />
          </div>
        </div>

        {/* Card Type Reference */}
        <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
          <details className="cursor-pointer">
            <summary className="text-lg font-semibold text-slate-200 mb-2">Card Type Reference</summary>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4 text-sm">
              {Object.entries(cardTypeMap).map(([key, value]) => (
                <div key={key} className="bg-slate-700 p-2 rounded">
                  <span className="text-blue-400">{key}:</span>
                  <span className="text-slate-300 ml-2">{value}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
