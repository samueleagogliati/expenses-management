const crypto = require('crypto')
const promise = new Promise((resolve) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) throw err
    resolve(buffer.toString('hex'))
  })
}).then((randomBytes) => {
  console.log(randomBytes)
})
