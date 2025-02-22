const bcrypt = require("bcryptjs")

const passport = require("passport")
const localStrategy = require("passport-local").Strategy
const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

// Connessione al database creata in precedenza
const connection = globalVariable.connection

// Definizione della strategia utilizzata per il login dell'utente
passport.use(
  new localStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      // Query per verificare se l'utente è nel database
      const query = "SELECT * FROM Utente WHERE email = ?"
      const queryParams = [email]

      try {
        // Confronto tra hash per verificare se la password è corretta
        await connection
          .promise()
          .query(query, queryParams)
          .then((queryResults) => {
            let user = queryResults[0][0]
            if (!user) {
              done(null, false)
            } else {
              bcrypt.compare(
                password,
                String(user.password),
                (compareError, compareResult) => {
                  if (compareError) {
                    done(compareError)
                  } else if (compareResult) {
                    done(null, {
                      email: user.email,
                      nome: user.nome,
                      cognome: user.cognome,
                      root: user.root,
                      istituzione: user.istituzione,
                    })
                  } else {
                    done(null, false)
                  }
                },
              )
            }
          })
          .catch((queryError) => {
            done(queryError)
            console.log(queryError)
          })
      } catch (err) {
        done(err)
      }
    },
  ),
)

// Definizione della strategia per controllare il token presentato dall'utente
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.TOKEN_KEY,
    },
    (jwtPayload, done) => {
      return done(null, {
        email: jwtPayload.email,
        nome: jwtPayload.nome,
        cognome: jwtPayload.cognome,
        root: jwtPayload.root,
        istituzione: jwtPayload.istituzione,
      })
    },
  ),
)

module.exports = passport
