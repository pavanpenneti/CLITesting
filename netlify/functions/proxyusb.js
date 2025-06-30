
console.log("🔧 proxyusb function was triggered");
exports.handler = async function (event, context) {
  const ip = event.queryStringParameters.ip;
  console.log("Proxying to IP:", ip);

  if (!ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing IP address" }),
    };
  }

  try {
    const res = await fetch(`http://${ip}/getusbdevices`);
    const text = await res.text();
    console.log("Response text:", text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
