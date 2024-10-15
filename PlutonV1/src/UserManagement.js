
import React, { useState, useEffect, Fragment } from 'react';
import {
  Button, TextField, LinearProgress, IconButton, TableBody, Table, AppBar, Toolbar, Typography,
  TableContainer, TableHead, TableRow, TableCell, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, InputLabel, FormControl
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh'; // Added RefreshIcon
import moment from 'moment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
const API_URL = process.env.REACT_APP_API_URL; // For create-react-app


const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenWidth;
};

const useColumns = (products) => {
  const screenWidth = useScreenWidth();
  const numColumns = Math.min(Math.floor((screenWidth - 25) / 75), 15);
  const visibleColumns = products.length > 0 ? Object.keys(products[0]).slice(0, numColumns) : [];

  return { numColumns, visibleColumns };
};

function formatDate(date) {
  const dateObj = new Date(date);
  const formattedDate = moment(dateObj).format('DD-MM-YYYY');
  return formattedDate;
}


const UserManagement = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const { numColumns, visibleColumns } = useColumns(users);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedRole, setEditedRole] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
    } else {
      setToken(token);
      getUsers(token, page, search);
    }
  }, [navigate, page, search]);

  const getUsers = (token, page, search) => {
    setLoading(true);
    let data = `?page=${page}`;
    if (search) {
      data = `${data}&search=${search}&searchFields=username,role`;
    }

    axios.get(`${API_URL}/get-users${data}`, {
      headers: { token }
    }).then((res) => {
      setLoading(false);
      setUsers(res.data.users);
      setPages(res.data.pages);
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      setLoading(false);
      setUsers([]);
      setPages(0);
    });
  };

  const pageChange = (e, page) => {
    setPage(page);
  };

  const logOut = () => {
    localStorage.setItem('token', null);
    navigate("/");
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditedUsername(user.username);
    setEditedRole(user.role);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    axios.put(`${API_URL}/edit-user/${editingUser._id}`, {
      username: editedUsername,
      role: editedRole
    })
      .then((res) => {
        swal({
          text: res.data.message,
          icon: "success",
          type: "success"
        });
        const updatedUsers = users.map((user) => {
          if (user._id === editingUser._id) {
            return { ...user, username: editedUsername, role: editedRole };
          }
          return user;
        });
        setUsers(updatedUsers);
        setEditDialogOpen(false);
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error"
        });
      });
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
    setEditedUsername('');
    setEditedRole('');
  };

  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleSaveAdd = () => {
    axios.post(`${API_URL}/register`, {
      username: newUsername,
      role: newRole,
    }).then((res) => {
      swal({
        text: res.data.message,
        icon: "success",
        type: "success"
      });
      getUsers(token, page, search);
      setAddDialogOpen(false);
      setNewUsername('');
      setNewRole('');
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewUsername('');
    setNewRole('');
  };

  const handleDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this user!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios.delete(`${API_URL}/delete-user/${id}`, {
          headers: { token }
        }).then((res) => {
          swal("User has been deleted!", {
            icon: "success",
          });
          getUsers(token, page, search);
        }).catch((err) => {
          swal({
            text: err.response.data.errorMessage,
            icon: "error",
            type: "error"
          });
        });
      }else {
        swal("No deletion occured");
      
      }
    });
  };

  const handleResetPassword = (username) => {
    const newPassword = username + '123';
    axios.post(`${API_URL}/api/re-password`, {
      username: username,
      newPassword: newPassword
    }).then((res) => {
      swal({
        text: res.data.message,
        icon: "success",
        type: "success"
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  };

  return (
    <div>
      <Dialog open={editDialogOpen}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          // Show a confirmation dialog when the user clicks outside the dialog
          if (newUsername || newRole) {
            // Check if any of the input fields have values
            swal({
              title: "Discard changes?",
              text: "Are you sure you want to discard your changes?",
              icon: "warning",
              buttons: true,
              dangerMode: true,
            }).then((willClose) => {
              if (willClose) {
                handleAddDialogClose();
              }
            });
          } else {
            handleAddDialogClose();
          }
        } else {
          handleAddDialogClose();
        }
      }}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={editedUsername}
            onChange={(e) => setEditedUsername(e.target.value)}
          />
          <TextField
            label="Role"
            value={editedRole}
            onChange={(e) => setEditedRole(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
          <Button onClick={handleEditDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen}
  onClose={(event, reason) => {
    if (reason === 'backdropClick') {
      // Show a confirmation dialog when the user clicks outside the dialog
      if (newUsername || newRole) {
        // Check if any of the input fields have values
        swal({
          title: "Discard changes?",
          text: "Are you sure you want to discard your changes?",
          icon: "warning",
          buttons: true,
          dangerMode: true,
        }).then((willClose) => {
          if (willClose) {
            handleAddDialogClose();
          }
        });
      } else {
        handleAddDialogClose();
      }
    } else {
      handleAddDialogClose();
    }
  }}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superuser">Superuser</MenuItem>
              <MenuItem value="tester">Tester</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveAdd} color="primary">Save</Button>
          <Button onClick={handleAddDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>

      <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
        <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
    <ArrowBackIcon />
  </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            User Management
          </Typography>
        </Toolbar>
      </AppBar>
      {loading && <LinearProgress />}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
        <TextField
          placeholder="search by username/role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <TableContainer style={{ maxWidth: '400px', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Button
            variant="contained"
            color="#2b2b2b"
            onClick={handleAdd}
            style={{ fontSize: '0.6rem', minWidth: '90px' }}
          >
            + add user
          </Button>
          <TableContainer style={{ width: '80%' }}>
            <Table>
              {/* Table content here */}
            </Table>
          </TableContainer>
        </div>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>Sl no.</TableCell> {/* Serial number column */}
              <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell> {/* Username column */}
              <TableCell style={{ fontWeight: 'bold' }}>Role</TableCell> {/* Role column */}
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell> {/* Actions column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <Fragment key={index}>
                <TableRow>
                  <TableCell>{(page - 1) * 10 + index + 1}</TableCell> {/* Calculate serial number */}
                  {visibleColumns.map((column, colIndex) => {
                    if (column !== '_id') {
                      return (
                        <TableCell key={colIndex}>
                          {column === 'createdAt' ? formatDate(user[column]) : user[column]}
                        </TableCell>
                      );
                    }
                    return null; // Exclude _id column
                  })}
                  <TableCell width = "250px">
                    <IconButton size="small" onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleResetPassword(user.username)}> {/* Added Reset Password IconButton */}
                      <RefreshIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {expanded[index] && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      {/* You can add more detailed user info here if needed */}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={pages}
        page={page}
        onChange={pageChange}
        color="primary"
      />
    </div>
  );
};

export default UserManagement;



