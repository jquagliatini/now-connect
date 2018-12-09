# now.sh login system

I was amazed by how ingenious the [now.sh](https://now.sh) login system is.
I always wanted to reproduce it, so here is the base project.

Basically, it's playing a lot with Server Sent Events and the EventEmitter API from node.

## Installation

Just run a

    $ npm i -g maildev
    $ npm i
    $ maildev # You could do a `npx maildev` too!
    $ npm start # in another terminal

Then open maildev in a browser at http://localhost:1080. Just after that, open another tab at
http://localhost:3000.

Fill in any valid email address, and check the inbox in maildev. Click the button, you should see
a message "login success" on the first form. That's it!

## Roadmap

- [x] basic auth scenario
- [ ] adding a setTimeout
- [ ] adding a real data store (redis)
- [ ] security (see below)
- [ ] JWT to keep the authentication state.

## Security Considerations

At the moment, the implementation is naive at best.
One could really simply DOS the system, by simply sending a batch of request to the `/signin`
endpoint. Preventing this could be done by throttling the requests, logging the ip address, and
a load of things I still need to investigate.

## Endpoints

### /

The main endpoint, serving a authentication form with only a email field.

### POST /signin

The email handling operation. Will start the email sending operation, and serve another html
page subsribing to a SSE page.

### /sessions

If you want to check at any moment the current state of the app. It's a page subscribing to the
'login' event displaying all the past and present sessions. By doing so, it automatically
updates as soon as someone logs in.

### /connect/{sessionName}/{token}?email={email}

Fires the connection event and validates the user's email.

### /stream/sessions

A SSE endpoint to subscribe to any new login requests.

### /session/{sessionName}

SSE endpoint to subscribe to the 'clicked on login button in email' event.
Sessions names are a well known duo of adjective + animal name.
