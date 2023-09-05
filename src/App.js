
import React, { Component } from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import './App.css';
import LogData from './Screens/components/LogData';
import FetchData from './Screens/components/ApiData';
import CLIData from './Screens/components/CLIData';

class App extends Component {
render() {
	return (
	<Router>
	
		
		<Routes>
				<Route exact path='/' Component={FetchData}></Route>
       			 <Route exact path='/apiData' Component={FetchData}></Route>
				
				<Route exact path='/logData' Component={LogData}></Route>
				<Route exact path='/cliData' Component={CLIData}></Route>
		</Routes>
		
	</Router>
);
}
}

export default App;
