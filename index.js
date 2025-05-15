require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

const urlDatabase = {};
let counter = 1;

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.send({ error: "invalid url" }); // changed from .json
  }

  const domain = originalUrl.replace(/^https?:\/\//, "").split("/")[0];

  dns.lookup(domain, function (err) {
    if (err) {
      return res.send({ error: "invalid url" }); // changed from .json
    }

    const shortId = counter++;
    urlDatabase[shortId] = originalUrl;

    res.send({
      original_url: originalUrl,
      short_url: shortId,
    }); // changed from .json
  });
});

app.get("/api/shorturl/:short", function (req, res) {
  const short = parseInt(req.params.short, 10);
  const originalUrl = urlDatabase[short];

  if (originalUrl) {
    return res.redirect(301, originalUrl);
  } else {
    res.send({ error: "No short URL found for given input" }); // changed from .json
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
