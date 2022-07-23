# Steps

- install rest api client extension

- npm init -y (create package.json)
  edit package.json: author, start, dev,

# Express

- express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- npm install express --save

# cors

- cors is a node.js package for providing a Connect/Express middleware that can be used to enable CORS.
- npm i cors
  edit package.json: type: "module", // module is for node.js
- add rest.http // it is for express rest api

# Body parser

- body-parser is a node.js package for parsing incoming request bodies in a middleware-friendly way.
- npm install body-parser

- add and edit server.js
  const express = require('express');
  const app = express();
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const port = 8000;
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

# app.listen

- listen is a method that starts the server.
  app.listen(port, () => console.log(`Server started on port ${port}`));

# app.get

- get is a method that handles GET requests.
- app.get('/', (req, res) => res.send('Hello World!'));

# middleware

- middleware is a function that is called before the request is handled by the router.
- add middleware: app.use((cors()))

# Express.json

- express.json() is a middleware that parses JSON and sets the body property of the request object to the parsed data.
- setup express.json() to parse the incoming data in the req.body

# Router

- express.Router() is a function that returns a new Router instance and helps you organize your application into logical components.
- created a router to handle the requests
- install mongoose to connect to mongodb

# Schema

- Schema is a class that defines the structure of the data that will be stored in the database.
- create schema call userSchema
- inside new schema, define the properties of the user
- status is a string that can be either "active" or "inactive" // this is to check if the user is active or not or if the user is valid or not
- made a post request in the router with the data in the req.body
- indexing should be done on the status property

# Model

- Model is for CRUD operations on the database.
- Model is a class that provides the functionality of the database.
- Model is a class that defines the behavior of the data that will be stored in the database.
- create model call User with queries
- call the queries and pass the data to store data in the database

# connect to mongodb

- import mongoose
- connect to mongodb
- mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true });
- create a variable to store the connection

# Axios

- Axios is a promise based HTTP client for the browser and node.js.
- npm install axios
- make helper folder in client-side and import axios in axiosHelper.js
- import axios
- make rootUrl variable in axiosHelper.js
- import axiosHelper.js to register.js to use axios and update the handleOnSubmit function

# Toastify

- npm install toastify-js
- import toastify-js to App.js
- import toastify-js to register.js to use toastify-js (toast only) to show the toast message

# created alert on form submit

# User login on the client side

- get methodin userRouter.js
- get user in usermodel and pass the user data to the userRouter.js

# local storage

- arguments are key and value;

# session storage
