
import React from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import './App.css';
import LogData from './Screens/components/LogData';
import FetchData from './Screens/components/ApiData';
import CLIData from './Screens/components/CLIData';

import SetDataFormat from './Screens/components/SetDataFormat';
import DailyReport from './Screens/components/DailyReport';
import snmpData from './Screens/components/snmpData';
import SnmpData from './Screens/components/snmpData';


function App() {

	
	return (
	<Router>
	
		
		<Routes>
				<Route exact path='/' Component={FetchData}></Route>
				
       			 <Route exact path='/apiData' Component={FetchData}></Route>
				
				<Route exact path='/logData' Component={LogData}></Route>
				<Route exact path='/cliData' Component={CLIData}></Route>
				<Route exact path='/setDataformat' Component={SetDataFormat}></Route>
				<Route exact path='/dailyReport' Component={DailyReport}></Route>
				<Route exact path='/snmpData' Component={SnmpData}></Route>
				
				
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
