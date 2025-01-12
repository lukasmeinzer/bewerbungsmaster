import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import theme from './theme';
import './App.css';
 
function App() {
  const [url, setUrl] = useState('');
  const [bewerbungen, setBewerbungen] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredDetails, setHoveredDetails] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [inputUsername, setInputUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaint, setComplaint] = useState('');

  let API_BASE_URL;

  if (process.env.NODE_ENV === "development") {
    API_BASE_URL = process.env.REACT_APP_BASE_URL_dev;
  } else if (process.env.NODE_ENV === "production") {
    API_BASE_URL = process.env.REACT_APP_BASE_URL_prod;
  } else {
    console.error("NODE_ENV not set or not recognized. No API URL!!!");
  }

  useEffect(() => {
    if (username) {
      fetch(`${API_BASE_URL}bewerbungen?username=${username}`)
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
    fetch(`${API_BASE_URL}submit-url`, {
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
        fetch(`${API_BASE_URL}bewerbungen?username=${username}`)
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
    fetch(`${API_BASE_URL}update-feedback`, {
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
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredItem(id);
    }, 1200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (!hoveredDetails) {
      clearTimeout(hoverTimeout);
      setHoveredItem(null);
    }
  };
  
  // To keep the details open when the mouse is over the details field
  const handleDetailsMouseEnter = () => {
    setHoveredDetails(true);
  };
  
  const handleDetailsMouseLeave = () => {
    setHoveredDetails(false);
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
    console.log(`API_BASE_URL = ${API_BASE_URL}`)
    console.log(`process.env = ${process.env.REACT_APP_API_BASE_URL}`)
    fetch(`${API_BASE_URL}submit-complaint`, {
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
    fetch(`${API_BASE_URL}delete-bewerbung/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      console.log('Bewerbung deleted:', data);
      setBewerbungen(bewerbungen.filter(bewerbung => bewerbung.id !== id));
    });
  };
  
  const handleLogoutClick = () => {
    localStorage.setItem('username', "");
    setUsername("");
    setInputUsername("");
  };
  
  if (!username) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '20vh' }}>
          <TextField
            label="Enter your username"
            value={inputUsername}
            onChange={handleUsernameChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleUsernameSubmit}>
            Submit
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Typography variant="h1" align="center" gutterBottom>
          Bewerbungsübersicht
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          Gib im untenstehenden Eingabefeld die URL zur ausgeschriebenen Stelle ein.
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          (Linkedin URLs funktionieren nicht)
        </Typography>
        <div className="input-container">
          <TextField
            label="Enter URL"
            value={url}
            onChange={handleUrlChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleUrlSubmit}>
            Confirm
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleErrorButtonClick}>
            Etwas funktioniert nicht?
          </Button>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Unternehmen</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jobtitle</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Feedback</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
      {bewerbungen.map((bewerbungEntry) => (
        <React.Fragment key={bewerbungEntry.id}>
          <TableRow
            onMouseEnter={() => handleMouseEnter(bewerbungEntry.id)}
            onMouseLeave={handleMouseLeave}
            style={{
              backgroundColor:
                feedback[bewerbungEntry.id] === 'positive'
                  ? '#e6f7e6' // Light green
                  : feedback[bewerbungEntry.id] === 'negative'
                  ? '#fdecec' // Light red
                  : 'transparent',
            }}
          >
            <TableCell>{bewerbungEntry.firmenname}</TableCell>
            <TableCell>{bewerbungEntry.jobtitel}</TableCell>
            <TableCell>
              <FormControl fullWidth>
                <Select
                  value={feedback[bewerbungEntry.id] || ''}
                  onChange={(event) => handleDropdownChange(bewerbungEntry.id, event)}
                >
                  <MenuItem value=""></MenuItem>
                  <MenuItem value="positive">positive Rückmeldung</MenuItem>
                  <MenuItem value="negative">negative Rückmeldung</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteClick(bewerbungEntry.id)}
              >
                Entfernen
              </Button>
            </TableCell>
          </TableRow>

          {/* Display additional details when hovering */}
          {hoveredItem === bewerbungEntry.id && (
            <div
            className="details"
            onMouseEnter={handleDetailsMouseEnter}
            onMouseLeave={handleDetailsMouseLeave}
          >
            <table>
              <tbody>
                <tr>
                  <td><strong>Beworben am:</strong></td>
                  <td>{bewerbungEntry.beworben_am}</td>
                </tr>
                <tr>
                  <td><strong>Ort:</strong></td>
                  <td>{bewerbungEntry.ort}</td>
                </tr>
                <tr>
                  <td><strong>Rückmeldung erhalten:</strong></td>
                  <td>{bewerbungEntry.rückmeldung_erhalten ? 'Ja' : 'Nein'}</td>
                </tr>
                <tr>
                  <td><strong>Rückmeldung erhalten am:</strong></td>
                  <td>{bewerbungEntry.rückmeldung_erhalten_am}</td>
                </tr>
                <tr>
                  <td><strong>URL:</strong></td>
                  <td><a href={bewerbungEntry.url} target="_blank" rel="noopener noreferrer">{bewerbungEntry.url}</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </React.Fragment>
      ))}
    </TableBody>
          </Table>
        </TableContainer>
      </Container>
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
      
      <Box className="flex-container">
        <Typography className="username-text">
          Username: {username}
        </Typography>

        <Button className="logout-button" onClick={handleLogoutClick}>
          Ausloggen
        </Button>
      </Box>
    </ThemeProvider>

  );
}

export default App;