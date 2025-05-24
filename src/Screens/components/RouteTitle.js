import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const RouteTitle = () => {
const location = useLocation();
useEffect(() => {
const path = location.pathname;
let title = "@Pavan | ";
switch (path) {
case "/":
case "/logData":
title = "Log Data Validator";
break;
case "/logDataNewProtocol":
title = "Log Data Validator (New Protocol)";
break;
case "/apiData":
title = "API Data";
break;
case "/CLIData":
title = "CLI Data";
break;
case "/SetDataFormat":
title = "Set Data Format";
break;
case "/SetDataFormatNewProtocol":
title = "Set Data Format (New Protocol)";
break;
case "/dailyReport":
title = "Daily Report";
break;
case "/frequencyTable":
title = "Frequency Table";
break;
case "/diagnosticstool":
title = "Diagnostics Tool";
break;
case "/logDataDetail":
title = "Log Data Details";
break;
default:
title = "@Pavan QA Tool";
}
document.title = title;
}, [location]);
return null;
};
export default RouteTitle;