var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
require('dotenv').config();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
var product = require("./model/product.js");
const User = require('./model/user.js');
const crypto = require("crypto");
const session = require('express-session');
const salt = bcrypt.genSaltSync(10);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function( ) {
    console.log("hurray! we connected");
});

app.use("/", (req, res, next) => {
  next();
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }

    const userData = await User.findOne({ username });
    if (!userData) {
      return res.status(400).json({
        errorMessage: 'Username is incorrect!',
        status: false
      });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({
        errorMessage: 'Password is incorrect!',
        status: false
      });
    }

    // req.session.userId = userData._id; // Uncomment if using sessions

    res.status(200).json({
      token: 'dummyToken', // Generate a real token in a real-world application
      role: userData.role
    });
  } catch (error) {
    console.error("Error during login:", error); // Log the error for debugging
    res.status(500).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

const saltRounds = 10;
app.post("/register", (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }

    user.find({ username: username }, (err, data) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({
          errorMessage: 'Something went wrong!',
          status: false
        });
      }

      if (data.length === 0) {
        const defaultPassword = username + '123';
        const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
        let User = new user({
          username: username,
          password: hashedPassword,
          role: role,
          isFirstLogin: true,
        });

        User.save((err, data) => {
          if (err) {
            console.error('Error saving user:', err);
            return res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            // Here we can send the password to the user via email or any other method
            res.status(200).json({
              status: true,
              title: 'Registered Successfully',
              password: defaultPassword // You would typically not send this in a real app
            });
          }
        });
      } else {
        res.status(400).json({
          errorMessage: `UserName ${username} Already Exist!`,
          status: false
        });
      }
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


/* Function to check user and generate token */
function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

app.post("/add-product", (req, res) => {
  try {
    let {
      name = "",
      customer = "",
      accType = "",
      orderType = "",
      newCol1 = "",
      newCol2 = "",
      platform = "",
      reqDate = "",
      submissionDate = "",
      startDate = "",
      endDate = "",
      rolloverDate = "",
      rolloverDays = "",
      rolloverDaysH = "",
      waitingDays = "",
      waitingDaysH = "",
      testingDays = "",
      testingDaysH = "",
      config = "",
      status = "",
      testedBy = "",
      rel = "",
      reportNo = "",
      releaseDate = "",
      reviewedBy = "",
      codeCompare = "",
      newFW = "",
      tBugs = "",
      submissionReason = ""
    } = req.body;

    let errorMessage = '';
    let missingFields = [];

    if (!name) {
      missingFields.push('Name');
    }
    if (!customer) {
      missingFields.push('Customer');
    }
    if (!rel) {
      missingFields.push('Release Number');
    }

    if (missingFields.length > 0) {
      errorMessage = `Please fill in the following required fields: ${missingFields.join(', ')}.`;
      res.status(400).json({
        errorMessage,
        status: false
      });
      return;
    }

    // Check if a product with the same name already exists
    product.findOne({ name: name }, (err, existingProduct) => {
      if (err) {
        res.status(400).json({
          errorMessage: err,
          status: false
        });
        return;
      }

      if (existingProduct) {
        errorMessage = `A product with the name ${name} already exists.`;
        res.status(400).json({
          errorMessage,
          status: false
        });
        return;
      }

      let new_product = new product({
        name,
        customer,
        accType,
        orderType,
        newCol1,
        newCol2,
        platform,
        reqDate,
        submissionDate,
        startDate,
        endDate,
        rolloverDate,
        rolloverDays,
        rolloverDaysH,
        waitingDays,
        waitingDaysH,
        testingDays,
        testingDaysH,
        config,
        status,
        testedBy,
        rel,
        reportNo,
        releaseDate: req.body.releaseDate ? new Date(req.body.releaseDate) : null,
        reviewedBy,
        codeCompare,
        newFW,
        tBugs,
        submissionReason,
        //user_id: req.user.id
      });

      new_product.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product Added successfully.'
          });
        }
      });
    });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.post("/update-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findById(req.body.id, (err, new_product) => {
        if (err || !new_product) {
          return res.status(404).json({
            errorMessage: 'Product not found!',
            status: false
          });
        }
        Object.keys(req.body).forEach(key => {
          if (req.body[key] !== undefined && req.body[key] !== null) {
            new_product[key] = req.body[key];
          }
        });

        new_product.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Product updated.'
            });
          }
        });
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


/* Delete Product API */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
        if (data && data.is_delete) {
          res.status(200).json({
            status: true,
            title: 'Product deleted.'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

// app.get("/get-product", (req, res) => {
//   try {
//     var query = {};
//     query["$and"] = [];
//     query["$and"].push({
//       is_delete: false
//     });
//     if (req.query && req.query.search) {
//       const searchQuery = { $regex: req.query.search, $options: 'i' };
//       query["$and"].push({
//         $or: [
//           { customer: searchQuery },
//           { name: searchQuery },
//           { platform: searchQuery },
//           { config: searchQuery },
//           { testedBy: searchQuery },
//           { status: searchQuery}
//         ]
//       });
//     }
//     // var perPage = 5;
//     var perPage = 5000;
//     var page = req.query.page || 1;
//     product.find(query, { date: 1, name: 1, id: 1,customer: 1, accType: 1,orderType: 1, newCol1: 1, newCol2: 1,platform: 1,  config: 1, status: 1, testedBy: 1, reqDate: 1, submissionDate: 1, startDate: 1, endDate: 1, rolloverDate: 1, rolloverDays: 1, rolloverDaysH: 1, waitingDays: 1, waitingDaysH: 1, testingDays: 1, testingDaysH: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, rel: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, tBugs: 1, submissionReason: 1, image: 1 })
//       .sort({ reqDate: -1 })
//       .skip((perPage * page) - perPage).limit(perPage)
//       .then((data) => {
//         //console.log("Data from backend:", data);
//         product.find(query).count()
//           .then((count) => {
//             if (data && data.length > 0) {
//               res.status(200).json({
//                 status: true,
//                 title: 'Product retrived.',
//                 products: data,
//                 current_page: page,
//                 total: count,
//                 pages: Math.ceil(count / perPage),
//               });
//             } else {
//               res.status(400).json({
//                 errorMessage: 'There is no product!',
//                 status: false
//               });
//             }
//           });
//       }).catch(err => {
//         res.status(400).json({
//           errorMessage: err.message || err,
//           status: false
//         });
//       });
//   } catch (e) {
//     res.status(400).json({
//       errorMessage: 'Something went wrong!',
//       status: false
//     });
//   }
// });

app.get("/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { customer: searchQuery },
          { name: searchQuery },
          { platform: searchQuery },
          { config: searchQuery },
          { testedBy: searchQuery },
          { status: searchQuery }
        ]
      });
    }
    
    var perPage = 5000;
    var page = req.query.page || 1;

    // Count occurrences of matching products across any fields
    product.find(query).count() // Get count for matching products
      .then((totalMatches) => {
        product.find(query, { /* selected fields here */ })
          .sort({ reqDate: -1 })
          .skip((perPage * page) - perPage).limit(perPage)
          .then((data) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Products retrieved.',
                products: data,
                current_page: page,
                total: totalMatches, // Send the total match count
                pages: Math.ceil(totalMatches / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'No products found!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


app.get("/get-users", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { username: searchQuery },
          { role: searchQuery }
        ]
      });
    }
    var perPage = 10;
    var page = req.query.page || 1;
    console.log("Query:", query); // Log the query
    User.find(query, { username: 1, role: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        console.log("Data from backend:", data);
        User.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Users retrieved.',
                users: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There are no users!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Use your JWT secret
    return decoded.userId; // Assuming the token contains the userId
  } catch (error) {
    return null;
  }
};

app.get('/get-user', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ errorMessage: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ errorMessage: 'Unauthorized: Invalid token format' });
  }

  // Replace 'your_jwt_secret' with your actual secret key used to sign the JWT
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ errorMessage: 'Unauthorized: Invalid token' });
    }

    const userId = decoded.id; // Adjust according to how the ID is stored in the token

    if (!userId) {
      return res.status(401).json({ errorMessage: 'Unauthorized: User ID not found in token' });
    }

    User.findById(userId, { username: 1, role: 1 })
      .then(user => {
        if (!user) {
          return res.status(404).json({ errorMessage: 'User not found' });
        }
        res.status(200).json({ user });
      })
      .catch(err => {
        res.status(500).json({ errorMessage: 'Internal server error', error: err.message });
      });
  });
});

app.put("/edit-user/:id", (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;
  User.findByIdAndUpdate(id, { username, role }, { new: true })
    .then((user) => {
      res.status(200).json({
        status: true,
        message: 'User updated successfully.',
        user
      });
    })
    .catch((err) => {
      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });
    });
});

// Route for deleting a user
app.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;

  User.findByIdAndUpdate(id, { is_delete: true })
    .then(() => {
      res.status(200).json({
        status: true,
        message: 'User deleted successfully.'
      });
    })
    .catch((err) => {
      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });
    });
});

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.get("/graph-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { customer: searchQuery },
          { name: searchQuery },
          { platform: searchQuery },
          { config: searchQuery },
          { testedBy: searchQuery },
          { status: searchQuery}
        ]
      });
    }
    var perPage = 1000;
    var page = req.query.page || 1;
    product.find(query, { date: 1, name: 1, id: 1,customer: 1, accType: 1,orderType: 1, newCol1: 1, newCol2: 1,platform: 1,  config: 1, status: 1, testedBy: 1, reqDate: 1, submissionDate: 1, startDate: 1, endDate: 1, rolloverDate: 1, rolloverDays: 1, rolloverDaysH: 1, waitingDays: 1, waitingDaysH: 1, testingDays: 1, testingDaysH: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, rel: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, tBugs: 1, submissionReason: 1, image: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        //console.log("Data from backend:", data);
        product.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Product retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no product!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

// Endpoint to reset password
app.post('/reset-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        errorMessage: 'User not found!',
        status: false
      });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errorMessage: 'Old password is incorrect!',
        status: false
      });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully.',
      status: true
    });
  } catch (err) {
    res.status(500).json({
      errorMessage: err.message || 'Something went wrong!',
      status: false
    });
  }
});


app.post('/api/re-password', async (req, res) => {
  const { username, newPassword } = req.body;
  
  try {
    // Check if the user exists
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    existingUser.password = hashedPassword;
    existingUser.isFirstLogin = true; // Optionally reset isFirstLogin flag
    await existingUser.save();

    // Respond with success message
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

app.get("/get-tester-list", (req, res) => {
  try {
    User.find({ is_delete: false }, { username: 1 }) // Only select the username field
      .then((data) => {
        if (data && data.length > 0) {
          res.status(200).json({
            status: true,
            title: 'Testers retrieved.',
            testers: data.map(user => user.username) // Extract usernames
          });
        } else {
          res.status(400).json({
            errorMessage: 'No testers found!',
            status: false
          });
        }
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


app.get("/get-platform-list", (req, res) => {
  try {
    product.distinct('platform', { is_delete: false }) // Use distinct to get unique platform values
      .then((platforms) => {
        if (platforms && platforms.length > 0) {
          res.status(200).json({
            status: true,
            title: 'Platforms retrieved.',
            platforms: platforms
          });
        } else {
          res.status(400).json({
            errorMessage: 'No platforms found!',
            status: false
          });
        }
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.get("/get-status-list", (req, res) => {
  try {
    // Initialize the query
    var query = { is_delete: false }; // Ensure we are only fetching non-deleted records

    // Optionally handle search if needed
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["status"] = searchQuery; // Apply search query to status field
    }

    // Fetch all unique statuses
    product.distinct('status', query) // Use distinct to get unique status values
      .then((statuses) => {
        if (statuses && statuses.length > 0) {
          res.status(200).json({
            status: true,
            title: 'Statuses retrieved.',
            statuses: statuses
          });
        } else {
          res.status(400).json({
            errorMessage: 'No statuses found!',
            status: false
          });
        }
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


app.get("/get-orderType-list", (req, res) => {
  try {
    // Initialize the query
    var query = { is_delete: false }; // Ensure we are only fetching non-deleted records

    // Optionally handle search if needed
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["orderType"] = searchQuery; // Apply search query to orderType field
    }

    // Fetch all unique order types
    product.distinct('orderType', query) // Use distinct to get unique orderType values
      .then((orderTypes) => {
        if (orderTypes && orderTypes.length > 0) {
          res.status(200).json({
            status: true,
            title: 'Order Types retrieved.',
            orderTypes: orderTypes
          });
        } else {
          res.status(400).json({
            errorMessage: 'No order types found!',
            status: false
          });
        }
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.get("/get-config-list", (req, res) => {
  try {
    // Initialize the query
    var query = { is_delete: false }; // Ensure we are only fetching non-deleted records

    // Optionally handle search if needed
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["config"] = searchQuery; // Apply search query to config field
    }

    // Fetch all unique config values
    product.distinct('config', query) // Use distinct to get unique config values
      .then((configs) => {
        if (configs && configs.length > 0) {
          res.status(200).json({
            status: true,
            title: 'Config values retrieved.',
            configs: configs
          });
        } else {
          res.status(400).json({
            errorMessage: 'No config values found!',
            status: false
          });
        }
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});



// Other existing routes...
app.listen(2001, () => {
  console.log("Server is running on port 2001");
});

