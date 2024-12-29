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

  return (
    <div className="container">
      <div className="list">
        <h2>Deine Bewerbungen</h2>
        <div className="header">
          <span>Deine Bewerbung</span>
          <span>Rückmeldung</span>
        </div>
        <ul>
          {bewerbungen.map((bewerbungEntry) => (
            <li
              key={bewerbungEntry.id}
              className="list-item"
              style={{
                color: feedback[bewerbungEntry.id] === 'positive' ? 'green' :
                       feedback[bewerbungEntry.id] === 'negative' ? 'red' : 'black',
              }}
              onMouseEnter={() => handleMouseEnter(bewerbungEntry.id)}
              onMouseLeave={handleMouseLeave}
            >
            <span>{bewerbungEntry.firmenname}</span>
            <span>{bewerbungEntry.jobtitel}</span>
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
                  <p>URL: <a href={bewerbungEntry.url} target="_blank" rel="noopener noreferrer">{bewerbungEntry.url}</a></p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="content">
        <h1>{message}</h1>
        <div className="input-container">
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