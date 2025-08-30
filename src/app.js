const express = require("express");
const app = express();
const cors = require("cors");
const database = require("./db");
const halmet = require("helmet");
const userRouter = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const sonodRouter = require("./routes/sonodRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(halmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
database();

// routing

app.use("/api/user", userRouter);
app.use("/api/sonod", sonodRouter);

app.use(errorHandler);

module.exports = app;
