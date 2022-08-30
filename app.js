require("dotenv").config();
require("express-async-errors");
const methodOverride = require("method-override");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require("./db/connect");
const notFound = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

const task = require("./routes/task");
// incoming html
app.use(express.urlencoded({ limit: "10mb", extended: false }));
// incoming json
app.use(express.json());
// publicize corresponding folders
app.use(express.static("./public/"));
app.use("/home", express.static("./public/html/main.html"));
// publicize stepImagesUpload folder
app.use("/stepImagesUpload", express.static("./stepImagesUpload"));
// overriding request
app.use(methodOverride("_method"));

// routes
app.use("/", task);

// error handlers
app.use(notFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, (req, res) => console.log("connecting..."));
  } catch (error) {
    console.log(error);
  }
};

start();
