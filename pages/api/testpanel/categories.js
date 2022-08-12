import connection from '../db'

// ensure all fields are not empty
/**
 *
 * @param {request} req
 * @returns {boolean||array} boolean value or an array of values
 */
export function allfieldspresent(request) {
  //   grap all values of request body
  return Object.values(request.body).filter((value, index) => {
    return value != ''
  })
}

// validate absence of such category

function categoryExists(category, res) {
  return new Promise((resolve, reject) => {
    let mysqlQuery = `SELECT * FROM test_categories WHERE CATEGORY = '${category}'`
    connection.query(mysqlQuery, (err, result) => {
      if (err) reject(err)
      if (result) {
        if (result.length > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}

const postCategory = (request, response) => {
  // check if all fields are not empty
  if (allfieldspresent(req)) {
    // check if category exists
    categoryExists(req.body.category)
      .then((result) => {
        if (result) {
          res.status(409).send({
            message: 'Category already exists',
          })
        } else {
          // insert category into database
          let mysqlQuery = `INSERT INTO test_categories (CATEGORY,DESCRIPTION) VALUES 
          ('${req.body.category}','${req.body.description}')`
          connection.query(mysqlQuery, (err, result) => {
            if (err) throw err
            if (result) {
              res.status(201).send({
                message: 'Category created successfully',
              })
            }
          })
        }
      })
      .catch((err) => {
        throw err
      })
  } else {
    res.status(400).send({
      message: 'All fields are required',
    })
  }
}

const getCategory = (request, response) => {
  // determine if querie params exist
  if (Object.keys(request.query).length > 0) {
    const { id } = request.query
    //    determine if id is a number
    if (isNaN(id)) {
      response.status(400).send({
        message: 'Id must be a number',
      })
    } else {
      // query database for category with id
      let mysqlQuery = `SELECT * FROM test_categories WHERE ID = ${id}`

      connection.query(mysqlQuery, (err, result) => {
        if (err) {
          throw err
        }
        response.send(result)
      })
    }
  } else {
    let query = 'SELECT * FROM test_categories';
    // execute query
    connection.query(query, (err, result) => {
      if (err) {
        throw err
      }
      response.send(result)
    })
  }
}
const putCategory = (request, response) => {}
const deleteCategory = (request, response) => {}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      postCategory(req, res)
      break
    case 'GET':
      getCategory(req, res)
      break
    case 'PUT':
      putCategory(req, res)
      break
    case 'DELETE':
      deleteCategory(req, res)
      break
    default:
      res.status(405).send({
        message: 'Method not allowed',
      })
  }
}
