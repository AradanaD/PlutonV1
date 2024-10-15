import React, { Component } from "react";
import swal from "sweetalert";
import { Button, TextField, Link, Box, Select, MenuItem, InputLabel, FormControl } from "@material-ui/core";
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

const RegisterCard = {
  backgroundColor: "#FFFFFF",
  color: "#fff",
  padding: "20px",
  borderRadius: "4px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 0 10px 2px rgba(0, 0, 0, 0.5)" // Change the color to your preference
  }
};

const RegisterText = {
  color: "#00b3ff",
  marginBottom: "20px"
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

const RegisterButton = {
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

const LoginLink = {
  color: "#2b2b2b",
  textDecoration: "none",
  padding: "8px 24px",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#2b2b2b"
  }
};

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      role: '',
    };
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  register = () => {
    axios.post(`${API_URL}/register`, {
      username: this.state.username,
      role: this.state.role,
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.props.navigate("/");
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  render() {
    return (
      <div style={GradientBackground}>
        <Box sx={RegisterCard}>
          <h2> Register </h2>
          <TextField 
            id="filled-basic"
            type="text"
            autoComplete="off"
            name="username"
            value={this.state.username}
            onChange={this.onChange}
            placeholder="User Name"
            required
            variant="outlined"
            size="small"
            focused={this.state.focused}
            error={this.state.error}
            InputLabelProps={{ style: { color: "#2b2b2b" } }}
            inputProps={{ style: { color: "#2b2b2b",borderColor: "#2b2b2b" } }}
            sx={TextFieldStyle}
          />
          <br /><br/>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={this.state.role}
              onChange={this.onChange}
              label="Role"
              required
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superuser">Superuser</MenuItem>
              <MenuItem value="tester">Tester</MenuItem>
            </Select>
          </FormControl>
          <br /><br/>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              className="button_style"
              variant="contained"
              color="primary"
              size="small"
              disabled={this.state.username == '' || this.state.role == ''}
              onClick={this.register}
              style={RegisterButton}
            >
              Register
            </Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Link
              component="button"
              style={LoginLink}
              onClick={() => {
                this.props.navigate("/");
              }}
            >
              Login
            </Link>
          </div>
        </Box>
      </div>
    );
  }
}

export default withRouter(Register);
