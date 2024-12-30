import React, { useEffect, useState } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [url, setUrl] = useState('');
  const [bewerbungen, setBewerbungen] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [inputUsername, setInputUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    if (username) {
      fetch(`http://87.106.165.63:8000/bewerbungen?username=${username}`)
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
    fetch('http://87.106.165.63:8000/submit-url', {
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
        fetch(`http://87.106.165.63:8000/bewerbungen?username=${username}`)
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
    fetch('http://87.106.165.63:8000/update-feedback', {
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

  const handleErrorButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setComplaint("");
  };

  const handleComplaintChange = (event) => {
    setComplaint("");
    setComplaint(event.target.value);
  };

  const handleComplaintSubmit = () => {
    fetch('http://87.106.165.63:8000/submit-complaint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, complaint }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Complaint submitted:', data);
        setIsModalOpen(false);
        setComplaint("");
      });
  };

  const handleDeleteClick = (id) => {
    fetch(`http://87.106.165.63:8000/delete-bewerbung/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Bewerbung deleted:', data);
        setBewerbungen(bewerbungen.filter(bewerbung => bewerbung.id !== id));
      });
  };

  if (!username) {
    return (
      <div className="username-container">
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
          <button className="error-button" onClick={handleErrorButtonClick}>Etwas funktioniert nicht?</button>
        </div>
      </div>
      <div className="username-display">
        Username: {username}
      </div>
      <div className="list">
        <h2>Deine Bewerbungen du huso</h2>
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
              <i
                className="fas fa-trash-alt delete-icon"
                onClick={() => handleDeleteClick(bewerbungEntry.id)}
                ></i>
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
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Problem einreichen</h2>
            <h5>(max. 500 Zeichen)</h5>
            <textarea
              value={complaint}
              onChange={handleComplaintChange}
              placeholder="Beschreiben Sie Ihr Problem"
              />
            <br />
            <button onClick={handleComplaintSubmit}>Absenden</button>
            <button onClick={handleModalClose}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;