// Funzione per l'esecuzione di query
const executeQuery = async (connection, query, queryParams) => {
  try {
    return await connection
      .promise()
      .query(query, queryParams)
      .then((queryResults) => {
        return queryResults[0]
      })
      .catch((queryError) => {
        console.log(queryError)
        return false
      })
  } catch (err) {
    return false
  }
}

module.exports = { executeQuery }
