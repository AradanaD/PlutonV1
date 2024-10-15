// import React, { Component } from 'react';
// import { Paper, AppBar, Toolbar, Typography, Button, LinearProgress } from '@material-ui/core';
// import Chart from 'chart.js/auto';
// import axios from 'axios';
// import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// import { IconButton } from '@material-ui/core';
// const API_URL = process.env.REACT_APP_API_URL; // For create-react-app

// class InflowOutflow extends Component {
//   constructor() {
//     super();
//     this.state = {
//       token: '',
//       loading: false,
//       inflowData: {},
//       outflowData: {},
//       releasedData: {},
//       months: [],
//     };
//     this.monthChartRef = React.createRef();
//     this.quarterChartRef = React.createRef();
//     this.yearChartRef = React.createRef();
//   }

//   componentDidMount() {
//     let token = localStorage.getItem('token');
//     if (!token) {
//       this.props.navigate("/login");
//     } else {
//       this.setState({ token: token }, () => {
//         this.getProduct();
//       });
//     }
//   }

//   getProduct = () => {
//     this.setState({ loading: true });
//     axios.get(`${API_URL}/graph-product`, {
//       headers: {
//         'token': this.state.token
//       }
//     })
//     .then((res) => {
//       const products = res.data.products;
//       const { inflowData, outflowData, releasedData, months } = this.calculateInflowOutflow(products);
//       this.setState({ loading: false, inflowData, outflowData, releasedData, months }, () => {
//         this.createInflowOutflowChart();
//         this.createQuarterlyChart();
//         this.createYearlyChart();
//       });
//     })
//     .catch((err) => {
//       this.setState({ loading: false });
//       console.error('Error fetching product data:', err);
//     });
//   }

//   calculateInflowOutflow = (products) => {
//     const inflowData = {};
//     const outflowData = {};
//     const releasedData = {};
//     const monthsSet = new Set();

//     products.forEach((product) => {
//       const submissionDate = new Date(product.submissionDate);
//       if (submissionDate.getFullYear() === 1970 && submissionDate.getMonth() === 0) return; // Exclude Jan 1970 records
//       const monthYear = `${submissionDate.getMonth() + 1}-${submissionDate.getFullYear()}`;

//       if (!inflowData[monthYear]) inflowData[monthYear] = 0;
//       if (!outflowData[monthYear]) outflowData[monthYear] = 0;
//       if (!releasedData[monthYear]) releasedData[monthYear] = 0;

//       inflowData[monthYear]++;
//       if (product.status === 'Completed' || product.status === 'Released') outflowData[monthYear]++;
//       if (product.status === 'Released') releasedData[monthYear]++;

//       monthsSet.add(monthYear);
//     });

//     const months = Array.from(monthsSet).sort((a, b) => {
//       const [monthA, yearA] = a.split('-');
//       const [monthB, yearB] = b.split('-');
//       return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
//     });

//     return { inflowData, outflowData, releasedData, months };
//   }

//   createInflowOutflowChart = () => {
//     const ctx = this.monthChartRef.current.getContext('2d');
//     const { inflowData, outflowData, releasedData, months } = this.state;

//     const monthNames = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];

//     const data = {
//       labels: months.map(month => {
//         const [mm, yyyy] = month.split('-');
//         return `${monthNames[parseInt(mm, 10) - 1]} ${yyyy}`;
//       }),
//       datasets: [
//         {
//           label: 'Inflow',
//           backgroundColor: '#ff9933',
//           data: months.map(month => inflowData[month] || 0)
//         },
//         {
//           label: 'Outflow',
//           backgroundColor: '#50bfe6',
//           data: months.map(month => outflowData[month] || 0)
//         },
//         {
//           label: 'Released',
//           backgroundColor: '#34C759',
//           borderColor: '#34C759',
//           borderWidth: 2,
//           fill: false,
//           type: 'line',
//           data: months.map(month => releasedData[month] || 0)
//         }
//       ]
//     };

//     new Chart(ctx, {
//       type: 'bar',
//       data: data,
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         },
//         plugins: {
//           legend: {
//             position: 'top'
//           }
//         }
//       }
//     });
//   }

//   calculateQuarterlyData = () => {
//     // const quarters = {
//     //   'Q1': { inflow: 0, outflow: 0, released: 0 },
//     //   'Q2': { inflow: 0, outflow: 0, released: 0 },
//     //   'Q3': { inflow: 0, outflow: 0, released: 0 },
//     //   'Q4': { inflow: 0, outflow: 0, released: 0 },
//     // };

//     // Object.keys(this.state.inflowData).forEach(monthYear => {
//     //   const [month, year] = monthYear.split('-');
//     //   const monthNum = parseInt(month, 10);

//     //   let quarter;
//     //   if (monthNum >= 1 && monthNum <= 3) quarter = 'Q1';
//     //   else if (monthNum >= 4 && monthNum <= 6) quarter = 'Q2';
//     //   else if (monthNum >= 7 && monthNum <= 9) quarter = 'Q3';
//     //   else if (monthNum >= 10 && monthNum <= 12) quarter = 'Q4';

//     //   quarters[quarter].inflow += this.state.inflowData[monthYear] || 0;
//     //   quarters[quarter].outflow += this.state.outflowData[monthYear] || 0;
//     //   quarters[quarter].released += this.state.releasedData[monthYear] || 0;
//     // });

//     // return quarters;
//     let quarters = {};

//   Object.keys(this.state.inflowData).forEach(monthYear => {
//     const [month, year] = monthYear.split('-');
//     const monthNum = parseInt(month, 10);

//     let quarter;
//     if (monthNum >= 1 && monthNum <= 3) quarter = `Q1 ${year}`;
//     else if (monthNum >= 4 && monthNum <= 6) quarter = `Q2 ${year}`;
//     else if (monthNum >= 7 && monthNum <= 9) quarter = `Q3 ${year}`;
//     else if (monthNum >= 10 && monthNum <= 12) quarter = `Q4 ${year}`;

//     if (!quarters[quarter]) quarters[quarter] = { inflow: 0, outflow: 0, released: 0 };

//     quarters[quarter].inflow += this.state.inflowData[monthYear] || 0;
//     quarters[quarter].outflow += this.state.outflowData[monthYear] || 0;
//     quarters[quarter].released += this.state.releasedData[monthYear] || 0;
//   });

//   return quarters;
//   }

//   createQuarterlyChart = () => {
//     const ctx = this.quarterChartRef.current.getContext('2d');
//     const quarterlyData = this.calculateQuarterlyData();

//     const data = {
//       labels: Object.keys(quarterlyData).map(year => year),
//       datasets: [
//         {
//           label: 'Inflow',
//           backgroundColor: '#ff9933',
//           data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter] ? quarterlyData[quarter].inflow : 0)
//         },
//         {
//           label: 'Outflow',
//           backgroundColor: '#50bfe6',
//           data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter] ? quarterlyData[quarter].outflow : 0)
//         },
//         {
//           label: 'Released',
//           backgroundColor: '#34C759',
//           data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter] ? quarterlyData[quarter].released : 0)
//         }
//       ]
//     };

//     new Chart(ctx, {
//       type: 'bar',
//       data: data,
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         },
//         plugins: {
//           legend: {
//             position: 'top'
//           }
//         }
//       }
//     });
//   }

//   calculateYearlyData = () => {
//     // let totalInflow = 0;
//     // let totalOutflow = 0;
//     // let totalReleased = 0;

//     // Object.keys(this.state.inflowData).forEach(monthYear => {
//     //   totalInflow += this.state.inflowData[monthYear] || 0;
//     //   totalOutflow += this.state.outflowData[monthYear] || 0;
//     //   totalReleased += this.state.releasedData[monthYear] || 0;
//     // });

//     // return { totalInflow, totalOutflow, totalReleased };
//     let yearlyData = {};
 
// Object.keys(this.state.inflowData).forEach(monthYear => {
//   const [month, year] = monthYear.split('-');
 
//   if (!yearlyData[year]) yearlyData[year] = { inflow: 0, outflow: 0, released: 0 };
 
//   yearlyData[year].inflow += this.state.inflowData[monthYear] || 0;
//   yearlyData[year].outflow += this.state.outflowData[monthYear] || 0;
//   yearlyData[year].released += this.state.releasedData[monthYear] || 0;
// });
 
// return yearlyData;
//   }
 
//   createYearlyChart = () => {
//     const ctx = this.yearChartRef.current.getContext('2d');
//     const yearlyData = this.calculateYearlyData();
 
//     // const data = {
//     //   labels: ['2023'],
//     //   datasets: [
//     //     {
//     //       label: 'Inflow',
//     //       backgroundColor: '#ff9933',
//     //       data: [yearlyData.totalInflow]
//     //     },
//     //     {
//     //       label: 'Outflow',
//     //       backgroundColor: '#50bfe6',
//     //       data: [yearlyData.totalOutflow]
//     //     },
//     //     {
//     //       label: 'Released',
//     //       backgroundColor: '#34C759',
//     //       data: [yearlyData.totalReleased]
//     //     }
//     //   ]
//     // };
//     const data = {
//       labels: Object.keys(yearlyData).map(year => year),
//       datasets: [
//         {
//           label: 'Inflow',
//           backgroundColor: '#ff9933',
//           data: Object.keys(yearlyData).map(year => yearlyData[year].inflow)
//         },
//         {
//           label: 'Outflow',
//           backgroundColor: '#50bfe6',
//           data: Object.keys(yearlyData).map(year => yearlyData[year].outflow)
//         },
//         {
//           label: 'Released',
//           backgroundColor: '#34C759',
//           data: Object.keys(yearlyData).map(year => yearlyData[year].released)
//         }
//       ]
//     };
 
//     new Chart(ctx, {
//       type: 'bar',
//       data: data,
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         },
//         plugins: {
//           legend: {
//             position: 'top'
//           }
//         }
//       }
//     });
//   }
 
//   handleLogout = () => {
//     localStorage.removeItem('token');
//     this.props.navigate("/");
//   };
 
//   render() {
//     const containerStyle = {
//       margin: 0,
//       padding: 0,
//       width: '100%',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center'
//     };
 
//     const canvasStyle = {
//       width: '100%',
//       maxWidth: '1000px',
//       margin: '20px 0'
//     };
 
//     const headingStyle = {
//       margin: '20px 0 10px 0',
//       textAlign: 'center'
//     };
 
//     return (
//       <div>
//         <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
//           <Toolbar>
//           <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
//     <ArrowBackIcon />
//   </IconButton>
 
//             <Typography variant="h6" style={{ marginRight: 'auto' }}>
//               Inflow-Outflow
//             </Typography>
//             <Button color="inherit" onClick={this.handleLogout} style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Logout</Button>
//           </Toolbar>
//         </AppBar>
//         {this.state.loading && <LinearProgress />}
//         <div style={containerStyle}>
//           <Typography variant="h6" style={headingStyle}>Monthly Stats</Typography>
//           <Paper className="chart-card" style={canvasStyle}>
//             <canvas ref={this.monthChartRef} className="chart-canvas"/>
//           </Paper>
//           <Typography variant="h6" style={headingStyle}>Quarterly Stats</Typography>
//           <Paper className="chart-card" style={canvasStyle}>
//             <canvas ref={this.quarterChartRef} className="chart-canvas"/>
//           </Paper>
//           <Typography variant="h6" style={headingStyle}>Yearly Stats</Typography>
//           <Paper className="chart-card" style={canvasStyle}>
//             <canvas ref={this.yearChartRef} className="chart-canvas"/>
//           </Paper>
//         </div>
//       </div>
//     );
//   }
// }  
// export default InflowOutflow;

import React, { Component } from 'react';
import { Paper, AppBar, Toolbar, Typography, Button, LinearProgress, IconButton } from '@material-ui/core';
import Chart from 'chart.js/auto';
import axios from 'axios';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
 
const API_URL = process.env.REACT_APP_API_URL;
 
class InflowOutflow extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      loading: false,
      inflowData: {},
      outflowData: {},
      releasedData: {},
      months: [],
    };
    this.monthChartRef = React.createRef();
    this.quarterChartRef = React.createRef();
    this.yearChartRef = React.createRef();
  }
 
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
 
  getProduct = () => {
    this.setState({ loading: true });
    axios.get(`${API_URL}/graph-product`, {
      headers: {
        'token': this.state.token
      }
    })
    .then((res) => {
      const products = res.data.products;
      const { inflowData, outflowData, releasedData, months } = this.calculateInflowOutflow(products);
      this.setState({ loading: false, inflowData, outflowData, releasedData, months }, () => {
        this.createInflowOutflowChart();
        this.createQuarterlyChart();
        this.createYearlyChart();
      });
    })
    .catch((err) => {
      this.setState({ loading: false });
      console.error('Error fetching product data:', err);
    });
  }
 
  calculateInflowOutflow = (products) => {
    const inflowData = {};
    const outflowData = {};
    const releasedData = {};
    const monthsSet = new Set();
 
    products.forEach((product) => {
      const submissionDate = new Date(product.submissionDate);
      if (submissionDate.getFullYear() === 1970 && submissionDate.getMonth() === 0) return; // Exclude Jan 1970 records
 
      const monthYear = `${submissionDate.getMonth() + 1}-${submissionDate.getFullYear()}`;
 
      if (!inflowData[monthYear]) inflowData[monthYear] = 0;
      if (!outflowData[monthYear]) outflowData[monthYear] = 0;
      if (!releasedData[monthYear]) releasedData[monthYear] = 0;
 
      inflowData[monthYear]++;
      if (product.status === 'Completed' || product.status === 'Released') outflowData[monthYear]++;
      if (product.status === 'Released') releasedData[monthYear]++;
 
      monthsSet.add(monthYear);
    });
 
    const months = Array.from(monthsSet).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
 
    return { inflowData, outflowData, releasedData, months };
  }
 
 
  createInflowOutflowChart = () => {
    const ctx = this.monthChartRef.current.getContext('2d');
    const { inflowData, outflowData, releasedData, months } = this.state;
 
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
 
    const data = {
      labels: months.map(month => {
        const [mm, yyyy] = month.split('-');
        return `${monthNames[parseInt(mm, 10) - 1]} ${yyyy}`;
      }),
      datasets: [
        {
          label: 'Inflow',
          backgroundColor: '#ff9933',
          data: months.map(month => inflowData[month] || 0)
        },
        {
          label: 'Outflow',
          backgroundColor: '#50bfe6',
          data: months.map(month => outflowData[month] || 0)
        },
        {
          label: 'Released',
          backgroundColor: '#34C759',
          borderColor: '#34C759',
          borderWidth: 2,
          fill: false,
          type: 'line',
          data: months.map(month => releasedData[month] || 0)
        }
      ]
    };
 
    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
  calculateQuarterlyData = () => {
    let quarters = {};
   
    Object.keys(this.state.inflowData).forEach(monthYear => {
      const [month, year] = monthYear.split('-');
      const monthNum = parseInt(month, 10);
   
      let quarter;
      if (monthNum >= 1 && monthNum <= 3) quarter = `Q1 ${year}`;
      else if (monthNum >= 4 && monthNum <= 6) quarter = `Q2 ${year}`;
      else if (monthNum >= 7 && monthNum <= 9) quarter = `Q3 ${year}`;
      else if (monthNum >= 10 && monthNum <= 12) quarter = `Q4 ${year}`;
   
      if (!quarters[quarter]) quarters[quarter] = { inflow: 0, outflow: 0, released: 0 };
   
      quarters[quarter].inflow += this.state.inflowData[monthYear] || 0;
      quarters[quarter].outflow += this.state.outflowData[monthYear] || 0;
      quarters[quarter].released += this.state.releasedData[monthYear] || 0;
    });
   
    const sortedQuarters = Object.keys(quarters).sort((a, b) => {
      const [quarterA, yearA] = a.split(' ');
      const [quarterB, yearB] = b.split(' ');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      else {
        const quarterNumberA = quarterA.replace('Q', '');
        const quarterNumberB = quarterB.replace('Q', '');
        return parseInt(quarterNumberA) - parseInt(quarterNumberB);
      }
    });
   
    const sortedQuartersData = {};
    sortedQuarters.forEach(quarter => {
      sortedQuartersData[quarter] = quarters[quarter];
    });
   
    return sortedQuartersData;
  }
  
   
  createQuarterlyChart = () => {
    const ctx = this.quarterChartRef.current.getContext('2d');
    const quarterlyData = this.calculateQuarterlyData();
   
    const data = {
      labels: Object.keys(quarterlyData).map(quarter => quarter),
      datasets: [
        {
          label: 'Inflow',
          backgroundColor: '#ff9933',
          data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter].inflow)
        },
        {
          label: 'Outflow',
          backgroundColor: '#50bfe6',
          data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter].outflow)
        },
        {
          label: 'Released',
          backgroundColor: '#34C759',
          data: Object.keys(quarterlyData).map(quarter => quarterlyData[quarter].released)
        }
      ]
    };
   
    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
  calculateYearlyData = () => {
    let yearlyData = {};
 
    Object.keys(this.state.inflowData).forEach(monthYear => {
      const [month, year] = monthYear.split('-');
 
      if (!yearlyData[year]) yearlyData[year] = { inflow: 0, outflow: 0, released: 0 };
 
      yearlyData[year].inflow += this.state.inflowData[monthYear] || 0;
      yearlyData[year].outflow += this.state.outflowData[monthYear] || 0;
      yearlyData[year].released += this.state.releasedData[monthYear] || 0;
    });
 
    return yearlyData;
  }
 
 
  createYearlyChart = () => {
    const ctx = this.yearChartRef.current.getContext('2d');
    const yearlyData = this.calculateYearlyData();
 
    const data = {
      labels: Object.keys(yearlyData).map(year => year),
      datasets: [
        {
          label: 'Inflow',
          backgroundColor: '#ff9933',
          data: Object.keys(yearlyData).map(year => yearlyData[year].inflow)
        },
        {
          label: 'Outflow',
          backgroundColor: '#50bfe6',
          data: Object.keys(yearlyData).map(year => yearlyData[year].outflow)
        },
        {
          label: 'Released',
          backgroundColor: '#34C759',
          data: Object.keys(yearlyData).map(year => yearlyData[year].released)
        }
      ]
    };
 
    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
 
 
  handleLogout = () => {
    localStorage.removeItem('token');
    this.props.navigate("/");
  };
 
  render() {
    const containerStyle = {
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    };
 
    const canvasStyle = {
      width: '100%',
      maxWidth: '1000px',
      margin: '20px 0'
    };
 
    const headingStyle = {
      margin: '20px 0 10px 0',
      textAlign: 'center'
    };
 
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
              <ArrowBackIcon />
            </IconButton>
 
            <Typography variant="h6" style={{ marginRight: 'auto' }}>
              Inflow-Outflow
            </Typography>
            <Button color="inherit" onClick={this.handleLogout} style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Logout</Button>
          </Toolbar>
        </AppBar>
        {this.state.loading && <LinearProgress />}
        <div style={containerStyle}>
          <Typography variant="h6" style={headingStyle}>Monthly Stats</Typography>
          <Paper className="chart-card" style={canvasStyle}>
            <canvas ref={this.monthChartRef} className="chart-canvas"/>
          </Paper>
          <Typography variant="h6" style={headingStyle}>Quarterly Stats</Typography>
          <Paper className="chart-card" style={canvasStyle}>
            <canvas ref={this.quarterChartRef} className="chart-canvas"/>
          </Paper>
          <Typography variant="h6" style={headingStyle}>Yearly Stats</Typography>
          <Paper className="chart-card" style={canvasStyle}>
            <canvas ref={this.yearChartRef} className="chart-canvas"/>
          </Paper>
        </div>
      </div>
    );
  }
}
 
const InflowOutflowWithNavigate = (props) => {
  const navigate = useNavigate();
  return <InflowOutflow {...props} navigate={navigate} />;
}
 
export default InflowOutflowWithNavigate;
