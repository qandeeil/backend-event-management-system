import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import userRouter from "./src/user/userRoutes";
import eventRouter from "./src/event/eventRoutes";
import errorHandler from "./src/common/middleware/errorHandler";
var cors = require("cors");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
import morgan from "morgan";
import path from "path";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// show logs request
app.use(morgan("dev"));

// connection to database
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const MongoURI =
  process.env.NODE_ENV === "development"
    ? "mongodb://127.0.0.1:27017/event-management-system"
    : `mongodb+srv://${username}:${password}@cluster0.wqfwxbi.mongodb.net/event-management-system`;
mongoose.connect(MongoURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.log(`we're connected DB!`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Event management system");
});

// get profile image
app.use(
  "/public/profile_image",
  express.static(path.join("public/profile_image"))
);

app.use(
  "/public/event_images",
  express.static(path.join("public/event_images"))
);

app.use(errorHandler);
app.use(cors());

app.use("/user", userRouter);
app.use("/event", eventRouter);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
