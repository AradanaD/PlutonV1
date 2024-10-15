import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress
} from '@material-ui/core';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL; // For create-react-app


const Profile = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('User not logged in!');
      return;
    }
  
    setLoading(true);
  
    axios.get(`${API_URL}/get-user`, {
      headers: { 'Authorization': `Bearer ${token}` },
      withCredentials: true
    })
    .then(response => {
      setLoading(false);
      if (response.data && response.data.user) {
        const { username, role } = response.data.user;
        setUsername(username);
        setRole(role);
      } else {
        setErrorMessage('Failed to fetch user profile');
      }
    })
    .catch(error => {
      setLoading(false);
      console.error('Error fetching user profile:', error);
      setErrorMessage('Failed to fetch user profile');
    });
  };
  

  const handlePasswordChange = () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    const token = localStorage.getItem('token');
    axios.post(`${API_URL}/change-password`, { newPassword }, {
      headers: { 'Authorization': token },
      withCredentials: true
    })
      .then(response => {
        setSuccessMessage('Password changed successfully!');
        setErrorMessage('');
        setOpenDialog(false);
      })
      .catch(error => {
        console.error('Error changing password:', error);
        setErrorMessage('Failed to change password!');
      });
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'newPassword') setNewPassword(value);
    else if (name === 'confirmNewPassword') setConfirmNewPassword(value);
  }

  const handleClickOpen = () => {
    setOpenDialog(true);
  }

  const handleClose = () => {
    setOpenDialog(false);
  }

  return (
    <div>
      {loading && <LinearProgress />}
      <Paper style={{ padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
        <Typography variant="h6">Profile</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Field</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>{username}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>{role}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
          style={{ marginTop: '20px' }}
        >
          Change Password
        </Button>
        {errorMessage && <Typography color="error" style={{ marginTop: '20px' }}>{errorMessage}</Typography>}
        {successMessage && <Typography color="primary" style={{ marginTop: '20px' }}>{successMessage}</Typography>}
      </Paper>
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            value={newPassword}
            margin="normal"
            fullWidth
            onChange={handleChange}
          />
          <TextField
            label="Confirm New Password"
            name="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            margin="normal"
            fullWidth
            onChange={handleChange}
          />
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          {successMessage && <Typography color="primary">{successMessage}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handlePasswordChange} color="primary">Change Password</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Profile;
