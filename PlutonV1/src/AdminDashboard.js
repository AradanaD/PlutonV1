import React, { Component } from 'react';
import { TableBody, Table, TableContainer, TableHead, TableRow, TableCell, AppBar, Toolbar, Typography, Box, LinearProgress, Button, Grid, Paper } from '@material-ui/core';
import swal from 'sweetalert';
import axios from 'axios';
import { withRouter } from './utils'; // Import withRouter
import Chart from 'chart.js/auto';
import './AdminDashboard.css';  // Import the CSS file
import { NavLink } from 'react-router-dom'; // Import NavLink
import Sidebar from './Sidebar';
import moment from 'moment';
const API_URL = process.env.REACT_APP_API_URL; // For create-react-app



function formatDate(date) {
  const dateObj = new Date(date);
  if (dateObj.getFullYear() === 1970) {
    return ''; // return empty string if year is 1970
  }
  return moment(dateObj).format('DD-MM-YYYY');
}

class AdminDashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      products: [],
      loading: false,
      filter: 'All',
      //
      tableFilter: 'In Progress',
      charts: {
        barChart: null,
        pieChart: null,
        lineChart: null,
        testerChart: null,
      }
    };
    this.chartRefs = {
      barChart: React.createRef(),
      pieChart: React.createRef(),
      lineChart: React.createRef(),
      testerChart: React.createRef()
    };
    //this.logOut = this.logOut.bind(this);
  }
  
  getDateCounts = () => {
    const dateCounts = {};
    this.state.products.forEach((product) => {
      const date = new Date(product.submissionDate).toLocaleDateString();
      if (dateCounts[date]) {
        dateCounts[date] += 1;
      } else {
        dateCounts[date] = 1;
      }
    });
    return dateCounts;
  }

  getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return '#eaac8b';
      case 'Pending':
        return '#e56b6f';
      case 'In progress_R':
        return '#bd8f97'
      case 'Withdrawn':
        return '#e56b6f'
      default:
        return '#D3D3D3';
    }
  };

  componentDidMount() {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }

    
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.products !== this.state.products) {
      this.updateCharts();
    }
  }

  getProduct = () => {
    this.setState({ loading: true });
    axios.get(`${API_URL}/graph-product`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      const filteredProducts = this.filterProducts(res.data.products);
      this.setState({ loading: false, products: filteredProducts });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, products: [] });
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    //this.props.history.push("/"); // Use history for navigation
    this.props.navigate("/");
  }

  filterProducts = (products) => {
    const { filter } = this.state;
    if (filter === 'Order') {
      return products.filter(product => product.orderType === 'DLMS Order');
    } else if (filter === 'Tender') {
      return products.filter(product => product.orderType === 'DLMS Tender');
    }
    return products ;
  }

  handleFilterChange = (filter) => {
    this.setState({ filter }, this.getProduct);
  }
  ///

  handleTableFilterChange = (filter) => {
    this.setState({ tableFilter: filter });
  }

  getStatusCounts = () => {
    const statusCounts = { complete: 0, inProgress: 0, pending: 0, released: 0, expnextitr: 0, subsitrrel: 0, stopped: 0, withdrawn: 0 };
    this.state.products.forEach((product) => {
      switch (product.status) {
        case 'Completed':
          statusCounts.complete += 1;
          break;
        case 'Released':
            statusCounts.released += 1;
            break;
        case 'In Progress':
          statusCounts.inProgress += 1;
          break;
        case 'In progress_R':
          statusCounts.inProgress += 1;
          break;
        case 'Exp Next Itr':
            statusCounts.expnextitr += 1;
            break;
        case 'Subs Itr rel':
              statusCounts.subsitrrel += 1;
              break;
        case 'Pending':
          statusCounts.pending += 1;
          break;
        case 'Stopped':
          statusCounts.stopped += 1;
          break;
        case 'Withdrawn':
          statusCounts.withdrawn += 1;
          break;
        default:
          break;
      }
    });
    return statusCounts;
  }

  getAccTypeCounts = () => {
    const accTypeCounts = { 'TVM': 0, 'ENM': 0, 'SMART': 0 };
    this.state.products.forEach((product) => {
      const accType = product.accType.toUpperCase(); // Assuming 'accType' is the new field name
      if (accType.includes('TVM')) {
        accTypeCounts['TVM'] += 1;
      } else if (accType.includes('ENM')) {
        accTypeCounts['ENM'] += 1;
      } else if (accType.includes('SMART')) {
        accTypeCounts['SMART'] += 1;
      }
    });
    return accTypeCounts;
  }

  getTesterCounts = () => {
    const testerCounts = {};
    this.state.products.forEach((product) => {
      const testers = product.testedBy.split('/').filter(tester => tester !== '0'); // Exclude '0' from testers
      testers.forEach((tester) => {
        if (testerCounts[tester]) {
          testerCounts[tester] += 1;
        } else {
          testerCounts[tester] = 1;
        }
      });
    });
    return testerCounts;
  }

  updateCharts = () => {
    this.updateBarChart();
    this.updatePieChart();
    this.updateLineChart();
    this.updatePieChartTester();
  }

  updateBarChart = () => {
    const statusCounts = this.getStatusCounts();
    const data = {
      labels: ['Completed','Released', 'In Progress', 'Exp Next Itr', 'Subs Itr rel','Pending', 'Stopped', 'Withdrawn'],
      datasets: [{
        label: 'Status Count',
        backgroundColor: ["#ccff00","#66ff66","#ffff66","#16d0cb","#ce6edf","#ff9966","#ff355e","#fd5b78"],
        data: [statusCounts.complete,statusCounts.released, statusCounts.inProgress,  statusCounts.expnextitr, statusCounts.subsitrrel,statusCounts.pending, statusCounts.stopped, statusCounts.withdrawn]
      }]
    };

    this.createOrUpdateChart('bar', data, 'barChart');
  }

  updatePieChart = () => {
    const accTypeCounts = this.getAccTypeCounts(); // New function to get accType counts
    const data = {
      labels: Object.keys(accTypeCounts),
      datasets: [{
        label: 'Products by AccType',
        backgroundColor: ["#ffff66","#ff9966","#50bfe6"], // Define your colors here
        data: Object.values(accTypeCounts)
      }]
    };

    this.createOrUpdateChart('pie', data, 'pieChart');
  }

  updatePieChartTester = () => {
    const testerCounts = this.getTesterCounts(); // New function to get tester counts
    const colors = [
      "#ff355e","#fd5b78","#ff6037", "#ff9933","#ff9966","#ffcc33","#ffff66", "#ccff00", "#66ff66","#aaf0d1","#16d0cb","#50bfe6","#ce6edf","#ff00cc"];
    const data = {
      labels: Object.keys(testerCounts),
      datasets: [{
        label: 'Products by Tester',
        backgroundColor: colors.slice(0, Object.keys(testerCounts).length),
        data: Object.values(testerCounts)
      }]
    };

    this.createOrUpdateChart('pie', data, 'testerChart');
  }

  updateLineChart = () => {
    const dateCounts = this.getDateCounts();
    const monthAverages = {}; // Object to store average testing days for each month
  
    // Calculate sum of testing days and occurrences of each month
    Object.keys(dateCounts).forEach((date) => {
      const submissionDate = new Date(date);
      const month = submissionDate.getMonth() + 1; // Get month from submissionDate
      const year = submissionDate.getFullYear(); // Get year from submissionDate
  
      // Skip if the year is 1970 (Jan 1970 is a junk value)
      if (year === 1970) return;
  
      const testingDays = dateCounts[date]; // Get testing days for the current month
      const monthYearKey = `${month}-${year}`; // Create a key that includes both month and year
  
      if (!monthAverages[monthYearKey]) {
        monthAverages[monthYearKey] = { sum: 0, count: 0 };
      }
  
      monthAverages[monthYearKey].sum += testingDays; // Add testing days to sum
      monthAverages[monthYearKey].count++; // Increment occurrence count
    });
  
    // Calculate average testing days for each month
    const monthLabels = []; // Labels for x-axis (months)
    const monthData = []; // Data for y-axis (average testing days)
    const sortedMonthYearKeys = Object.keys(monthAverages).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
  
    sortedMonthYearKeys.forEach((monthYearKey) => {
      const [month, year] = monthYearKey.split('-'); // Split the key into month and year
      const monthName = this.getMonthName(month); // Convert month number to name
      const average = monthAverages[monthYearKey].sum / monthAverages[monthYearKey].count;
      monthLabels.push(`${monthName} ${year}`); // Include year in the label
      monthData.push(average.toFixed(2)); // Round to 2 decimal places
    });
  
    // Create line chart data
    const data = {
      labels: monthLabels,
      datasets: [{
        label: 'Average Testing Days',
        backgroundColor: "#ce6edf",
        borderColor: "#ce6edf",
        fill: false,
        data: monthData
      }]
      
    };
  
    this.createOrUpdateChart('line', data, 'lineChart');
  }

  // Helper function to convert month number to name
  getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNumber) - 1]; // Subtract 1 as array is zero-based
  }

  createOrUpdateChart = (type, data, chartName) => {
    const ctx = this.chartRefs[chartName].current.getContext('2d');
    const existingChart = this.state.charts[chartName];

    if (existingChart) {
      existingChart.destroy();
    }

   
    const newChart = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    this.setState(prevState => ({
      charts: {
        ...prevState.charts,
        [chartName]: newChart
      }
    }));
  }

  render() {
    const { products } = this.state;
    return (
      <div className="dashboard-container">
        <div className='top-bar'>
        {this.state.loading && <LinearProgress size={40} />}
        <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
  <Toolbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
    <Typography variant="h6" className="title" style={{ whiteSpace: 'nowrap' }}>
      Admin Dashboard
    </Typography>
    <Box display="flex" justifyContent="center" flexGrow={1}>
      <Button variant="contained" size="small" color={this.state.filter === 'All' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('All')}>All</Button>&nbsp;
      <Button variant="contained" size="small" color={this.state.filter === 'Order' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Order')}>Order</Button>&nbsp;
      <Button variant="contained" size="small" color={this.state.filter === 'Tender' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Tender')}>Tender</Button>
    </Box>
    <Box display="flex" justifyContent="flex-end" marginRight={4}>
      <NavLink to="/User  Management" style={{ textDecoration: 'none' }}>
        <Button variant="contained" size="small" style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Users</Button>&nbsp;
      </NavLink>
      <Button variant="contained" size="small" onClick={this.logOut} style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Logout</Button>&nbsp;
    </Box>
  </Toolbar>
</AppBar>
        </div>
        
        <Sidebar/>
        <div className="content">
        <div className="filter-buttons"  style={{ marginBottom: '10px' }}>
  {/* <Button variant="contained" color={this.state.filter === 'All' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('All')}>All</Button>&nbsp;
  &nbsp;<Button variant="contained" color={this.state.filter === 'Order' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Order')}>Order</Button>&nbsp;
  &nbsp;<Button variant="contained" color={this.state.filter === 'Tender' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Tender')}>Tender</Button> */}
</div>
          {/* <Typography variant="h6" className="charts-heading">Visual Analysis</Typography><br /> */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">Firmware Status</Typography>
                <canvas ref={this.chartRefs.barChart} className="chart-canvas" />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">  Tester Stats </Typography>
                <canvas ref={this.chartRefs.testerChart} className="chart-canvas" />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                {/* <Typography variant="subtitle1" className="chart-title">Account Type</Typography> */}
                <canvas ref={this.chartRefs.pieChart} className="chart-canvas" />
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                {/* <Typography variant="subtitle1" className="chart-title">Average Testing Days</Typography> */}
                <canvas ref={this.chartRefs.lineChart} className="chart-canvas" />
              </Paper>
            </Grid>
          </Grid>
          <Paper className="table-card" >
            <Typography variant="h6" className="table-heading"  >Latest Firmware</Typography>
          
            {/* <br /> */}
            
        <div className="filter-buttons" style={{ marginBottom: '10px' }}>
  {/* <Button variant="contained" color={this.state.tableFilter === 'All' ? 'primary' : 'default'} onClick={() => this.handleTableFilterChange('All')}>All</Button>&nbsp; */}
  &nbsp;<Button variant="contained" size="small" color={this.state.tableFilter === 'In Progress' ? 'primary' : 'default'} onClick={() => this.handleTableFilterChange('In Progress')}>In Progress</Button>&nbsp;
  &nbsp;<Button variant="contained" size="small" color={this.state.tableFilter === 'Pending' ? 'primary' : 'default'} onClick={() => this.handleTableFilterChange('Pending')}>Pending</Button>
</div>

            <TableContainer>
              <Table striped>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Meter Version</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Rel. No.</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Utility</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Comms</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Config</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Platform</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>First Req Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {products
    .filter(product => {
      // if (this.state.tableFilter === 'All') return ['In Progress', 'In Progress_r', 'Pending'].includes(product.status);
      if (this.state.tableFilter === 'In Progress') return ['In Progress', 'In progress_R'].includes(product.status);
      if (this.state.tableFilter === 'Pending') return product.status === 'Pending';
    })
    .sort((a, b) => new Date(b.reqDate) - new Date(a.reqDate))
    .slice(0, 5)
    .map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.rel}</TableCell>
                      <TableCell>{product.customer}</TableCell>
                      <TableCell>{product.newCol1}</TableCell>
                      <TableCell>{product.newCol2}</TableCell>
                      <TableCell>
                        <Button size="small" style={{ backgroundColor: this.getStatusColor(product.status), color: 'white' }}>{product.status}</Button>
                      </TableCell>
                      <TableCell>{product.orderType}</TableCell>
                      <TableCell>{product.config}</TableCell>
                      <TableCell>{product.platform}</TableCell>
                      <TableCell>{formatDate(product.reqDate)}</TableCell>
                      <TableCell>{formatDate(product.submissionDate)}</TableCell>
                    
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    );
  }
}

export default withRouter(AdminDashboard); // Wrap component with withRouter
