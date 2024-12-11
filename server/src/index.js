// imports
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/envConfig");
const connectDB = require("./config/dbConfig");
const userRouter = require("./routes/user-routes");
const postRouter = require("./routes/post-router");

// configurations
connectDB();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
src/index.jssrc/index.js
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
