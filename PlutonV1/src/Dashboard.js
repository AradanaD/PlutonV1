import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress, IconButton, Select, Input,
  DialogTitle, DialogContent, TableBody, Table, AppBar, Toolbar, Typography,MenuItem,
  TableContainer, TableHead, TableRow, TableCell, Box, Grid, FormControl, InputLabel
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
import axios from 'axios';
import styles from './testerInfo.css';
import moment from 'moment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExcelJS from 'exceljs';
const API_URL = process.env.REACT_APP_API_URL; 

function formatDate(date) {
  const dateObj = new Date(date);
  if (dateObj.getFullYear() === 1970) {
    return ''; // return empty string if year is 1970
  }
  return moment(dateObj).format('DD-MM-YYYY');
}

function calculateDiffDays(submissionDate, startDate) {
  const start = new Date(startDate);
  const submission = new Date(submissionDate);
  const diffTime = Math.abs(submission - start);
  const waitingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return waitingDays;
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#7c9885';
    case 'In Progress':
      return '#eaac8b';
    case 'Pending':
      return '#e56b6f';
    case 'Released':
      return '#b5b682';
    case 'Exp Next Itr':
      return '#a69cac';
    case 'Subs Itr rel':
      return '#6be5e1';
    case 'Stopped':
      return '#e56b6f'
    case 'Withdrawn':
      return '#e56b6f'
    default:
      return 'transparent';
  }
};

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      name: '',
      customer: '',
      newCol1: '',
      newCol2: '',
      accType: '',
      orderTypeList: [],
      orderType: '',
      newOrderType: '',
      platformList: [],
      platform: '',
      newPlatform: '',
      reqDate: '',
      configList: [],
      config: '',
      newConfig: '',
      submissionDate: '',
      startDate: '',
      endDate: '',
      rolloverDate: '',
      rolloverDays: '',
      rolloverDaysH: '',
      waitingDays: '',
      waitingDaysH: '',
      testingDays: '',
      testingDaysH: '',
      statusList: [],
      status: '',
      newStatus: '',
      testerList: [],
      testedBy: '',
      rel: '',
      reportNo: '',
      releaseDate: '',
      reviewedBy: '',
      codeCompare: '',
      newFW: '',
      tBugs: '',
      submissionReason: '',
      page: 1,
      search: '',
      customerSearch: '',
      products: [],
      pages: 0,
      loading: false,
      rowOpen: -1,
      expanded: {},
      platforms: [
        "1Ph-ADE", "1Ph-TI(A)", "1Ph (R )", "1Ph-TI(A+)", "1Ph (R+)", "RENEASAS", "SEM N2", "N2AVE", 
        "CYGNUS", "CHRONAS", "K3L", "M3R", "M3M", "M3T", "SIGMA", "M3A", "SIRUS 0.2", "METRON-SM", 
        "ATRIA-PRE", "1Ph(RL+)", "STELLAR", "RELAY", "TAURUS", "SFF", "MFF", "TT", "STELLAR", "MERCURY", 
        "SM19E", "DIN", "STELLAR+", "NORTEM", "MODEM", "VENUS", "SM19.E.VE"
      ],
      orderTypes: [
        "1Ph Order", "1Ph Tender", "1Ph Order DL", "1Ph Tender DL", "New Product", 
        "DLMS Order", "IEC Tender", "DLMS Tender", "IEC Order", "Field Return", "PLM"
      ],
      statuses: [
        "Pending", "Released", "In Progress", "Exp Next Itr", "Withdrawn", "Completed", "Subs Itr rel"
      ],
      configs: [
        "3P4W LTCT 240V 5-10A", "3P4W LTWC Cl 1.0 10-60A", "1PH LPR 10-60A, Cl.1.0",
        "3P4W 63.5V 5-10A Cl 0.2 Opt + RS232", "3P4W LTWC Cl 1.0 10-100A", "1Ph 10-60A, Cl.1.0"
      ]
    };
  }


  handleRowClick = (e, product) => {
    const index = this.state.products.indexOf(product);
    const expanded = { ...this.state.expanded };
    if (expanded[index]) {
      expanded[index] = false;
    } else {
      Object.keys(expanded).forEach(key => {
        expanded[key] = false;
      });
      expanded[index] = true;
    }
    this.setState({ expanded });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }

    this.fetchTesterList();
    this.fetchPlatformList(); // Fetch platform list on component mount
    this.fetchStatusList();
    this.fetchOrderTypeList();
    this.fetchConfigList();

  }

  fetchTesterList = () => {
    axios.get(`${API_URL}/get-tester-list`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ testerList: res.data.testers });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  fetchPlatformList = () => {
    axios.get(`${API_URL}/get-platform-list`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ platformList: res.data.platforms });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  fetchStatusList = () => {
    axios.get(`${API_URL}/get-status-list`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ statusList: res.data.statuses });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  fetchOrderTypeList = () => {
    axios.get(`${API_URL}/get-orderType-list`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ orderTypeList: res.data.orderTypes });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  fetchConfigList = () => {
    axios.get(`${API_URL}/get-config-list`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ configList: res.data.configs });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }
  
  getProduct = () => {
    this.setState({ loading: true });
    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}&searchFields=customer,name,platform,config,testedBy`;
    }

    axios.get(`${API_URL}/get-product${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, products: res.data.products, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, products: [], pages: 0 }, () => { });
    });
  }  

  deleteProduct = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this product!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.post(`${API_URL}/delete-product`, {
          id: id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'token': this.state.token
          }
        }).then((res) => {
          swal({
            text: res.data.title,
            icon: "success",
            type: "success"
          });
  
          this.setState({ page: 1 }, () => {
            this.pageChange(null, 1);
          });
        }).catch((err) => {
          swal({
            text: err.response.data.errorMessage,
            icon: "error",
            type: "error"
          });
        });
      } else {
        swal("No deletion occured");
      }
    });
  }

  pageChange = (event, value) => {
    this.setState({ page: value });
  };

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.navigate("/");
  }

  onChange = (e, newValue) => {
    const { name, value } = e.target || {};  // Handle both text input and dropdown cases
    if (name) {
      this.setState({ [name]: value }, () => {
        if (name === 'search') {
          this.setState({ page: 1 }, () => {
            this.getProduct();
          });
        }
      });
    } else if (newValue) {
      this.setState({ testedBy: newValue });
    }
  };

  addPlatform = () => {
    const { newPlatform, platformList } = this.state;

    if (newPlatform && !platformList.includes(newPlatform)) {
      this.setState(state => ({
        platformList: [...state.platformList, state.newPlatform], // Add new platform to the list
        newPlatform: '', // Clear the input field
        platform: state.newPlatform // Set the newly added platform as the selected platform
      }));
    }
  };

  addOrderType = () => {
    const { newOrderType, orderTypeList } = this.state;

    if (newOrderType && !orderTypeList.includes(newOrderType)) {
      this.setState(state => ({
        orderTypeList: [...state.orderTypeList, state.newOrderType], // Add new order type to the list
        newOrderType: '', // Clear the input field
        orderType: state.newOrderType // Set the newly added order type as the selected order type
      }));
    }
  };

  addStatus = () => {
    const { newStatus, statusList } = this.state;

    if (newStatus && !statusList.includes(newStatus)) {
      this.setState(state => ({
        statusList: [...state.statusList, state.newStatus], // Add new status to the list
        newStatus: '', // Clear the input field
        status: state.newStatus // Set the newly added status as the selected status
      }));
    }
  };

  addConfig = () => {
    const { newConfig, configList } = this.state;

    if (newConfig && !configList.includes(newConfig)) {
      this.setState(state => ({
        configList: [...state.configList, state.newConfig], // Add new config to the list
        newConfig: '', // Clear the input field
        config: state.newConfig // Set the newly added config as the selected config
      }));
    }
  };

  //export 
  handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
 
    // Set header row
    worksheet.addRow([
      'Name',
      'Rel',
      'Customer',
      'New Col 1',
      'New Col 2',
      'Status',
      'Order Type',
      'Config',
      'Platform',
      'Acc Type',
      'Tested By',
      'Submission Reason',
      'Req Date',
      'Submission Date',
      'Start Date',
      'End Date',
      'Rollover Date',
      'Rollover Days',
      'Rollover Days H',
      'Waiting Days',
      'Waiting Days H',
      'Testing Days',
      'Testing Days H',
      'Report No',
      'Release Date',
      'Reviewed By',
      'Code Compare',
      'New FW',
      'TBugs',
    ]);
 
    // Add data rows
    this.state.products.forEach((product) => {
      worksheet.addRow([
        product.name,
        product.rel,
        product.customer,
        product.newCol1,
        product.newCol2,
        product.status,
        product.orderType,
        product.config,
        product.platform,
        product.accType,
        product.testedBy,
        product.submissionReason,
        formatDate(product.reqDate),
        formatDate(product.submissionDate),
        formatDate(product.startDate),
        formatDate(product.endDate),
        formatDate(product.rolloverDate),
        product.rolloverDays,
        product.rolloverDaysH,
        product.waitingDays,
        product.waitingDaysH,
        product.testingDays,
        product.testingDaysH,
        product.reportNo,
        formatDate(product.releaseDate),
        product.reviewedBy,
        product.codeCompare,
        product.newFW,
        product.tBugs,
      ]);
    });
 
    // Create a blob from the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'firmwares_status.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };
 
  addProduct = () => {
    const waitingDays = calculateDiffDays(this.state.submissionDate, this.state.startDate);
    //const waitingDaysH = calculateDiffDaysH(this.state.submissionDate, this.state.startDate);
    const rolloverDays = calculateDiffDays(this.state.endDate, this.state.rolloverDate);
    //const rolloverDaysH = calculateDiffDaysH(this.state.endDate, this.state.rolloverDate);
    const testingDays = calculateDiffDays(this.state.startDate, this.state.endDate);
    //const testingDaysH = calculateDiffDaysH(this.state.startDate, this.state.endDate);
    const product = {
      name: this.state.name,
      customer: this.state.customer,
      accType: this.state.accType,
      orderType: this.state.orderType,
      newCol1: this.state.newCol1,
      newCol2: this.state.newCol2,
      platform: this.state.platform,
      reqDate: this.state.reqDate,
      submissionDate: this.state.submissionDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      rolloverDate: this.state.rolloverDate,
      rolloverDays: rolloverDays,
      rolloverDaysH: this.state.rolloverDaysH,
      waitingDays: waitingDays,
      waitingDaysH: this.state.waitingDaysH,
      testingDays: testingDays,
      testingDaysH: this.state.testingDaysH,
      config: this.state.config,
      status: this.state.status,
      testedBy: this.state.testedBy,
      rel: this.state.rel,
      reportNo: this.state.reportNo,
      releaseDate: this.state.releaseDate,
      reviewedBy: this.state.reviewedBy,
      codeCompare: this.state.codeCompare,
      newFW: this.state.newFW,
      tBugs: this.state.tBugs,
      submissionReason: this.state.submissionReason
    };

    axios.post(`${API_URL}/add-product`, product, {
      headers: {
        'content-type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      // this.handleProductClose();
      this.setState({ name: '', customer: '', accType: '', orderType: '', newCol1: '', newCol2: '', platform: '',reqDate: '', submissionDate: '', startDate: '', endDate: '', rolloverDate: '', rolloverDays: '', rolloverDaysH: '', waitingDays: '', waitingDaysH: '', testingDays: '', testingDaysH: '',  config: '', status: '', testedBy: '', rel: '', reportNo: '',releaseDate: '', reviewedBy: '',codeCompare: '', newFW: '', tBugs: '', submissionReason: '', page: 1 }, () => {
        this.getProduct();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      // this.handleProductClose();
    }).catch((err) => {
      console.error("Error adding product:", err);
      swal({
        text: "Something went wrong! Please try again later.",
        icon: "error",
        type: "error"
      });
      // this.handleProductClose();
    });

  }

  updateProduct = () => {
    const waitingDays = calculateDiffDays(this.state.submissionDate, this.state.startDate);
    //const waitingDaysH = calculateDiffDaysH(this.state.submissionDate, this.state.startDate);
    const rolloverDays = calculateDiffDays(this.state.endDate, this.state.rolloverDate);
    //const rolloverDaysH = calculateDiffDaysH(this.state.endDate, this.state.rolloverDate);
    const testingDays = calculateDiffDays(this.state.startDate, this.state.endDate);
    //const testingDaysH = calculateDiffDaysH(this.state.startDate, this.state.endDate);

    const product = {
      id: this.state.id,
      name: this.state.name,
      customer: this.state.customer,
      accType: this.state.accType,
      orderType: this.state.orderType,
      newCol1: this.state.newCol1,
      newCol2: this.state.newCol2,
      platform: this.state.platform,
      reqDate: this.state.reqDate,
      submissionDate: this.state.submissionDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      rolloverDate: this.state.rolloverDate,
      rolloverDays: rolloverDays,
      rolloverDaysH: this.state.rolloverDaysH,
      waitingDays: waitingDays,
      waitingDaysH: this.state.waitingDaysH,
      testingDays: testingDays,
      testingDaysH: this.state.testingDaysH,
      config: this.state.config,
      status: this.state.status,
      testedBy: this.state.testedBy,
      rel: this.state.rel,
      reportNo: this.state.reportNo,
      releaseDate: this.state.releaseDate,
      reviewedBy: this.state.reviewedBy,
      codeCompare: this.state.codeCompare,
      newFW: this.state.newFW,
      tBugs: this.state.tBugs,
      submissionReason: this.state.submissionReason
      
    };
    axios.post(`${API_URL}/update-product`, product, {
      headers: {
        'content-type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.handleProductEditClose();
      this.setState({ name: '', customer: '', accType: '', orderType: '',newCol1: '', newCol2: '', platform: '',reqDate: '', submissionDate: '', startDate: '', endDate: '', rolloverDate: '', rolloverDays: '', rolloverDaysH: '', waitingDays: '', waitingDaysH: '', testingDays: '', testingDaysH: '',  config: '', status: '', testedBy: '', rel: '', reportNo: '', releaseDate: '', reviewedBy: '',codeCompare: '', newFW: '', tBugs: '', submissionReason: '', page: 1 }, () => {
        this.getProduct();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleProductEditClose();
    });

  }
//   axios.post(`${API_URL}/update-product`, product, {
//     headers: {
//       'content-type': 'application/json',
//       'token': this.state.token
//     }
//   }).then((res) => {
//     swal({
//       text: res.data.title,
//       icon: "success",
//       type: "success"
//     });

//     this.handleProductEditClose();

//     // Create a new object with only the updated properties
//     const updatedState = {
//       page: 1
//     };

//     this.setState(updatedState, () => {
//       this.getProduct();
//     });
//   }).catch((err) => {
//     swal({
//       text: err.response.data.errorMessage,
//       icon: "error",
//       type: "error"
//     });
//     this.handleProductEditClose();
//   });
// }

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: '',
      name: '',
      customer: '',
      accType: '',
      orderType: '',
      newCol1: '',
      newCol2: '',
      platform: '',
      reqDate: '',
      submissionDate: '',
      startDate: '',
      endDate: '',
      rolloverDate: '',
      rolloverDays: '',
      rolloverDaysH: '',
      waitingDays: '',
      waitingDaysH: '',
      testingDays: '',
      testingDaysH: '',
      config: '',
      status: '',
      testedBy: '',
      rel: '',
      reportNo: '',
      releaseDate: '',
      reviewedBy: '',
      codeCompare: '',
      newFW: '',
      tBugs: '',
      submissionReason: ''
    });
  };
  
  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };
  
  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      name: data.name,
      customer: data.customer,
      accType: data.accType,
      orderType: data.orderType,
      newCol1: data.newCol1,
      newCol2: data.newCol2,
      platform: data.platform,
      reqDate: data.reqDate,
      submissionDate: data.submissionDate,
      startDate: data.startDate,
      endDate: data.endDate,
      rolloverDate: data.rolloverDate,
      rolloverDays: data.rolloverDays,
      rolloverDaysH: data.rolloverDaysH,
      waitingDays: data.waitingDays,
      waitingDaysH: data.waitingDaysH,
      testingDays: data.testingDays,
      testingDaysH: data.testingDaysH,
      config: data.config,
      status: data.status,
      testedBy: data.testedBy,
      rel: data.rel,
      reportNo: data.reportNo,
      releaseDate: data.releaseDate,
      reviewedBy: data.reviewedBy,
      codeCompare: data.codeCompare,
      newFW: data.newFW,
      tBugs: data.tBugs,
      submissionReason: data.submissionReason
    });
  };


  render() {
    const { role } = this.props;
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
  <Toolbar>
  <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
    <ArrowBackIcon />
  </IconButton>
    <Typography variant="h6" className="title">
      Superuser Dashboard
    </Typography>
    <Box flexGrow={1} />
    <Button
      className="button_style"
      variant="contained"
      size="small"
      onClick={this.logOut}
    >
      Log Out
    </Button>
  </Toolbar>
</AppBar>
      
        {/* Edit Product */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              // Show a warning message when the user clicks outside the dialog
              swal({
                title: "Unsaved changes",
                text: "Are you sure you want to discard your changes?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((willClose) => {
                if (willClose) {
                  this.handleProductClose();
                }
              });
            } else {
              this.handleProductClose();
            }
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          BackdropProps={{ backdropClickClose: false }}
          maxWidth="xl"
          PaperProps={{
            style: {
              maxWidth: '2500px' // Adjust the width as needed
            }
          }}
        >
          <DialogTitle id="alert-dialog-title">Edit Product</DialogTitle>
          <DialogContent>
  {/* Uniform width for TextFields */}
  <TextField
    id="standard-basic"
    label="Meter Version:"
    type="text"
    autoComplete="off"
    name="name"
    value={this.state.name}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Release Number:"
    type="number"
    autoComplete="off"
    name="rel"
    value={this.state.rel}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Customer:"
    type="text"
    autoComplete="off"
    name="customer"
    value={this.state.customer}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Utility:"
    type="text"
    autoComplete="off"
    name="newCol1"
    value={this.state.newCol1}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Comms:"
    type="text"
    autoComplete="off"
    name="newCol2"
    value={this.state.newCol2}
    onChange={this.onChange}
    fullWidth
  /><br />

  {/* Dropdown fields with "add new" fields */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="statusDropdownLabel">Status:</InputLabel>
      <Select
        labelId="statusDropdownLabel"
        id="statusDropdown"
        value={this.state.status}
        onChange={(e) => this.setState({ status: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Status</MenuItem>
        {this.state.statusList.map((status, index) => (
          <MenuItem key={index} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newStatusLabel">+ Status</InputLabel>
      <Input
        id="newStatus"
        value={this.state.newStatus}
        onChange={(e) => this.setState({ newStatus: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addStatus} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="orderTypeDropdownLabel">Order Type:</InputLabel>
      <Select
        labelId="orderTypeDropdownLabel"
        id="orderTypeDropdown"
        value={this.state.orderType}
        onChange={(e) => this.setState({ orderType: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Order Type</MenuItem>
        {this.state.orderTypeList.map((orderType, index) => (
          <MenuItem key={index} value={orderType}>
            {orderType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newOrderTypeLabel">+ Order Type</InputLabel>
      <Input
        id="newOrderType"
        value={this.state.newOrderType}
        onChange={(e) => this.setState({ newOrderType: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addOrderType} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="configDropdownLabel">Config:</InputLabel>
      <Select
        labelId="configDropdownLabel"
        id="configDropdown"
        value={this.state.config}
        onChange={(e) => this.setState({ config: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Config</MenuItem>
        {this.state.configList.map((config, index) => (
          <MenuItem key={index} value={config}>
            {config}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newConfigLabel">+ Config</InputLabel>
      <Input
        id="newConfig"
        value={this.state.newConfig}
        onChange={(e) => this.setState({ newConfig: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addConfig} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="platformDropdownLabel">Platform:</InputLabel>
      <Select
        labelId="platformDropdownLabel"
        id="platformDropdown"
        value={this.state.platform}
        onChange={(e) => this.setState({ platform: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Platform</MenuItem>
        {this.state.platformList.map((platform, index) => (
          <MenuItem key={index} value={platform}>
            {platform}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newPlatformLabel">+ Platform:</InputLabel>
      <Input
        id="newPlatform"
        value={this.state.newPlatform}
        onChange={(e) => this.setState({ newPlatform: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addPlatform} variant="contained" color="primary">Add</Button>
  </div>

  {/* Uniform width for remaining TextFields */}
  <TextField
    id="standard-basic"
    label="Account Type:"
    type="text"
    autoComplete="off"
    name="accType"
    value={this.state.accType}
    onChange={this.onChange}
    fullWidth
  /><br />

  <FormControl fullWidth>
    <InputLabel id="testedByDropdownLabel">Tested By:</InputLabel>
    <Select
      labelId="testedByDropdownLabel"
      id="testedByDropdown"
      value={this.state.testedBy}
      onChange={(e) => this.setState({ testedBy: e.target.value })}
      autoComplete="off"
    >
      <MenuItem value="">Select Tester</MenuItem>
      {this.state.testerList.map((username, index) => (
        <MenuItem key={index} value={username}>
          {username}
        </MenuItem>
      ))}
    </Select>
  </FormControl><br />

  <TextField
    id="standard-basic"
    label="Submission Reason:"
    type="text"
    autoComplete="off"
    name="submissionReason"
    value={this.state.submissionReason}
    onChange={this.onChange}
    fullWidth
  /><br />

  <TextField
              id="standard-basic"
              label= "Submission Date:"
              type="date"
              autoComplete="off"
              name="submissionDate"
              value={moment(this.state.submissionDate, 'YYYY-MM-DD').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}              
              // required
            /><br />

<TextField
              id="standard-basic"
              label= "Request Date:"
              type="date"
              autoComplete="off"
              name="reqDate"
              value={moment(this.state.reqDate, 'YYYY-MM-DD').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
               
            }}
              // required
            /><br />

  
<TextField
              id="standard-basic"
              label= "Start Date:"
              type="date"
              autoComplete="off"
              name="startDate"
              value={moment(this.state.startDate, 'YYYY-MM-DD').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
             
              // required
            /><br />

<TextField
              id="standard-basic"
              label= "End Date:"
              type="date"
              autoComplete="off"
              name="endDate"
              value={moment(this.state.endDate, 'YYYY-MM-DD').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
             
              // required
            /><br />

<TextField
              id="standard-basic"
              label= "Rollover Date:"
              type="date"
              autoComplete="off"
              name="rolloverDate"
              value={moment(this.state.rolloverDate, 'YYYY-MM-DD').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // placeholder="rolloverDate"
              // required
            /><br />
  <TextField
              id="standard-basic"
              label= "Rollover Days(H):"
              type="Number"
              autoComplete="off"
              name="rolloverDaysH"
              value={this.state.rolloverDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
              // required
            /><br />
 
            <TextField
              id="standard-basic"
              label= "Waiting Days(H):"
              type="Number"
              autoComplete="off"
              name="waitingDaysH"
              value={this.state.waitingDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
 
            <TextField
              id="standard-basic"
              label= "Testing Days(H):"
              type="Number"
              autoComplete="off"
              name="testingDaysH"
              value={this.state.testingDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
 
           
            <TextField
              id="standard-basic"
              label= "Report Number:"
              type="text"
              autoComplete="off"
              name="reportNo"
              value={this.state.reportNo}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Date:"
              type="date"
              autoComplete="off"
              name="releaseDate"
              defaultValue={moment(this.state.releaseDate, 'DD-MM-YYYY').format('YYYY-MM-DD')}
              onChange={this.onChange}
              fullWidth
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Reiewed By:"
              type="text"
              autoComplete="off"
              name="reviewedBy"
              value={this.state.reviewedBy}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Code Compare:"
              type="text"
              autoComplete="off"
              name="codeCompare"
              value={this.state.codeCompare}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "New Firmware:"
              type="text"
              autoComplete="off"
              name="newFW"
              value={this.state.newFW}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Total Bugs:"
              type="number"
              autoComplete="off"
              name="tBugs"
              value={this.state.tBugs}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
</DialogContent>
    

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>
            <Button              
              // disabled={this.state.name == '' || this.state.customer == '' || this.state.accType == '' || this.state.orderType == '' || this.state.newCol1 == '' || this.state.newCol2 == '' || this.state.platform == '' || this.state.reqDate == '' || this.state.submissionDate == '' || this.state.startDate == '' || this.state.endDate == '' || this.state.rolloverDate == '' || this.state.rolloverDays == '' || this.state.rolloverDaysH  == '' || this.state.waitingDays  == '' || this.state.waitingDaysH  == '' || this.state.testingDays  == '' || this.state.testingDaysH == '' || this.state.config == '' || this.state.status == '' || this.state.testedBy == '' || this.state.rel == '' || this.state.reportNo == '' || this.state.releaseDate == '' || this.state.reviewedBy == '' || this.state.codeCompare == '' || this.state.newFW == '' || this.state.tBugs == '' || this.state.submissionReason == ''}
              onClick={(e) => this.updateProduct()} color="primary" autoFocus>
              Edit Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Product */}
        <Dialog
          open={this.state.openProductModal}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              // warning message when the user clicks outside the dialog
              swal({
                title: "Unsaved changes",
                text: "Are you sure you want to discard your changes?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((willClose) => {
                if (willClose) {
                  this.handleProductClose();
                }
              });
            } else {
              this.handleProductClose();
            }
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          BackdropProps={{ backdropClickClose: false }}
        >
          
          <DialogTitle id="alert-dialog-title">Add Product</DialogTitle>
          <DialogContent>
  {/* Uniform width for TextFields */}
  <TextField
    id="standard-basic"
    label="Meter Version:"
    type="text"
    autoComplete="off"
    name="name"
    value={this.state.name}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Release Number:"
    type="number"
    autoComplete="off"
    name="rel"
    value={this.state.rel}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Customer:"
    type="text"
    autoComplete="off"
    name="customer"
    value={this.state.customer}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Utility:"
    type="text"
    autoComplete="off"
    name="newCol1"
    value={this.state.newCol1}
    onChange={this.onChange}
    required
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Comms:"
    type="text"
    autoComplete="off"
    name="newCol2"
    value={this.state.newCol2}
    onChange={this.onChange}
    fullWidth
  /><br />

  {/* Dropdown fields with "add new" fields */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="statusDropdownLabel">Status:</InputLabel>
      <Select
        labelId="statusDropdownLabel"
        id="statusDropdown"
        value={this.state.status}
        onChange={(e) => this.setState({ status: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Status</MenuItem>
        {this.state.statusList.map((status, index) => (
          <MenuItem key={index} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newStatusLabel">+ Status</InputLabel>
      <Input
        id="newStatus"
        value={this.state.newStatus}
        onChange={(e) => this.setState({ newStatus: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addStatus} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="orderTypeDropdownLabel">Order Type:</InputLabel>
      <Select
        labelId="orderTypeDropdownLabel"
        id="orderTypeDropdown"
        value={this.state.orderType}
        onChange={(e) => this.setState({ orderType: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Order Type</MenuItem>
        {this.state.orderTypeList.map((orderType, index) => (
          <MenuItem key={index} value={orderType}>
            {orderType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newOrderTypeLabel">+ Order Type</InputLabel>
      <Input
        id="newOrderType"
        value={this.state.newOrderType}
        onChange={(e) => this.setState({ newOrderType: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addOrderType} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="configDropdownLabel">Config:</InputLabel>
      <Select
        labelId="configDropdownLabel"
        id="configDropdown"
        value={this.state.config}
        onChange={(e) => this.setState({ config: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Config</MenuItem>
        {this.state.configList.map((config, index) => (
          <MenuItem key={index} value={config}>
            {config}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newConfigLabel">+ Config</InputLabel>
      <Input
        id="newConfig"
        value={this.state.newConfig}
        onChange={(e) => this.setState({ newConfig: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addConfig} variant="contained" color="primary">Add</Button>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="platformDropdownLabel">Platform:</InputLabel>
      <Select
        labelId="platformDropdownLabel"
        id="platformDropdown"
        value={this.state.platform}
        onChange={(e) => this.setState({ platform: e.target.value })}
        autoComplete="off"
      >
        <MenuItem value="">Select Platform</MenuItem>
        {this.state.platformList.map((platform, index) => (
          <MenuItem key={index} value={platform}>
            {platform}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl style={{ flex: 1 }}>
      <InputLabel id="newPlatformLabel">+ Platform:</InputLabel>
      <Input
        id="newPlatform"
        value={this.state.newPlatform}
        onChange={(e) => this.setState({ newPlatform: e.target.value })}
      />
    </FormControl>
    <Button onClick={this.addPlatform} variant="contained" color="primary">Add</Button>
  </div>

  {/* Uniform width for remaining TextFields */}
  <TextField
    id="standard-basic"
    label="Account Type:"
    type="text"
    autoComplete="off"
    name="accType"
    value={this.state.accType}
    onChange={this.onChange}
    fullWidth
  /><br />

  <FormControl fullWidth>
    <InputLabel id="testedByDropdownLabel">Tested By:</InputLabel>
    <Select
      labelId="testedByDropdownLabel"
      id="testedByDropdown"
      value={this.state.testedBy}
      onChange={(e) => this.setState({ testedBy: e.target.value })}
      autoComplete="off"
    >
      <MenuItem value="">Select Tester</MenuItem>
      {this.state.testerList.map((username, index) => (
        <MenuItem key={index} value={username}>
          {username}
        </MenuItem>
      ))}
    </Select>
  </FormControl><br />

  <TextField
    id="standard-basic"
    label="Submission Reason:"
    type="text"
    autoComplete="off"
    name="submissionReason"
    value={this.state.submissionReason}
    onChange={this.onChange}
    fullWidth
  /><br />

  <TextField
    id="standard-basic"
    label="Request Date:"
    type="date"
    autoComplete="off"
    name="reqDate"
    value={this.state.reqDate}
    onChange={this.onChange}
    fullWidth
    InputLabelProps={{
      shrink: true,
    }}
  /><br />

  <TextField
    id="standard-basic"
    label="Submission Date:"
    type="date"
    autoComplete="off"
    name="submissionDate"
    value={this.state.submissionDate}
    onChange={this.onChange}
    fullWidth
    InputLabelProps={{
      shrink: true,
    }}
  /><br />

  <TextField
    id="standard-basic"
    label="Start Date:"
    type="date"
    autoComplete="off"
    name="startDate"
    value={this.state.startDate}
    fullWidth
    onChange={this.onChange}
    InputLabelProps={{
      shrink: true,
    }}
  /><br />

  <TextField
    id="standard-basic"
    label="End Date:"
    type="date"
    autoComplete="off"
    name="endDate"
    value={this.state.endDate}
    fullWidth
    onChange={this.onChange}
    InputLabelProps={{
      shrink: true,
    }}
  /><br />

  <TextField
    id="standard-basic"
    label="Rollover Date:"
    type="date"
    autoComplete="off"
    name="rolloverDate"
    defaultValue={this.state.rolloverDate}
    onChange={this.onChange}
    fullWidth
    InputLabelProps={{
      shrink: true,
    }}
  /><br />
  <TextField
              id="standard-basic"
              label= "Rollover Days(H):"
              type="Number"
              autoComplete="off"
              name="rolloverDaysH"
              value={this.state.rolloverDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
              // required
            /><br />
 
            <TextField
              id="standard-basic"
              label= "Waiting Days(H):"
              type="Number"
              autoComplete="off"
              name="waitingDaysH"
              value={this.state.waitingDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
 
            <TextField
              id="standard-basic"
              label= "Testing Days(H):"
              type="Number"
              autoComplete="off"
              name="testingDaysH"
              value={this.state.testingDaysH}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
 
           
            <TextField
              id="standard-basic"
              label= "Report Number:"
              type="text"
              autoComplete="off"
              name="reportNo"
              value={this.state.reportNo}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Date:"
              type="date"
              autoComplete="off"
              name="releaseDate"              
              defaultValue={this.state.releaseDate}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Reiewed By:"
              type="text"
              autoComplete="off"
              name="reviewedBy"
              value={this.state.reviewedBy}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Code Compare:"
              type="text"
              autoComplete="off"
              name="codeCompare"
              value={this.state.codeCompare}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "New Firmware:"
              type="text"
              autoComplete="off"
              name="newFW"
              value={this.state.newFW}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Total Bugs:"
              type="number"
              autoComplete="off"
              name="tBugs"
              value={this.state.tBugs}
              onChange={this.onChange}
              fullWidth
    InputLabelProps={{
      shrink: true,
    }}
             
              // required
            /><br />
</DialogContent>     


          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>
            <Button
              //disabled={this.state.name == '' || this.state.customer == '' || this.state.accType == '' || this.state.orderType == '' || this.state.newCol1 == '' || this.state.newCol2 == '' || this.state.platform == '' || this.state.reqDate == '' || this.state.submissionDate == '' || this.state.startDate == '' || this.state.endDate == '' || this.state.rolloverDate == '' || this.state.rolloverDays  == '' || this.state.rolloverDaysH  == '' || this.state.waitingDaysH  == '' || this.state.testingDays  == '' || this.state.testingDaysH == '' || this.state.config == '' || this.state.status == '' || this.state.testedBy == '' || this.state.rel == '' || this.state.reportNo == '' || this.state.releaseDate == '' || this.state.reviewedBy == '' || this.state.codeCompare == '' || this.state.newFW == '' || this.state.submissionReason == '' || this.state.tBugs == '' }
              onClick={(e) => this.addProduct()} color="primary" autoFocus>
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        <div>
          <br/>
        </div>

        <Grid container spacing={2} alignItems= "flex-start">
          <Grid item xs={12} alignItems= "flex-start">
                        
          </Grid>
      
<Grid item xs={12}>
  <Box display="flex" justifyContent="space-between">
    <div className="no-printme">
      <Button
        className="button_style"
        variant="contained"
        color="primary"
        size="small"
        onClick={this.handleProductOpen}
        style={{ backgroundColor: '#2b2b2b' }}
      >
        + Add Product
      </Button>
    </div>
    <TextField
              id="standard-basic"
              className="no-printme"
              type="search"
              autoComplete="off"
              name="search"
              value={this.state.search}
              onChange={this.onChange}
              placeholder="Search by meter ver/ customer/ platform/ config/ testedBy"
              style={{ width: '25%' }}
              required
            />
    <div className="no-printme">
      <Button
        className="button_style"
        variant="contained"
        color="primary"
        size="small"
        onClick={this.handleExport}
        style={{ backgroundColor: '#2b2b2b' }}
      >
        EXPORT
      </Button>
    </div>
  </Box>
</Grid>
</Grid>



        {/* Product Table */}
        <br />
        <TableContainer>
          <Table striped>
            <TableHead>
              <TableRow>   
                <TableCell><span></span></TableCell>                  
                {/* {username === 'admin' && ( */}
                  <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
                {/* )} */}           
                <TableCell style={{ fontWeight: 'bold' }}>Meter Version</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Release Number</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Utility</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Comms</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Order Type</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Configuration</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Platform</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Account Type</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Tested By</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Submission Reason</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Request&nbsp;Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>&nbsp;&nbsp;Start&nbsp;Date&nbsp;&nbsp;</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>&nbsp;&nbsp;End&nbsp;Date&nbsp;&nbsp;&nbsp;</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Rollover&nbsp;Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Rollover Days (including holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Rollover Days (excluding holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Waiting Days (including holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Waiting Days (excluding holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Testing Days (including holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Testing Days (excluding holiday)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Report Number</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Release&nbsp;Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Reviewed By</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Code Compare</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>New Firmware</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Total Bugs</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {this.state.products.sort((a, b) => new Date(b.reqDate) - new Date(a.reqDate))
    .slice((this.state.page - 1) * 5, this.state.page * 5)
    .map((product, index) => (
                
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>
                    {/* <IconButton onClick={(e) => this.handleRowClick(e,product)}>
                      <KeyboardArrowDown />
                    </IconButton> */}
                    </TableCell>
                    {/* {username === 'admin' && ( */}
                    <TableCell>
                      <div style={{display: 'flex', justifyContent: 'space-between'}} >
                        <Button
                          className="button_style"
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => this.handleProductEditOpen(product)}
                          style={{ marginRight: '5px',backgroundColor: '#355070'}}
                        >
                          Edit
                        </Button>
                        <Button
                          className="button_style"
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => this.deleteProduct(product._id)}
                          style={{ backgroundColor: '#b56576'}}
                        >
                          Delete
                        </Button>
                      </div>
                      </TableCell>
                    {/* )} */}
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.rel}</TableCell>
                    <TableCell>{product.customer}</TableCell>
                    <TableCell>{product.newCol1}</TableCell>
                    <TableCell>{product.newCol2}</TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px',
                        borderRadius: '5px',
                        backgroundColor: product.status === 'Completed' ? '#7c9885' :
                          product.status === 'In Progress' ? '#eaac8b' :
                          product.status === 'Pending' ? '#bd8f97' : 
                          product.status === 'Exp Next Itr' ? '#a69cac' : 
                          product.status === 'In Progress' ? '#eaac8b' :
                          product.status === 'Subs Itr rel' ? '#778899' :
                          product.status === 'Released' ? '#72938c' : 
                          product.status === 'Stopped' ? '#bd8f97' :
                          product.status === 'Withdrawn' ? '#e56b6f':'#a6a6a6',
                        color: 'white', // Set text color to white for better readability
                      }}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell>{product.orderType}</TableCell>
                    <TableCell>{product.config}</TableCell>
                    <TableCell>{product.platform}</TableCell>
                    <TableCell>{product.accType}</TableCell>
                    <TableCell>{product.testedBy}</TableCell>
                    <TableCell>{product.submissionReason}</TableCell>
                    <TableCell>{formatDate(product.reqDate)}</TableCell>
                    <TableCell>{formatDate(product.submissionDate)}</TableCell>
                    <TableCell>{formatDate(product.startDate)}</TableCell>
                    <TableCell>{formatDate(product.endDate)}</TableCell>
                    <TableCell>{formatDate(product.rolloverDate)}</TableCell>
                    <TableCell>{product.rolloverDays}</TableCell>
                    <TableCell>{product.rolloverDaysH}</TableCell>
                    <TableCell>{product.waitingDays}</TableCell>
                    <TableCell>{product.waitingDaysH}</TableCell>
                    <TableCell>{product.testingDays}</TableCell>
                    <TableCell>{product.testingDaysH}</TableCell>
                    <TableCell>{product.reportNo}</TableCell>
                    <TableCell>{formatDate(product.releaseDate)}</TableCell>
                    <TableCell>{product.reviewedBy}</TableCell>
                    <TableCell>{product.codeCompare}</TableCell>
                    <TableCell>{product.newFW}</TableCell>
                    <TableCell>{product.tBugs}</TableCell>                 
                    
                  </TableRow>
                  {this.state.expanded[index] && (
                    <div style={{fontFamily: 'sans-serif', textAlign: "left", fontSize: "14px"}}>
                    <div><span><b>Name:</b></span>&nbsp;<span>{product.name}</span></div>
                    <div><span><b>Customer:</b></span>&nbsp;<span>{product.customer}</span></div>
                    <div><span><b>AccType:</b></span>&nbsp;<span>{product.accType}</span></div>
                    <div><span><b>OrderType:</b></span>&nbsp;<span>{product.orderType}</span></div>
                    <div><span><b>AccType:</b></span>&nbsp;<span>{product.accType}</span></div>
                    <div><span><b>Utility:</b></span>&nbsp;<span>{product.newCol1}</span></div>
                    <div><span><b>Comms:</b></span>&nbsp;<span>{product.newCol2}</span></div>
                    <div><span><b>Platform:</b></span>&nbsp;<span>{product.platform}</span></div>
                    <div><span><b>Config:</b></span>&nbsp;<span>{product.config}</span></div>
                    <div><span><b>Status:</b></span><span><span className={styles.status} style={{backgroundColor: getStatusColor(product.status),}}>{product.status}</span></span></div>
                    <div><span><b>Tested By:</b></span>&nbsp;<span>{product.testedBy}</span></div>
                    <div><span><b>Req Date:</b></span>&nbsp;<span>{formatDate(product.reqDate)}</span></div>
                    <div><span><b>Sub Date:</b></span>&nbsp;<span>{formatDate(product.submissionDate)}</span></div>
                    <div><span><b>Start Date:</b></span>&nbsp;<span>{formatDate(product.startDate)}</span></div>
                    <div><span><b>End Date:</b></span>&nbsp;<span>{formatDate(product.endDate)}</span></div>
                    <div><span><b>Rollover Date:</b></span>&nbsp;<span>{formatDate(product.rolloverDate)}</span></div>
                    <div><span><b>Rollover Days:</b></span>&nbsp;<span>{product.rolloverDays}</span></div>
                    <div><span><b>Rollover DaysH:</b></span>&nbsp;<span>{product.rolloverDaysH}</span></div>
                    <div><span><b>Waiting Days:</b></span>&nbsp;<span>{product.waitingDays}</span></div>
                    <div><span><b>Waiting DaysH:</b></span>&nbsp;<span>{product.waitingDaysH}</span></div>
                    <div><span><b>Testing Days:</b></span>&nbsp;<span>{product.testingDays}</span></div>
                    <div><span><b>Testing DaysH:</b></span>&nbsp;<span>{product.testingDaysH}</span></div>
                    <div><span><b>Release:</b></span>&nbsp;<span>{product.rel}</span></div>
                    <div><span><b>Report No.:</b></span>&nbsp;<span>{product.reportNo}</span></div>
                    <div><span><b>Release Date:</b></span>&nbsp;<span>{product.releaseDate}</span></div>
                    <div><span><b>Reviewed By:</b></span>&nbsp;<span>{product.reviewedBy}</span></div>
                    <div><span><b>Code Compare:</b></span>&nbsp;<span>{product.codeCompare}</span></div>
                    <div><span><b>New Firmware:</b></span>&nbsp;<span>{product.newFW}</span></div>
                    <div><span><b>Total Bugs:</b></span>&nbsp;<span>{product.tBugs}</span></div>
                    <div><span><b>Reason for Submission:</b></span>&nbsp;<span>{product.submissionReason}</span></div>
                  </div>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
  count={Math.ceil(this.state.products.length / 5)}
  page={this.state.page}
  onChange={this.pageChange}
  color="#2b2b2b"
/>
      </div>
    );
  }
}
export default withRouter(Dashboard);

