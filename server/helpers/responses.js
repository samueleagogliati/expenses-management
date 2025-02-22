// Funzione per avere un formato standard di risposta in caso di successo
const successResponse = (
  data = null,
  statusCode = 200,
  message = "The request has succeeded.",
) => {
  return {
    status: statusCode,
    message: message,
    data: data,
  }
}

// Funzione per avere un formato standard di risposta in caso di errore
const failResponse = (
  statusCode = 500,
  message = "The server cannot process the request.",
) => {
  return {
    status: statusCode,
    message: message,
    data: null,
  }
}

module.exports = { successResponse, failResponse }
