// Generazione di una chiave casuale per i JWT
const crypto = require('crypto'); 
const promise = new Promise((resolve) => {
    // randomBytes Generates cryptographically strong pseudorandom data
    crypto.randomBytes(32 /* oppure 64 */, (err, buffer) => { 
        if (err) throw err;
        resolve(buffer.toString('hex'));  
    });
}).then((randomBytes) => {
    console.log(randomBytes);
});