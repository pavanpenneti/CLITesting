const express = require("express");
const snmp = require("net-snmp");
const app = express();
const port = 5000;

const staticIpAddress = "10.27.105.60"; // Static IP address for SNMP query
const oid = "1.3.6.1.4.1.9204.1.1.1.1.4"; // OID for model number

app.get("/api/getModelNumber", (req, res) => {
  const session = snmp.createSession(staticIpAddress, "public"); // SNMP community 'public'

  // Attempt to retrieve the model number from the device
  session.get([oid], (error, varbinds) => {
    if (error) {
      // Check if the error is due to an unreachable IP or network issue
      if (
        error.message.includes("Timeout") ||
        error.message.includes("No response")
      ) {
        console.error(
          `SNMP timeout or no response from IP ${staticIpAddress}: ${error.message}`,
        );
        return res
          .status(500)
          .json({
            error: `SNMP device at ${staticIpAddress} is unreachable or not responding.`,
          });
      } else {
        console.error(`Error retrieving model number: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
    }

    // Assume model number is in the first varbind, if present
    const modelNumber =
      varbinds[0] && varbinds[0].value ? varbinds[0].value.toString() : null;

    if (modelNumber) {
      console.log(`Model number for IP ${staticIpAddress}: ${modelNumber}`);
      res.json({
        message: `Model number found`,
        modelNumber: modelNumber,
      });
    } else {
      console.log(`Model number not found for IP ${staticIpAddress}`);
      res.json({
        message: `Model number not found`,
      });
    }

    session.close();
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
