const express = require("express");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");
require("dotenv").config();

const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers");

const app = express();

app.use(express.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

app.use("/", (req, res, next) => {
  res.send("Hello World");
});

PORT = process.env.PORT || 3003;
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-tutorial-iuwd6.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    // `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-tutorial-iuwd6.gcp.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })
  .catch(err => {
    console.log("There was an error with the connection");
    console.log(err);
  });
