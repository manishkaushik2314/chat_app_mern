const mongoose = require("mongoose");

const url = `mongodb+srv://manmohitmanu:AdminManmohit@cluster0.9e9qrmg.mongodb.net/?retryWrites=true&w=majority`;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log("Error", e));
