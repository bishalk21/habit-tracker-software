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
- - made a post request in the router with the data in the req.body

# Model

- Model is a class that defines the behavior of the data that will be stored in the database.
- create model call User with queries
- call the queries and pass the data to store data in the database

# connect to mongodb

- import mongoose
- connect to mongodb
- mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true });
- create a variable to store the connection
