"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./src/user/userRoutes"));
const errorHandler_1 = __importDefault(require("./src/common/middleware/errorHandler"));
var cors = require("cors");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
//For env File
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// show logs request
app.use((0, morgan_1.default)("dev"));
// connection to database
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const MongoURI = process.env.NODE_ENV === "development"
    ? "mongodb://127.0.0.1:27017/event-management-system"
    : `mongodb+srv://${username}:${password}@cluster0.wqfwxbi.mongodb.net/event-management-system`;
mongoose.connect(MongoURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    // we're connected!
    console.log(`we're connected DB!`);
});
app.get("/", (req, res) => {
    res.send("Welcome to Event management system");
});
// get profile image
app.use("/public/profile_image", express_1.default.static(path_1.default.join("public/profile_image")));
app.use(errorHandler_1.default);
app.use(cors());
app.use("/user", userRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
