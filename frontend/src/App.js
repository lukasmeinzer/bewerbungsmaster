import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [bewerbungen, setBewerbungen] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message));

    fetch('http://localhost:8000/bewerbungen')
      .then(response => response.json())
      .then(data => {
        setBewerbungen(data);
        const initialFeedback = {};
        data.forEach(bewerbungEntry => {
          if (bewerbungEntry.rückmeldung_positiv) {
            initialFeedback[bewerbungEntry.id] = 'positive';
          } else if (bewerbungEntry.rückmeldung_negativ) {
            initialFeedback[bewerbungEntry.id] = 'negative';
          } else {
            initialFeedback[bewerbungEntry.id] = '';
          }
        });
        setFeedback(initialFeedback);
      });
  }, []);

  const handleInputChange = (event) => {
    setUrl(event.target.value);
  };

  const handleConfirmClick = () => {
    fetch('http://localhost:8000/submit-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        setUrl('');
        // Fetch the updated list of URLs
        fetch('http://localhost:8000/bewerbungen')
          .then(response => response.json())
          .then(data => {
            setBewerbungen(data);
            const initialFeedback = {};
            data.forEach(bewerbungEntry => {
              if (bewerbungEntry.rückmeldung_positiv) {
                initialFeedback[bewerbungEntry.id] = 'positive';
              } else if (bewerbungEntry.rückmeldung_negativ) {
                initialFeedback[bewerbungEntry.id] = 'negative';
              } else {
                initialFeedback[bewerbungEntry.id] = '';
              }
            });
            setFeedback(initialFeedback);
          });
      });
  };

  const handleDropdownChange = (id, event) => {
    const value = event.target.value;
    setFeedback(prevFeedback => ({
      ...prevFeedback,
      [id]: value,
    }));
    console.log(`URL ID: ${id}, Rückmeldung: ${value}`);

    // Send the selected value to the backend
    fetch('http://localhost:8000/update-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, feedback: value }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
      });
  };

  const handleMouseEnter = (id) => {
    const timeout = setTimeout(() => {
      setHoveredItem(id);
    }, 1200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
  };

  const listStyle = {
    width: '30%',
    padding: '20px',
    borderRight: '1px solid #ccc',
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    textAlign: 'center',
  };

  const inputContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100vh',
    textAlign: 'center',
    paddingTop: '100px',
  };

  const listItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    padding: '10px 0',
  };

  return (
    <div style={containerStyle}>
      <div style={listStyle}>
        <h2>Deine Bewerbungen</h2>
        <div style={headerStyle}>
          <span>Bewerbung</span>
          <span>Rückmeldung</span>
        </div>
        <ul>
          {bewerbungen.map((bewerbungEntry) => (
            <li
              key={bewerbungEntry.id}
              className="list-item"
              style={{
                ...listItemStyle,
                color: feedback[bewerbungEntry.id] === 'positive' ? 'green' :
                       feedback[bewerbungEntry.id] === 'negative' ? 'red' : 'black',
              }}
              onMouseEnter={() => handleMouseEnter(bewerbungEntry.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* <span>{bewerbungEntry.firmenname}: {bewerbungEntry.jobtitel}</span> */}
              <span>placeholder1: placeholder2</span>
              <select
                value={feedback[bewerbungEntry.id] || ''}
                onChange={(event) => handleDropdownChange(bewerbungEntry.id, event)}
              >
                <option value=""></option>
                <option value="positive">positive Rückmeldung</option>
                <option value="negative">negative Rückmeldung</option>
              </select>
              {hoveredItem === bewerbungEntry.id && (
                <div className="details">
                  <p>Beworben am: {bewerbungEntry.beworben_am}</p>
                  <p>Ort: {bewerbungEntry.ort}</p>
                  <p>Rückmeldung erhalten: {bewerbungEntry.rückmeldung_erhalten ? 'Ja' : 'Nein'}</p>
                  <p>Rückmeldung erhalten am: {bewerbungEntry.rückmeldung_erhalten_am}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={contentStyle}>
        <h1>{message}</h1>
        <div style={inputContainerStyle}>
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter URL"
          />
          <button onClick={handleConfirmClick}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default App;