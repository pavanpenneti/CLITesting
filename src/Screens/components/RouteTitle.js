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
title = "@Pavan | Log Data Validator";
break;
case "/logDataNewProtocol":
title = "@Pavan | Log Data Validator (New Protocol)";
break;
case "/apiData":
title = "@Pavan | API Data";
break;
case "/CLIData":
title = "@Pavan | CLI Data";
break;
case "/SetDataFormat":
title = "@Pavan | Set Data Format";
break;
case "/SetDataFormatNewProtocol":
title = "@Pavan | Set Data Format (New Protocol)";
break;
case "/dailyReport":
title = "@Pavan | Daily Report";
break;
case "/frequencyTable":
title = "@Pavan | Frequency Table";
break;
case "/diagnosticstool":
title = "@Pavan | Diagnostics Tool";
break;
case "/logDataDetail":
title = "@Pavan | Log Data Details";
break;
case "/SetAPIData":
title = "@Pavan | SET & GET API Data";
break;
default:
title = "@Pavan QA Tool";
}
document.title = title;
}, [location]);
return null;
};
export default RouteTitle;