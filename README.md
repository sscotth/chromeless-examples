# chromeless-examples

Initial implementation of recording a GIF from chromeless

TODO: Make it chainable

```js
chromeless
  .beginRecording()
  .goto('https://www.google.com')
  .type('chromeless', 'input[name="q"]')
  .press(13)
  .wait('#resultStats')
  .wait(1000)
  .endRecording()
  .end()
```

```sh
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222 --disable-gpu --headless
node index.js
```

Declare the gif location with the environment variable `OUTPUT_FILE`

```sh
OUTPUT_FILE=recording.gif node index.js
```
