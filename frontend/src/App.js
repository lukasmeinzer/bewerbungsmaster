import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [bewerbungen, setBewerbungen] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [inputUsername, setInputUsername] = useState('');

  useEffect(() => {
    if (username) {
      fetch(`http://localhost:8000/bewerbungen?username=${username}`)
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
    }
  }, [username]);

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleUrlSubmit = () => {
    fetch('http://localhost:8000/submit-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, username }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        setUrl('');
        // Fetch the updated list of URLs
        fetch(`http://localhost:8000/bewerbungen?username=${username}`)
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

  const handleUsernameChange = (event) => {
    setInputUsername(event.target.value);
  };

  const handleUsernameSubmit = () => {
    localStorage.setItem('username', inputUsername);
    setUsername(inputUsername);
  };

  if (!username) {
    return (
      <div className="username-container">
        <span>Gib hier deinen Nutzernamen ein.</span>
        <span>Nutze etwas einfaches, da du dich hiermit identifizieren wirst.</span>
        <input
          type="text"
          value={inputUsername}
          onChange={handleUsernameChange}
          placeholder="Enter your username"
        />
        <button onClick={handleUsernameSubmit}>Submit</button>
      </div>
    );
  }

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
        <h1>Bewerbungsmaster</h1>
        <h3>Gib im untenstehenden Eingabefeld die URL zur ausgeschriebenen Stelle ein.</h3>
        <span>(Linkedin URLs funktionieren nicht)</span>
        <div className="input-container">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter URL"
          />
          <button onClick={handleUrlSubmit}>Confirm</button>
        </div>
      </div>
      <div className="username-display">
        Username: {username}
      </div>
    </div>
  );
}

export default App;