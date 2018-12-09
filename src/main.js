const { Router } = require('express');
const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
const id = require('shortid');

const { generateName } = require('./utils.js');

const sendLoginMail = require('./misc/sendLoginMail.js');

const app = new Router();
const ee = new EventEmitter();

ee.on('login', sendLoginMail);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use((req, _, next) => {
  req.emitter = ee;
  return next();
});

app.post('/signin', (req, res) => {
  if (!req.body.email || !/^.+@.+$/.test(req.body.email)) {
    return res.status(400).send('Expected an email');
  }

  const session = generateName();
  const sessionId = id();

  ee.emit('login', {
    session,
    id: sessionId,
    email: req.body.email,
  });

  req.db.sessions[session] = {
    token: sessionId,
    start: new Date(),
    email: req.body.email,
  };

  return res.render('signin', {
    session,
  });
});

app.get('/sessions/:sessionName', (req, res) => {
  // SSE
  const { sessionName } = req.params;
  if (!Object.prototype.hasOwnProperty.call(req.db.sessions, sessionName)) {
    res.sendStatus(404);
    return;
  }

  req.socket.setTimeout(0);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  });
  res.write('\n');

  const clickHandler = ({ token }) => {
    if (req.db.sessions[sessionName].token !== token) {
      return;
    }

    res.write('data: OK\n\n');
    req.emitter.removeListener(`sessions:${sessionName}`, clickHandler);
    req.connection.end();
  };

  req.emitter.once(`sessions:${sessionName}`, clickHandler);
});

app.get('/connect/:sessionName/:token', (req, res) => {
  const { sessionName } = req.params;
  const session = Object.prototype.hasOwnProperty.call(
    req.db.sessions,
    sessionName,
  )
    ? req.db.sessions[req.params.sessionName]
    : null;

  if (
    session &&
    req.query.email &&
    session.email === req.query.email &&
    session.token === req.params.token &&
    Date.now() - session.start < 10 * 60 * 1000
  ) {
    req.emitter.emit(`sessions:${req.params.sessionName}`, {
      token: req.params.token,
    });
    return res.sendStatus(204);
  }

  return res.sendStatus(404);
});

app.get('/sessions', (req, res) => {
  const sessions = Object.entries(req.db.sessions).map(([key, values]) => ({
    id: key,
    ...values,
  }));
  res.render('sessionsList.mustache', {
    sessions,
  });
});

app.get('/stream/sessions', (req, res) => {
  req.socket.setTimeout(0);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  });
  res.write('\n');

  const onLogin = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  req.emitter.on('login', onLogin);

  req.on('close', () => {
    req.emitter.removeListener('login', onLogin);
  });
});

module.exports = app;
