import React, { Component } from "react";
import swal from "sweetalert";
import { Button, TextField, Box } from "@material-ui/core";
import { withRouter } from "./utils";
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL; // For create-react-app


const GradientBackground = {
  background: "linear-gradient(to right,#E5E4E2,#E5E4E2)",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const ChangePasswordCard = {
  backgroundColor: "#FFFFFF",
  color: "#fff",
  padding: "20px",
  borderRadius: "4px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 0 10px 2px rgba(0, 0, 0, 0.5)"
  }
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

const ChangePasswordButton = {
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

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: '',
      confirmPassword: ''
    };
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  changePassword = () => {
    const { newPassword, confirmPassword } = this.state;
    const userId = localStorage.getItem('user_id');

    if (newPassword === confirmPassword) {
      axios.post(`${API_URL}/change-password`, {
        userId,
        newPassword
      }).then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success"
        });
        this.props.navigate("/login");
      }).catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error"
        });
      });
    } else {
      swal({
        text: "Passwords do not match!",
        icon: "error",
        type: "error"
      });
    }
  };

  render() {
    return (
      <div style={GradientBackground}>
        <Box sx={ChangePasswordCard}>
          <h2>Change Password</h2>
          <TextField 
            id="filled-basic"
            type="password"
            autoComplete="off"
            name="newPassword"
            value={this.state.newPassword}
            onChange={this.onChange}
            placeholder="New Password"
            required
            variant="outlined"
            size="small"
            focused={this.state.focused}
            error={this.state.error}
            InputLabelProps={{ style: { color: "#2b2b2b" } }}
            inputProps={{ style: { color: "#2b2b2b" } }}
          />
          <br /><br/>
          <TextField
            sx={TextFieldStyle}
            id="filled-basic"
            type="password"
            autoComplete="off"
            name="confirmPassword"
            value={this.state.confirmPassword}
            onChange={this.onChange}
            placeholder="Confirm Password"
            variant="outlined"
            size="small"
            focused={this.state.focused}
            error={this.state.error}
            InputLabelProps={{ style: { color: "#2b2b2b" } }}
            inputProps={{ style: { color: "#2b2b2b" } }}
            required
          />
          <br /><br/>
          
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              className="button_style"
              variant="contained"
              color="primary"
              size="small"
              disabled={this.state.newPassword === '' && this.state.confirmPassword === ''}
              onClick={this.changePassword}
              style={ChangePasswordButton}
            >
              Change Password
            </Button>
          </div>
        </Box>
      </div>
    );
  }
}

export default withRouter(ChangePassword);
