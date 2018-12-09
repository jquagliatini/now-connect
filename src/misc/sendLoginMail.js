const mailer = require('nodemailer');
const mustache = require('mustache');
const { readFile } = require('fs');

function sendLoginMail({ email, session, id }) {
  const transport = mailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true,
  });

  const host = process.env.APP_URL || `localhost:${process.env.PORT || 3000}`;
  const url = `http://${host}/connect/${session}/${id}?email=${encodeURIComponent(
    email,
  )}`;
  const mailText = `
We have received a login attempt with the following code: ${session}.

To complete the login process, please copy and paste the url below:

  ${url}
`;

  readFile('views/loginMail.mustache', (err, buffer) => {
    if (err) {
      this.emit(
        'error',
        new Error(
          `something went wrong while reading views/loginMail.mustache`,
        ),
      );
    }

    const mailHtml = mustache.render(buffer.toString(), {
      session,
      url,
      host,
    });

    const opts = {
      from: 'contact@test.com',
      to: email,
      subject: `login verification (${session})`,
      text: mailText,
      html: mailHtml,
    };

    transport.sendMail(opts, (mailSendingError, info) => {
      if (err) {
        console.error(mailSendingError); // eslint-disable-line no-console
        this.emit('mail:sending:error', err);
        return;
      }
      this.emit('mail:sent', info);
    });
  });
}

module.exports = sendLoginMail;
