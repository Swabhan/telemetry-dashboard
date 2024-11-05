import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  //Allows previous data features
  const [previousTelemetryData, setPreviousTelemetryData] = useState({}); 
  const [initialTelemetryData, setInitialTelemetryData] = useState({});

  //Time of data capture
  const [lastUpdated, setLastUpdated] = useState('');
  const [intervalTime, setIntervalTime] = useState(5);

  //To hold latest data
  const [telemetryData, setTelemetryData] = useState({});
  

  // Function to fetch telemetry data from the server
  const fetchTelemetryData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:2000/telemetry');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // On the first fetch, set the initial data
      if (Object.keys(initialTelemetryData).length === 0) {
        setInitialTelemetryData(data);
      }

      // Update previous data to current before setting new data
      setPreviousTelemetryData(telemetryData);

      //Set new data
      setTelemetryData(data);

      setLastUpdated(new Date().toLocaleString());

    } catch (error) {
      console.error('Error fetching telemetry data:', error);
    }
  };

  useEffect(() => {
    //Initial data fetch
    fetchTelemetryData();

    //Updats when intervalTime's value has passed in second
    const intervalId = setInterval(() => {
      fetchTelemetryData();
    }, intervalTime * 1000);

    //When unmounts
    return () => clearInterval(intervalId);
  }, [intervalTime]); //Rerun when intervalTime changes

  const sortedKeys = Object.keys(telemetryData).sort();

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="NavBar">
        <div className="Nav-logo">DRIFT</div>
        <ul className="Nav-links">
          <li><a href="/">Data</a></li>
          <li><a href="#help">Documentation</a></li>
        </ul>
      </nav>

      {/* Last Updated */}
      <div className="Last-updated">
        Last Updated: {lastUpdated}
      </div>

      {/* Update Interval Dropdown */}
      <div className="Update-interval">
        <label htmlFor="interval-select">Update every:</label>
        <select
          id="interval-select"
          value={intervalTime}
          onChange={(e) => setIntervalTime(Number(e.target.value))}
        >
          <option value={1}>1 second</option>
          <option value={3}>3 seconds</option>
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
          <option value={20}>20 seconds</option>
          <option value={30}>30 seconds</option>
        </select>
      </div>

      {/* Card Grid */}
      <header className="App-header">
        <div className="Card-grid">
          {sortedKeys.map((key) => {
            const currentValue = telemetryData[key];
            const previousValue = previousTelemetryData[key];
            const initialValue = initialTelemetryData[key];

            const changeFromLast = previousValue !== undefined
              ? (currentValue - previousValue).toFixed(2)
              : 'N/A'; 

            const changeFromStart = initialValue !== undefined
              ? (currentValue - initialValue).toFixed(2)
              : 'N/A';

            return (
              <div key={key} className="Card">
                <h3>{key}</h3>
                <p>{currentValue}</p>
                
                <p className="ChangeFromStart" style={{ fontSize: '0.8em', color: 'blue' }}>
                  Change from Start: {changeFromStart}
                </p>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
