import React, { useState, useEffect } from 'react';
import './App.css';

const Timeline = [];

function App() {
  const [previousTelemetryData, setPreviousTelemetryData] = useState({}); 
  const [initialTelemetryData, setInitialTelemetryData] = useState({});
  const [timeline, setTimeline] = useState(Timeline);
  const [totalItems, setTotalItems] = useState(timeline.length);
  const [numberOfActiveItems, setActiveItems] = useState(timeline.filter(o => o.active).length);
  const [progressBarWidth, setWidth] = useState(totalItems > 1 && numberOfActiveItems > 0 ? ((numberOfActiveItems - 1) / (totalItems - 1)) * 100 : 0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [intervalTime, setIntervalTime] = useState(5);
  const [telemetryData, setTelemetryData] = useState({});
  const [isPastMode, setIsPastMode] = useState(false);

  const fetchTelemetryData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:2000/telemetry');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      if (Object.keys(initialTelemetryData).length === 0) {
        setInitialTelemetryData(data);
      }

      if (!isPastMode) {
        setTelemetryData(prevData => {
          setPreviousTelemetryData(prevData);
          return data;
        });

        setTimeline(prevTimeline => {
          if (prevTimeline.length < 200) {
            const newTimeline = [...prevTimeline, { name: data["timestamp"], data: data }];
            setTotalItems(newTimeline.length);
            setActiveItems(newTimeline.filter(o => o.active).length);
            return newTimeline;
          } else {
            const newTimeline = [...prevTimeline.slice(1), { name: data["timestamp"], data: data }];
            setTotalItems(newTimeline.length);
            setActiveItems(newTimeline.filter(o => o.active).length);
            return newTimeline;
          }
        });
      }

      setLastUpdated(new Date().toLocaleString());
      
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    const intervalId = setInterval(() => {
      fetchTelemetryData();
    }, intervalTime * 1000);

    return () => clearInterval(intervalId);
  }, [intervalTime, isPastMode]);

  const sortedKeys = Object.keys(telemetryData).sort();

  function click(i) {
    setIsPastMode(true);
    setTelemetryData(timeline[i].data);
  }

  function goBackToLive() {
    setIsPastMode(false);
  }

  return (
    <div className="App">
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
              title={`Timestamp: ${item.name}`}  // This is the tooltip showing the timestamp
            >
            </div>
          ))}
        </div>
      </div>

      <div className="Last-updated">
        Last Updated: {lastUpdated}
      </div>

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

      {isPastMode && (
        <button 
          onClick={goBackToLive}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Back to Live Data
        </button>
      )}

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

            const isPositiveChange = changeFromLast > 0;
            const isNeutralChange = changeFromLast === "0.00";
            const changeColor = isPositiveChange ? 'green' : 'red';
            const arrow = isPositiveChange ? '↑' : '↓';

            return (
              <div key={key} className="Card">
                <h3>{key}</h3>
                <p>{currentValue.toFixed(4)}</p>

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
