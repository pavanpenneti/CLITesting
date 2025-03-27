
import React from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import './App.css';
import LogData from './Screens/components/LogData';
import FetchData from './Screens/components/ApiData';
import CLIData from './Screens/components/CLIData';
import LogDetail from './Screens/components/LogDetail';
import SetDataFormat from './Screens/components/SetDataFormat';
import DailyReport from './Screens/components/DailyReport';

import DiagnosticsTool from './Screens/components/DiagnosticsTool';
import LogDataNewProtocol from './Screens/components/LogDataNewProtocol';
import SetDataFormatNewProtocol from './Screens/components/SetDataFormatNewProtocol';
import FrequencyTable from './Screens/components/FrequencyTable';


function App() {

	
	return (
	<Router>
		<Routes>
				<Route exact path='/' Component={LogData}></Route>			
       			<Route exact path='/apiData' Component={FetchData}></Route>			
				<Route exact path='/logDataNewProtocol' Component={LogDataNewProtocol}></Route>		
				<Route exact path='/logData' Component={LogData}></Route>
				<Route exact path='/cliData' Component={CLIData}></Route>
				<Route exact path='/setDataformat' Component={SetDataFormat}></Route>
				<Route exact path='/SetDataFormatNewProtocol' Component={SetDataFormatNewProtocol}></Route>
				
				<Route exact path='/dailyReport' Component={DailyReport}></Route>
				FrequencyTable
				<Route exact path='/diagnosticstool' Component={DiagnosticsTool}></Route>
				<Route exact path='/logDataDetail' Component={LogDetail}></Route>
				<Route exact path='/frequencyTable' Component={FrequencyTable}></Route>
				
		</Routes>
	</Router>

	//  <OAModule/>
	// <AutoSuggestTextbox/>
// 	<div>
// 	<AutoSuggestTextbox
// 	  initialSuggestions={['192.168.1.170', '10.100.102.138', '10.100.102.23']}
	 
// 	  placeholder_name={"Enter IP Address"}
// 	/>
// 	{/* Render additional instances with different props */}
//   </div>
);
}


export default App;
