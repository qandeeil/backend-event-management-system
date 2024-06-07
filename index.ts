import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import userRouter from "./src/user/userRoutes";
import errorHandler from "./src/common/middleware/errorHandler";
var cors = require("cors");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// connection to database
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
mongoose.connect(
  `mongodb+srv://${username}:${password}@cluster0.wqfwxbi.mongodb.net/event-management-system`
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.log(`we're connected DB!`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Event management system");
});

app.use(errorHandler);
app.use(cors());

app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
