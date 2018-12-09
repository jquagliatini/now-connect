/* eslint-env browser */

document.addEventListener('DOMContentLoaded', () => {
  const messageToRow = ({ id, session, email }) =>
    `<tr>
      <td>${session}</td>
      <td>${email}</td>
      <td>${id}</td>
      <td>${new Date().toLocaleString()}</td>
    </tr>`;

  const mainListBody = document.querySelector('#main');
  const source = new EventSource('/stream/sessions');
  source.addEventListener('message', ({ data }) => {
    const d = JSON.parse(data);
    mainListBody.insertAdjacentHTML('beforeend', messageToRow(d));
  });
});
