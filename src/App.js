// //import logo from './logo.svg';
// import './App.css';
// import FilterData from './Screens/FilterData';
// import LogData from './Screens/LogData';


// function App() {
//   return (
//     <div className="App">
//       <LogData/>
//       {/* <FilterData/> */}
//     </div>
//   );
// }

// export default App;

import React, { Component } from 'react';
import { BrowserRouter as Router,Routes, Route, Link } from 'react-router-dom';

import About from './Screens/components/CLIData';
import Contact from './Screens/components/ApiData';
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
