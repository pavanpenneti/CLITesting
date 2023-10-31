
import React from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import './App.css';
import LogData from './Screens/components/LogData';
import FetchData from './Screens/components/ApiData';
import CLIData from './Screens/components/CLIData';

import SetDataFormat from './Screens/components/SetDataFormat';


function App() {

	
	return (
	<Router>
	
		
		<Routes>
				<Route exact path='/' Component={FetchData}></Route>
				
       			 <Route exact path='/apiData' Component={FetchData}></Route>
				
				<Route exact path='/logData' Component={LogData}></Route>
				<Route exact path='/cliData' Component={CLIData}></Route>
				<Route exact path='/setDataformat' Component={SetDataFormat}>

				
				</Route>
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
