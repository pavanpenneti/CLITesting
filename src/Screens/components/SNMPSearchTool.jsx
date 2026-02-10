import { useState } from "react";
import axios from "axios";

/* ---------- HELPERS ---------- */
const exact = (v, f) => !f || String(v) === String(f);
const startsWith = (v, f) =>
  !f || String(v).toLowerCase().startsWith(f.toLowerCase());
const globalMatch = (row, filter) =>
  !filter ||
  Object.values(row)
    .join(" ")
    .toLowerCase()
    .includes(filter.toLowerCase());

/* ---------- SNMPSearchTool ---------- */
export default function SNMPSearchTool() {
  const [startIP, setStartIP] = useState("10.27.104.40");
  const [endIP, setEndIP] = useState("10.27.104.70");
  const [data, setData] = useState([]);
  const [view, setView] = useState("modules");
const [loading, setLoading] = useState(false);

  const [cardFilter, setCardFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  const isFiltering =
  globalFilter ||
  cardFilter ||
  slotFilter;

const hasAnyNetworkValue = n =>
  n.ipv4 !== "-" ||
  n.subnet !== "-" ||
  n.gateway !== "-" ||
  n.ipv6 !== "-" ||
  n.prefix !== "-" ||
  n.nextHop !== "-";

 

  /* ---------- FLATTEN ---------- */
  const modules = [];
  const i2c = [];
  const mfn = [];
  const networkRows = [];
  const noModulesIPs = [];
  const presentCardTypes = new Set();

  data.forEach(d => {
    if (!d.success) return;

    if (!d.modules || d.modules.length === 0) {
      noModulesIPs.push(d.ip);
    }

    d.modules?.forEach(m => {
      modules.push({ ip: d.ip, ...m });
      if (m.cardType) presentCardTypes.add(Number(m.cardType));
    });
 d.mfnModules?.forEach(m =>
    mfn.push({ ip: d.ip, ...m }) // <- add the IP
  );
    d.i2cModules?.forEach(m =>
      i2c.push({ ip: d.ip, ...m })
    );

    if (d.network) {
      networkRows.push({
        ip: d.ip,
        ipv4: d.network.ipv4 || "-",
        ipv4all: d.network.ipv4all || [], 
        subnet: d.network.subnet || "-",
        gateway: d.network.gateway || "-",
        ipv6: d.network.ipv6 || "-",
        prefix: d.network.prefix || "-",
        nextHop: d.network.nextHop || "-"
      });
    }
  });

  /* ---------- CARD TYPE SUMMARY ---------- */
  const allCardTypes = Array.from({ length: 64 }, (_, i) => i + 1);
  const notPresent = allCardTypes.filter(
    c => !presentCardTypes.has(c)
  );

  /* ---------- FILTERED ---------- */
  const filteredModules = modules
  .filter(
    m =>
      exact(m.cardType, cardFilter) &&   // 🔥 FIXED
      exact(m.slot, slotFilter) &&        // unchanged
      globalMatch(m, globalFilter)
  )
 .sort(
  (a, b) =>
    a.ip.localeCompare(b.ip) ||
    Number(a.slot) - Number(b.slot) ||      // ✅ slot first
    Number(a.cardType) - Number(b.cardType) // optional tie-breaker
);

const filteredMFN = mfn.filter(m => globalMatch(m, globalFilter)).sort(
    (a, b) =>
      a.ip.localeCompare(b.ip) ||      // Sort by IP first
      Number(a.slot) - Number(b.slot)   // Then by slot number
  );
  const filteredI2C = i2c
    .filter(m => globalMatch(m, globalFilter))
    .sort(
      (a, b) =>
        a.ip.localeCompare(b.ip) ||
        Number(a.slot) - Number(b.slot)
    );

 const filteredNetwork = networkRows.filter(
  n => hasAnyNetworkValue(n) && globalMatch(n, globalFilter)
);


const groupByIP = rows =>
  rows.reduce((acc, r) => {
    acc[r.ip] = acc[r.ip] || [];
    acc[r.ip].push(r);
    return acc;
  }, {});
const scan = async () => {
  try {
    setLoading(true);
    const res = await axios.get("http://localhost:5000/scan", {
      params: { startIP, endIP }
    });
    setData(res.data || []);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};


const modulesByIP = filteredModules.reduce((acc, m) => {
  acc[m.ip] = acc[m.ip] || [];
  acc[m.ip].push(m);
  return acc;
}, {});
const i2cByIP = filteredI2C.reduce((acc, m) => {
  acc[m.ip] = acc[m.ip] || [];
  acc[m.ip].push(m);
  return acc;
}, {});

 const mfnByIP = filteredMFN.reduce((acc, m) => {
  acc[m.ip] = acc[m.ip] || [];
  acc[m.ip].push(m);
  return acc;
}, {});
 return (
    <>
      {/* CONTROLS */}
      {/* CONTROLS – PAPER STYLE */}
<div style={styles.paper}>
 

  <div style={styles.controlRow}>
    <input
      style={styles.input}
      placeholder="Start IP"
      value={startIP}
      onChange={e => setStartIP(e.target.value)}
    />
    <input
      style={styles.input}
      placeholder="End IP"
      value={endIP}
      onChange={e => setEndIP(e.target.value)}
    />
       <button
  style={{
    ...styles.scanBtn,
    opacity: loading ? 0.7 : 1,
    cursor: loading ? "not-allowed" : "pointer"
  }}
  onClick={scan}
  disabled={loading}
>
  {loading ? "Scanning..." : "Scan"}
</button>
<button
  onClick={() => setShowStatus(s => !s)}
 
   style={view === "modules" ? styles.activeBtn : styles.viewBtn}
>
  {showStatus ? "Hide Status" : "Show Status"}
</button>
    <input
      style={styles.input}
      placeholder="Global Search"
      onChange={e => setGlobalFilter(e.target.value)}
    />
    <input
      style={styles.input}
      placeholder="Card Type"
      onChange={e => setCardFilter(e.target.value)}
    />
    <input
      style={styles.input}
      placeholder="Slot"
      onChange={e => setSlotFilter(e.target.value)}
    />


    <button
      style={view === "modules" ? styles.activeBtn : styles.viewBtn}
      onClick={() => setView("modules")}
    >
      Modules
    </button>
 <button
      style={view === "mfn" ? styles.activeBtn : styles.viewBtn}
      onClick={() => setView("mfn")}
    >
      MFN
    </button>
    <button
      style={view === "i2c" ? styles.activeBtn : styles.viewBtn}
      onClick={() => setView("i2c")}
    >
      I2C
    </button>

    <button
      style={view === "network" ? styles.activeBtn : styles.viewBtn}
      onClick={() => setView("network")}
    >
      Network
    </button>
  
 

  </div>
</div>

{/* CARD SUMMARY – PAPER STYLE */}

{showStatus && (
  <div style={styles.paper}>
    <div style={styles.summaryLine}>
      <strong>Card Types Present:</strong>{" "}
      <span style={{ color: "green", fontWeight: "normal" }}>
        {[...presentCardTypes].sort((a, b) => a - b).join(", ") || "None"}
      </span>
    </div>

    <div style={styles.summaryLine}>
      <strong>Card Types Not Present:</strong>{" "}
      <span style={{ color: "red", fontWeight: "normal" }}>
        {notPresent.join(", ")}
      </span>
    </div>

    <div style={styles.summaryLine}>
      <strong>IPs not reachable:</strong>{" "}
      <span style={{ color: "red", fontWeight: "normal" }}>
        {noModulesIPs
          .map(ip => `CX ${ip.split(".").pop()}`)
          .join(", ")}
      </span>
    </div>
  </div>
)}





      {/* MODULES */}
  {view === "modules" && (
  isFiltering ? (
    /* ---------- SINGLE TABLE WHEN FILTERING ---------- */
    <Paper
      title="Modules (Filtered Results)"
      headers={["IP", "Slot", "Card Type", "Model", "Serial", "FW", "Loader"]}
      rows={filteredModules.map(m => [
        m.ip,
        m.slot,
        m.cardType,
        m.model,
        m.serial,
        m.firmware,
        m.loader
      ])}
    />
  ) : (
    /* ---------- MULTIPLE TABLES WHEN NO FILTER ---------- */
    Object.keys(modulesByIP)
      .sort()
      .map(ip => (
        <Paper
          key={ip}
          title={`${ip}`}
          headers={["Slot", "Card Type", "Model", "Serial", "FW", "Loader"]}
          rows={modulesByIP[ip].map(m => [
            m.slot,
            m.cardType,
            m.model,
            m.serial,
            m.firmware,
            m.loader
          ])}
        />
      )))
)}

{view === "mfn" && (
  isFiltering ? (
    <Paper
      title="MFN Modules (Filtered Results)"
      headers={[
        "IP",
        "Node Position",
        "Model Number",
        "Serial Number",
        "Firmware Version",
        "Loader Version"
      ]}
      rows={filteredMFN.map(m => [
        m.ip,
        m.slot,
        m.model,
        m.serial,
        m.firmware,
        m.loader
      ])}
    />
  ) : (
    Object.keys(mfnByIP)
      .sort()
      .map(ip => (
        <Paper
          key={ip}
          title={`MFN Modules — ${ip}`}
          headers={[
            "Node Position",
            "Model Number",
            "Serial Number",
            "Firmware Version",
            "Loader Version"
          ]}
          rows={mfnByIP[ip].map(m => [
            m.slot,
            m.model,
            m.serial,
            m.firmware,
            m.loader
          ])}
        />
      ))
  )
)}


      {/* I2C */}
  {view === "i2c" && (
  isFiltering ? (
    <Paper
      title="I2C Modules (Filtered Results)"
      headers={[
        "IP",
        "Slot",
        "Module Type",
        "Model",
        "Serial",
        "Firmware",
        "Total Signals"
      ]}
      rows={filteredI2C.map(m => [
        m.ip,
        m.slot,
        m.moduleType,
        m.model,
        m.serial,
        m.firmware,
        m.totalSignals
      ])}
    />
  ) : (
    Object.keys(i2cByIP)
      .sort()
      .map(ip => (
        <Paper
          key={ip}
          title={`I2C Modules — ${ip}`}
          headers={[
            "Slot",
            "Module Type",
            "Model",
            "Serial",
            "Firmware",
            "Total Signals"
          ]}
          rows={i2cByIP[ip].map(m => [
            m.slot,
            m.moduleType,
            m.model,
            m.serial,
            m.firmware,
            m.totalSignals
          ])}
        />
      )))
)}






      {/* NETWORK */}
    {view === "network" && (
  <Paper
    title="Network Information"
    headers={[
      "Index No",
    
     
      "Equivalent CXs",
       "IPv4",
      "Subnet",
      "Gateway",
      "IPv6",
      "Prefix",
      "Next Hop"
    ]}
    rows={filteredNetwork.map((n, i) => [
      i + 1,                      // single IPv4 (if you still keep it)
Array.isArray(n.ipv4all) &&
    n.ipv4all.map((ip, idx) => (
      <span key={idx}>
        <span style={{ color: "blue" }}>CX{ip.value.split(".").pop()}</span>
        <span style={{ color: "red" }}>__</span>
        <span style={{ color: "blue" }}>{ip.index}</span>
        {idx < n.ipv4all.length - 1 && ", "}
      </span>
    )),


      n.ipv4,      // ✅ all IPv4s
      n.subnet,
      n.gateway,
      n.ipv6,
      n.prefix,
      n.nextHop,
      
    ])}
  />
)}


     


    </>
  );
}

/* ---------- PAPER (DIAGNOSTICS STYLE) ---------- */
function Paper({ title, headers, rows, red }) {
  if (!rows.length) return null;

  return (
    <div style={styles.paper}>
      <div style={styles.title}>{title}</div>

      <div style={styles.headers}>
        {headers.map(h => (
          <span key={h} style={styles.headerItem}>
            <strong>{h}</strong>
          </span>
        ))}
      </div>

      {rows.map((r, i) => (
  <div key={i} style={styles.row}>
    {r.map((c, j) => (
      <span
        key={j}
        style={{
          ...styles.item,
          color: columnColors?.[j] || "#000"
        }}
      >
        {c || "-"}
      </span>
    ))}
  </div>
))}

    </div>
  );
}

/* ---------- STYLES ---------- */
// const styles = {
//   wrSNMPSearchTooler: { display: "flex", gap: "6px", marginBottom: "6px" },
//   paper: {
//     border: "2px solid #ddd",
//     padding: "2px",
//     borderRadius: "8px",
//     margin: "6px",
//     backgroundColor: "#f9f9f9"
//   },
//   title: { fontSize: "12px", fontWeight: "bold", marginBottom: "4px" },
//   headers: {
//     display: "flex",
//     borderBottom: "1px solid #ddd",
//     background: "#fff"
//   },
//   headerItem: { flex: 1, fontSize: "12px", padding: "2px" },
//   row: {
//     display: "flex",
//     padding: "2px",
//     boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
//   },
//   item: { flex: 1, fontSize: "12px", whiteSpace: "nowrap" }
// };
const columnColors = [
  "#1565c0", // Index No – Blue
  "#2e7d32", // Slot – Green
  "#6a1b9a", // Module Type – Purple
  "#ef6c00", // Model – Orange
  "#c62828", // Serial – Red
  "#455a64", // Firmware – Grey
  "#0277bd"  // Total Signals – Teal
];
const styles = {
  paper: {
    border: "2px solid #ddd",
    borderRadius: "8px",
    margin: "2px auto",
    width: "70%",
    padding: '8px 4px' // ✅ ONLY THIS
  },
  title: { fontSize: "12px", fontWeight: "bold", marginBottom: "4px" },
  headers: { display: "flex", borderBottom: "1px solid #ddd" },
  headerItem: { flex: 1, fontSize: "12px", padding: "2px" },
  row: { display: "flex", padding: "2px" },
  item: { flex: 1, fontSize: "12px" },
  controlRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px",
  alignItems: "center"
},

input: {
  fontSize: "12px",
  padding: "4px 6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "130px"
},

scanBtn: {
  fontSize: "12px",
  padding: "4px 12px",
  borderRadius: "4px",
  border: "1px solid #0074e8",
  background: "#0074e8",
  color: "#fff",
  cursor: "pointer"
},

summaryLine: {
  fontSize: "12px",
  margin: "2px 0",
  textAlign: "left"
},

viewButtons: {
  display: "flex",
  gap: "6px"
},

viewBtn: {
  fontSize: "12px",
  padding: "4px 10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer"
},

activeBtn: {
  fontSize: "12px",
  padding: "4px 10px",
  borderRadius: "4px",
  border: "1px solid #0074e8",
  background: "#0074e8",
  color: "#fff",
  cursor: "pointer"
}

};
