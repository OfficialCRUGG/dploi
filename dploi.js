require('dotenv').config();
const log = require("logg.js");
const express = require("express");
const bodyparser = require("body-parser");
const app = express();
app.use(bodyparser.json({ type: "application/json" }));
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send({status: "error", code: 1, message: "There was no Endpoint specified."});
});
app.post("/", (req, res) => {
    res.send({status: "error", code: 2, message: "There was no Endpoint specified."});
});

app.use("/autoDeploy/", require("./routes/autoDeploy"));

let server = app.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_IP, () => {
    log.info("Express is now running on " + process.env.EXPRESS_IP + ":" + process.env.EXPRESS_PORT);
});