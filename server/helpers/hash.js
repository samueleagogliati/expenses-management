const bcrypt = require("bcrypt");

// Funzione per produrre l'hash della password dell'utente
const hashPassword = async (password) => {
  const saltRounds = 13;
  const hashedPassword = await new Promise((resolve) => {
    bcrypt.hash(password, saltRounds, (error, hash) => {
      if (error) resolve(false);
      resolve(hash);
    });
  });
  return hashedPassword;
};

module.exports = { hashPassword };
