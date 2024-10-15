import React, { Component } from "react";
import swal from "sweetalert";
import { Button, Link, TextField, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { withRouter } from "./utils";
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL; // For create-react-app

const LoginCard = {
  background: "linear-gradient(to right,#FFFFFF, #FFFFFF)",
  color: "#fff",
  padding: "20px",
  borderRadius: "4px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 0 10px 2px rgba(0, 0, 0, 0.5)"
  }
};

const GradientBackground = {
  background: "linear-gradient(to right,#E5E4E2,#E5E4E2)",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const TextFieldStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#2b2b2b",
      color: "#2b2b2b"
    },
    "&:hover fieldset": {
      borderColor: "#2b2b2b",
      color: "#2b2b2b"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2b2b2b",
      color: "#2b2b2b"
    }
  }
};

const LoginButton = {
  backgroundColor: "#2b2b2b",
  color: "#FFFFFF",
  borderRadius: "4px",
  padding: "4px 18px",
  textTransform: "none",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#b92b27"
  }
};

const RegisterLink = {
  color: "#2b2b2b",
  textDecoration: "none",
  padding: "8px 24px",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#00ff7f"
  }
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showPasswordChangeDialog: false,
      showPasswordResetDialog: false
    };
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  login = () => {
    const { username, password } = this.state;
  
    axios.post(`${API_URL}/login`, {
      username,
      password
    })
    .then((res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.id);
      if (res.data.isFirstLogin) {
        this.setState({ showPasswordChangeDialog: true });
      } else {
        this.redirectUser(res.data.role);
      }
    })
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errorMessage) {
        swal({
          text: err.response.data.errorMessage,
          icon: 'error',
          type: 'error'
        });
      } else {
        swal({
          text: 'An error occurred!',
          icon: 'error',
          type: 'error'
        });
      }
      this.props.navigate('/');
    });
  };

  redirectUser = (role) => {
    if (role === 'admin') {
      this.props.navigate('/AdminDashboard');
    } else if (role === 'superuser') {
      this.props.navigate('/dashboard');
    } else {
      this.props.navigate('/tester');
    }
  };

  resetPassword = () => {
    const { username, oldPassword, newPassword, confirmPassword } = this.state;
    if (newPassword !== confirmPassword) {
      swal({
        text: 'Passwords do not match!',
        icon: 'error',
        type: 'error'
      });
      return;
    }

    axios.post(`${API_URL}/reset-password`, {
      username,
      oldPassword,
      newPassword
    }).then((res) => {
      swal({
        text: 'Password reset successfully.',
        icon: 'success',
        type: 'success'
      });
      this.setState({ showPasswordResetDialog: false });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: 'error',
        type: 'error'
      });
    });
  };

  render() {
    return (    
      <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>&nbsp; PLUTON </h3>
        <h5>version 1.0.0 &nbsp; </h5>
      </div>
      <div style={GradientBackground}>                
        <Box sx={LoginCard}>          
        <h2> Login </h2>
          <TextField 
            id="filled-basic"
            type="username"
            autoComplete="off"
            name="username"
            value={this.state.username}
            onChange={this.onChange}
            placeholder="Username"
            required
            variant="outlined"
            size="small"
            focused={this.state.focused}
            error={this.state.error}
            InputLabelProps={{ style: { color: "#2b2b2b" } }}
            inputProps={{ style: { color: "#2b2b2b",borderColor: "#2b2b2b" } }}
          />
          <br /><br/>
          <TextField
            sx={TextFieldStyle}
            id="filled-basic"
            type="password"
            autoComplete="off"
            name="password"
            value={this.state.password}
            onChange={this.onChange}
            placeholder="Password"
            variant="outlined"
            size="small"
            focused={this.state.focused}
            error={this.state.error}
            InputLabelProps={{ style: { color: "#2b2b2b" } }}
            inputProps={{ style: { color: "#2b2b2b" } }}
            required
          />
          <br /><br/>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              className="button_style"
              variant="contained"
              color="primary"
              size="small"
              disabled={this.state.username === '' || this.state.password === ''}
              onClick={this.login}
              style={LoginButton}
            >
              Login
            </Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {/* <Link
              component="button"
              style={RegisterLink}
              onClick={() => {
                this.props.navigate("/register");
              }}
            >
              Register
            </Link> */}
            <Link
              component="button"
              style={RegisterLink}
              onClick={() => this.setState({ showPasswordResetDialog: true })}
            >
              Change Password
            </Link>
          </div>
        </Box>
        <Dialog open={this.state.showPasswordResetDialog} onClose={() => this.setState({ showPasswordResetDialog: false })}>
  <DialogTitle>Reset Password</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Please enter your username, current password, and the new password.
    </DialogContentText>
    <TextField
      margin="dense"
      label="Username"
      type="text"
      fullWidth
      name="username"
      value={this.state.username}
      onChange={this.onChange}
    />
    <TextField
      margin="dense"
      label="Old Password"
      type="password"
      fullWidth
      name="oldPassword"
      value={this.state.oldPassword}
      onChange={this.onChange}
    />
    <TextField
      margin="dense"
      label="New Password"
      type="password"
      fullWidth
      name="newPassword"
      value={this.state.newPassword}
      onChange={this.onChange}
    />
    <TextField
      margin="dense"
      label="Confirm New Password"
      type="password"
      fullWidth
      name="confirmPassword"
      value={this.state.confirmPassword}
      onChange={this.onChange}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => this.setState({ showPasswordResetDialog: false })} color="secondary">
      Cancel
    </Button>
    <Button onClick={this.resetPassword} color="primary">
      Reset Password
    </Button>
  </DialogActions>
</Dialog>

        {/* <Dialog open={this.state.showPasswordResetDialog} onClose={() => this.setState({ showPasswordResetDialog: false })}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your username, current password, and the new password.
            </DialogContentText>
            <TextField
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              name="username"
              value={this.state.username}
              onChange={this.onChange}
            />
            <TextField
              margin="dense"
              label="Old Password"
              type="password"
              fullWidth
              name="oldPassword"
              value={this.state.oldPassword}
              onChange={this.onChange}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              name="newPassword"
              value={this.state.newPassword}
              onChange={this.onChange}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              name="confirmPassword"
              value={this.state.confirmPassword}
              onChange={this.onChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.resetPassword} color="primary">
              Reset Password
            </Button>
          </DialogActions>
        </Dialog> */}
      </div>
      </>
    );
  }
}

export default withRouter(Login);
