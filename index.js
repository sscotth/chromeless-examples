const run = async () => {
  try {
    const { Chromeless } = require('chromeless')
    const chromeless = new Chromeless()

    // begin recording
    const frames = []
    const recording = setInterval(async () => frames.push(await chromeless.screenshot()), 50)

    // actions
    await chromeless
      .goto('https://www.google.com')
      .type('chromeless', 'input[name="q"]')
      .press(13)
      .wait('#resultStats')
      .wait(1000)
      .end()

    // end recording
    clearInterval(recording)

    generateGIFfromPNGs(frames).then(console.log).then(() => deleteFiles(frames))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

const deleteFiles = files => {
  const { remove } = require('fs-extra')
  return Promise.all(files.map(f => remove(f)))
}

// convert frames into GIF
const generateGIFfromPNGs = pngs => new Promise(async (res, rej) => {
  const { resolve, join } = require('path')
  const { tmpdir } = require('os')
  const fs = require('fs')

  const GIFEncoder = require('gifencoder')
  const pngFileStream = require('png-file-stream')
  const sizeOf = require('image-size')
  const unionBy = require('lodash/unionBy')
  const uuid = require('uuid/v4')

  const outputFile = resolve(process.env.OUTPUT_FILE || join(tmpdir(), `${uuid()}.gif`))

  const pngsWithHashes = await Promise.all(pngs.map(p => hashFile(p)))
  const uniquePNGs = unionBy(pngsWithHashes, 'hash')

  const { height, width } = sizeOf(pngs[0])
  const encoder = new GIFEncoder(width, height)

  const inputGlob = pngArrayToGlob(uniquePNGs)

  pngFileStream(inputGlob)
    .pipe(encoder.createWriteStream({ repeat: -1, delay: 1000, quality: 5 }))
    .pipe(fs.createWriteStream(outputFile))
    .on('finish', () => res(outputFile))
    .on('error', rej)
})

const hashFile = (path, maxBytes = ONE_MEGABYTE = 1048576) => new Promise((res, rej) => {
  const { createReadStream } = require('fs')
  const { createHash } = require('crypto')

  // maxBytes sets a limit incase a large file is read. Only the first X bytes will be hashed
  createReadStream(path, { start: 0, end: maxBytes })
    .pipe(createHash('md5').setEncoding('hex'))
    .on('finish', function () { res({ path, hash: this.read() }) })
    .on('error', rej)
})

const pngArrayToGlob = files => {
  const { basename } = require('path')
  return `/tmp/+(${files.map(({ path }) => basename(path, '.png')).join('|')}).png`
}

run().catch(console.error)
