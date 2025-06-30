exports.handler = async function (event, context) {
  const ip = event.queryStringParameters.ip;

  console.log("Function triggered for IP:", ip);

  if (!ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing IP address" }),
    };
  }

  try {
    const response = await fetch(`http://${ip}/getusbdevices`);
    const data = await response.text(); // Use .text() in case it's not valid JSON

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: data,
    };
  } catch (error) {
    console.error("Error in proxyusb:", error.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
