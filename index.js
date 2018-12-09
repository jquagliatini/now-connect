const express = require('express');
const app = express();
const {
  readFile
} = require('fs');
const mustache = require('mustache');

const main = require('./src/main.js');
const db = {
  sessions: {},
};

app.engine('mustache', (filePath, options, callback) => {
  readFile(filePath, (err, content) => {
    return err ?
      callback(err) :
      callback(
        null,
        mustache.render(content.toString(), options),
      );
  });
});

app.set('view engine', 'mustache');

app.use((req, _, next) => {
  req.db = db;
  return next();
});
app.use(express.static('public'));

app.use(main);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listens on ${port}`);
});
