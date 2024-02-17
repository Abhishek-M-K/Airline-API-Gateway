const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again later",
});

app.use(morgan("combined"));
app.use(limiter);

app.use('/bookingservice', (req,res,next)=>{
    //put it in a try catch block
    console.log(req.headers['x-access-token']);
    const response = axios.get('http://localhost:3001/api/v1/isUserAuthenticated', {
        headers:{
            'x-access-token': req.headers['x-access-token']
        }
    });
    console.log(response.data);
    console.log('Middleware for booking service');
    if(response.data.success) next();
    else res.status(401).json({message: 'Unauthorized'}); 
})

app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://localhost:3030/",
    changeOrigin: true,
  })
);

app.get("/about", (req, res) => {
  return res.json({ message: "Welcome to the about page!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
