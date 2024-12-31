import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import theme from './theme';
import './App.css';

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
          Bewerbungsmaster
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
        <Typography variant="body2" align="right" gutterBottom>
          Username: {username}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unternehmen</TableCell>
                <TableCell>Jobtitle</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bewerbungen.map((bewerbungEntry) => (
                <TableRow key={bewerbungEntry.id}>
                  <TableCell>{bewerbungEntry.firmenname}</TableCell>
                  <TableCell>{bewerbungEntry.jobtitel}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Feedback</InputLabel>
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
                    <Button variant="contained" color="secondary" onClick={() => handleDeleteClick(bewerbungEntry.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
}

export default App;