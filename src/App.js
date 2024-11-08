import React, { useState, useEffect } from 'react';
import './App.css';

// var Timeline = [];

const Timeline = [];

function App() {
  //Allows previous data features
  const [previousTelemetryData, setPreviousTelemetryData] = useState({}); 
  const [initialTelemetryData, setInitialTelemetryData] = useState({});

  //Timeline
  const [timeline, setTimeline] = useState(Timeline);
  const [totalItems, setTotalItems] = useState(timeline.length);
  const [numberOfActiveItems, setActiveItems] = useState(timeline.filter(o => o.active).length);
  const [progressBarWidth, setWidth] = useState(totalItems > 1 && numberOfActiveItems > 0  ? ((numberOfActiveItems - 1) / (totalItems - 1)) * 100 : 0);
  

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

      // // Update previous data to current before setting new data
      setTelemetryData(prevData => {
        setPreviousTelemetryData(prevData);
        return data;
      });

      //Update Timeline
      setLastUpdated(new Date().toLocaleString());
      
      // Update timeline using the state setter
      setTimeline(prevTimeline => {
        if (prevTimeline.length < 120) {
          const newTimeline = [...prevTimeline, { name: data["timestamp"], data: data }];
          setTotalItems(newTimeline.length);
          setActiveItems(newTimeline.filter(o => o.active).length);
          return newTimeline;
        }
        return prevTimeline;
      });
      

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

  function click(i){
    console.log(timeline[i]);
  }

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

    
      <div className="timeline">
        <div
          className="timeline-progress"
          style={{ width: `${progressBarWidth}%` }}
        />
        <div className="timeline-items">
          {timeline.map((item, i) => (
            <div
              key={i}
              className={"timeline-item" + (item.active ? " active" : "")}
              onClick={() => click(i)}
            >
            </div>
          ))}
        </div>
      </div>

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

          // Determine arrow direction, color, and visibility for changeFromLast
          const isPositiveChange = changeFromLast > 0;
          const isNeutralChange = changeFromLast === "0.00";
          const changeColor = isPositiveChange ? 'green' : 'red';
          const arrow = isPositiveChange ? '↑' : '↓';

          return (
            <div key={key} className="Card">
              <h3>{key}</h3>
              <p>{currentValue.toFixed(4)}</p>

              {/* Change From Last Indicator (only if non-neutral) */}
              {!isNeutralChange && changeFromLast !== 'N/A' && (
                <p
                  className="ChangeFromLast"
                  style={{
                    color: changeColor,
                  }}
                >
                  {arrow} {changeFromLast}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </header>

    </div>
  );
}

export default App;
