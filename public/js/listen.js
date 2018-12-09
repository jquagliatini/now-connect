/* eslint-env browser */

(() => {
  let source;

  const main = () => {
    const session = document.login.session_name.value;
    source = new EventSource(`/sessions/${session}`);

    const onMessage = ({ data }) => {
      if (data === 'TIMEOUT') {
        throw new Error('TimeoutError');
      } else if (data !== 'OK') {
        throw new Error();
      }

      document.login.session_name.childNodes.forEach((n) => {
        n.disabled = true; // eslint-disable-line no-param-reassign
      });

      document
        .querySelector('main')
        .insertAdjacentHTML('afterbegin', '<p>Login Success!</p>');
    };

    source.addEventListener('message', onMessage);
    return onMessage;
  };

  const handleError = (e, onMessage) => {
    const message =
      e.message === 'TimeoutError'
        ? 'You should try to log again, your token is expired'
        : 'Something bad happened, try to log again';

    source.removeEventListener('message', onMessage);

    document
      .querySelector('main')
      .insertAdjacentHTML(
        'afterbegin',
        `<p class="alert error">${message}</p>`,
      );
  };

  document.addEventListener('DOMContentLoaded', () => {
    let cb;
    try {
      cb = main();
    } catch (e) {
      handleError(e, cb);
    }
  });
})();
