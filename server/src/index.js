// imports
const express = require("express");
const app = express();
const { PORT } = require("./config/envConfig");
const connectDB = require("./config/dbConfig");
const userRouter = require("./routes/user-routes");

// configurations
connectDB();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
