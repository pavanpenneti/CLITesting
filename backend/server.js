const express = require('express');
const snmp = require('net-snmp');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// OID Mappings
const OID_MAP = {
  cardType: '1.3.6.1.4.1.9204.1.1.1.1.2',
  modelNumber: '1.3.6.1.4.1.9204.1.1.1.1.11',
  mChnlRxMFNModelNumber: '1.3.6.1.4.1.9204.1.18.1.4.1.3',
  i2cModuleModelNo: 'AURORA-SYSTEM3000-MIB::i2cModuleModelNo'
};

// Card Type Mapping
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

// Helper function to perform SNMP walk
function snmpWalk(ipAddress, oid, community = 'public') {
  return new Promise((resolve, reject) => {
    const session = snmp.createSession(ipAddress, community, {
      version: snmp.Version1,
      timeout: 5000
    });

    const results = [];

    function feedCb(varbinds) {
      for (let i = 0; i < varbinds.length; i++) {
        if (snmp.isVarbindError(varbinds[i])) {
          console.error(snmp.varbindError(varbinds[i]));
        } else {
          results.push({
            oid: varbinds[i].oid,
            value: varbinds[i].value
          });
        }
      }
    }

    function doneCb(error) {
      session.close();
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    }

    const maxRepetitions = 20;
    session.subtree(oid, maxRepetitions, feedCb, doneCb);
  });
}

// Main search endpoint
app.post('/api/snmp-search', async (req, res) => {
  const { ipAddress, searchType, searchValue } = req.body;

  if (!ipAddress || !searchType || !searchValue) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters'
    });
  }

  try {
    const oid = OID_MAP[searchType];
    if (!oid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search type'
      });
    }

    const snmpResults = await snmpWalk(ipAddress, oid);
    const matchedResults = [];

    for (const item of snmpResults) {
      const oidStr = item.oid.join('.');
      const value = item.value.toString().trim();

      if (!value) continue;

      // Extract slot number from OID
      const oidParts = oidStr.split('.');
      const slotNo = oidParts[oidParts.length - 1];

      let match = false;
      let result = {
        oid: oidStr,
        value: value,
        slotNo: slotNo
      };

      // Check for match based on search type
      if (searchType === 'cardType') {
        const cardTypeNum = parseInt(value);
        if (cardTypeNum === parseInt(searchValue)) {
          result.field = 'CardType';
          result.cardType = cardTypeNum;
          match = true;
        }
      } else if (searchType === 'modelNumber') {
        if (value.includes(searchValue)) {
          result.field = 'ModelNumber';
          match = true;
        }
      } else if (searchType === 'mChnlRxMFNModelNumber') {
        if (value.includes(searchValue)) {
          result.field = 'mChnlRxMFNModelNumber';
          match = true;
        }
      } else if (searchType === 'i2cModuleModelNo') {
        if (value.includes(searchValue)) {
          result.field = 'i2cModuleModelNo';
          match = true;
        }
      }

      if (match) {
        matchedResults.push(result);
      }
    }

    res.json({
      success: true,
      results: matchedResults
    });

  } catch (error) {
    console.error(`Error searching ${ipAddress}:`, error.message);
    res.json({
      success: true,
      results: [] // Return empty results on error (device might be offline)
    });
  }
});

// Simple SNMP GET endpoint (from previous example)
app.post('/api/snmp', async (req, res) => {
  const { ipAddress, community = 'public', oid = '1.3.6.1.2.1.1.1.0' } = req.body;

  const session = snmp.createSession(ipAddress, community);

  session.get([oid], (error, varbinds) => {
    if (error) {
      session.close();
      return res.status(500).json({ error: error.message });
    }

    const results = varbinds.map(vb => ({
      oid: vb.oid,
      type: snmp.ObjectType[vb.type],
      value: vb.value.toString()
    }));

    session.close();
    res.json({ success: true, data: results });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`SNMP Search Tool API server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/snmp-search - Search SNMP devices');
  console.log('  POST /api/snmp - Simple SNMP GET');
});
