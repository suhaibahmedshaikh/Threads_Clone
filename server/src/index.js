const express = require("express");
const app = express();
const { PORT } = require("./config/envConfig");

app.get("/", (req, res) => {
  res.send("Hello from Backend");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
