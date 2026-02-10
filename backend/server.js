const express = require("express");
const snmp = require("net-snmp");
const cors = require("cors");
const ip = require("ip");

const app = express();
app.use(cors());

const community = "public";

/* ===================== OIDS ===================== */
const OIDS = {
  // MODULES
  slot: "1.3.6.1.4.1.9204.1.1.1.1.1",
  cardType: "1.3.6.1.4.1.9204.1.1.1.1.2",
  serial: "1.3.6.1.4.1.9204.1.1.1.1.3",
  model: "1.3.6.1.4.1.9204.1.1.1.1.4",
  mfgDate: "1.3.6.1.4.1.9204.1.1.1.1.6",
  firmware: "1.3.6.1.4.1.9204.1.1.1.1.8",
  loader: "1.3.6.1.4.1.9204.1.1.1.1.13",

  // NETWORK
  ipv4: "1.3.6.1.4.1.9204.1.14.2.1.1.1",
  subnet: "1.3.6.1.4.1.9204.1.14.2.1.1.2",
  gateway: "1.3.6.1.4.1.9204.1.14.2.1.1.3",
  ipv6: "1.3.6.1.4.1.9204.1.14.2.2.1.3",
  prefix: "1.3.6.1.4.1.9204.1.14.2.2.1.4",
  nextHop: "1.3.6.1.4.1.9204.1.14.2.2.1.5",

  // I2C MODULES
  i2cSlot: "1.3.6.1.4.1.9204.1.18.1.6.1.1.1",
  i2cModel: "1.3.6.1.4.1.9204.1.18.1.6.1.1.3",
  i2cSerial: "1.3.6.1.4.1.9204.1.18.1.6.1.1.2",
  i2cFirmware: "1.3.6.1.4.1.9204.1.18.1.6.1.1.15",
  i2cModuleType: "1.3.6.1.4.1.9204.1.18.1.6.1.1.14",
  i2cTotalSignals: "1.3.6.1.4.1.9204.1.18.1.6.1.1.8",
  i2cModelFeature: "1.3.6.1.4.1.9204.1.18.1.6.1.1.4",
  i2cConfigVer: "1.3.6.1.4.1.9204.1.18.1.6.1.1.6",

  // MFN MODULES
  mfnSlot: "1.3.6.1.4.1.9204.1.18.1.4.1.1",
  mfnModel: "1.3.6.1.4.1.9204.1.18.1.4.1.3",
  mfnSerial: "1.3.6.1.4.1.9204.1.18.1.4.1.2",
  mfnFirmware: "1.3.6.1.4.1.9204.1.18.1.4.1.14",
  mfnLoader: "1.3.6.1.4.1.9204.1.18.1.4.1.30"
};

/* ===================== SNMP WALK ===================== */
async function snmpWalk(target, oid) {
  // Helper to create a session and walk for a specific SNMP version
  function walkWithVersion(version) {
    return new Promise((resolve, reject) => {
      const session = snmp.createSession(target, community, {
        version: version,
        timeout: 3000,
        retries: 2
      });

      const data = {};

      session.subtree(
        oid,
        20,
        varbinds => {
          varbinds.forEach(v => {
            if (!snmp.isVarbindError(v)) {
              const index = v.oid.substring(oid.length + 1);
              data[index] = v.value;
            }
          });
        },
        err => {
          session.close();
          err ? reject(err) : resolve(data);
        }
      );
    });
  }

  const result = {};

  // First try v2c
  try {
    const v2cData = await walkWithVersion(snmp.Version2c);
    Object.assign(result, v2cData); // add all v2c results
  } catch (err) {
    console.warn(`v2c failed for ${target} OID ${oid}`);
  }

  // Then try v1 and merge
  try {
    const v1Data = await walkWithVersion(snmp.Version1);
    Object.assign(result, v1Data); // merge v1 results
  } catch (err2) {
    console.warn(`v1 failed for ${target} OID ${oid}`);
  }

  return result; // combined data from v2c + v1
}


/* ===================== HELPERS ===================== */
function firstValue(obj) {
  const key = Object.keys(obj)[0];
  return key ? obj[key] : "";
}

function bufferToIPv6(value) {
  if (!value || !Buffer.isBuffer(value) || value.length !== 16) return "";
  const parts = [];
  for (let i = 0; i < 16; i += 2) {
    parts.push(value.readUInt16BE(i).toString(16));
  }
  return parts.join(":").replace(/(^|:)0(:0)+(:|$)/, "::");
}

/* ===================== SCAN SINGLE IP ===================== */
async function scanIP(ipAddr) {
  console.log(`🔍 Scanning ${ipAddr}`);

  async function safeWalk(oid) {
    try {
      return await snmpWalk(ipAddr, oid);
    } catch (err) {
      console.warn(`⚠️ OID ${oid} failed for ${ipAddr}`);
      return {};
    }
  }

  const [
    slot, cardType, model, serial, mfgDate, firmware, loader,
    ipv4Tbl, subnetTbl, gatewayTbl, ipv6Tbl, prefixTbl, nextHopTbl,
    i2cSlot, i2cModel, i2cSerial, i2cFirmware, i2cModuleType, i2cTotalSignals,i2cModelFeature, i2cConfigVer,
    mfnSlot, mfnModel, mfnSerial, mfnFirmware, mfnLoader
  ] = await Promise.all([
    safeWalk(OIDS.slot),
    safeWalk(OIDS.cardType),
    safeWalk(OIDS.model),
    safeWalk(OIDS.serial),
    safeWalk(OIDS.mfgDate),
    safeWalk(OIDS.firmware),
    safeWalk(OIDS.loader),

    safeWalk(OIDS.ipv4),
    safeWalk(OIDS.subnet),
    safeWalk(OIDS.gateway),
    safeWalk(OIDS.ipv6),
    safeWalk(OIDS.prefix),
    safeWalk(OIDS.nextHop),

    safeWalk(OIDS.i2cSlot),
    safeWalk(OIDS.i2cModel),
    safeWalk(OIDS.i2cSerial),
    safeWalk(OIDS.i2cFirmware),
    safeWalk(OIDS.i2cModuleType),
    safeWalk(OIDS.i2cTotalSignals),
        safeWalk(OIDS.i2cModelFeature),
    safeWalk(OIDS.i2cConfigVer),

     safeWalk(OIDS.mfnSlot),
  safeWalk(OIDS.mfnModel),
  safeWalk(OIDS.mfnSerial),
  safeWalk(OIDS.mfnFirmware),
  safeWalk(OIDS.mfnLoader)
  ]);

  /* ---------- MODULES ---------- */
  const moduleIndices = new Set([...Object.keys(slot), ...Object.keys(model), ...Object.keys(serial)]);
  const modules = [...moduleIndices].map(i => ({
    slot: parseInt(slot[i], 10) || 0,
    cardType: cardType[i]?.toString() || "",
    model: model[i]?.toString() || "",
    serial: serial[i]?.toString() || "",
    mfgDate: mfgDate[i]?.toString() || "",
    firmware: firmware[i]?.toString() || "",
    loader: loader[i]?.toString() || ""
  })).sort((a, b) => a.slot - b.slot);

  /* ---------- I2C MODULES ---------- */
  const i2cIndices = new Set([...Object.keys(i2cSlot), ...Object.keys(i2cModel), ...Object.keys(i2cSerial)]);
  const i2cModules = [...i2cIndices].map(index => ({
    slot: index,
    slotPosition: index,
    model: i2cModel[index]?.toString() || "",
    serial: i2cSerial[index]?.toString() || "",
    firmware: i2cFirmware[index]?.toString() || "",
    moduleType: i2cModuleType[index] === 1 ? "Active" : i2cModuleType[index] === 0 ? "Regular" : "",
    totalSignals: i2cTotalSignals[index]?.toString() || "",
    modelFeature: i2cModelFeature[index]?.toString() || "",
    configVer: i2cConfigVer[index]?.toString() || "",
  })).sort((a, b) => a.slot - b.slot);

  /* ---------- MFN MODULES ---------- */
  const mfnIndices = new Set([
  ...Object.keys(mfnSlot),
  ...Object.keys(mfnModel),
  ...Object.keys(mfnSerial)
]);

const mfnModules = [...mfnIndices].map(index => ({
  ip: ipAddr,
  slot: index,
  model: mfnModel[index]?.toString() || "",
  serial: mfnSerial[index]?.toString() || "",
  firmware: mfnFirmware[index]?.toString() || "",
  loader: mfnLoader[index]?.toString() || ""
})).sort((a, b) => a.slot - b.slot);

const ipv4List = Object.entries(ipv4Tbl)
  .filter(([index, value]) => value)          // remove empty values
  .map(([index, value]) => ({ index, value: value.toString() }));
  /* ---------- NETWORK ---------- */
  const network = {
    ipv4: firstValue(ipv4Tbl).toString() || "",
    ipv4all: ipv4List,
    subnet: firstValue(subnetTbl).toString() || "",
    gateway: firstValue(gatewayTbl).toString() || "",
    ipv6: bufferToIPv6(firstValue(ipv6Tbl)),
    prefix: firstValue(prefixTbl)?.toString() || "",
    nextHop: bufferToIPv6(firstValue(nextHopTbl))
  };

  return {
    ip: ipAddr,
    success: true,
    network,
    modules,
    i2cModules,
    mfnModules
  };
}

/* ===================== IP RANGE ===================== */
function ipRange(startIP, endIP) {
  const list = [];
  for (let i = ip.toLong(startIP); i <= ip.toLong(endIP); i++) {
    list.push(ip.fromLong(i));
  }
  return list;
}

/* ===================== API ===================== */
app.get("/scan", async (req, res) => {
  const { startIP, endIP } = req.query;
  if (!startIP || !endIP) return res.status(400).json({ error: "startIP and endIP required" });

  try {
    const ips = ipRange(startIP, endIP);
    const results = await Promise.all(ips.map(scanIP));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== START SERVER ===================== */
app.listen(5000, () => {
  console.log("🚀 SNMP Backend running on http://localhost:5000");
});
