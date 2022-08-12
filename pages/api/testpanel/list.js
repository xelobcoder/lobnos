import connection from '../db'
import { allfieldspresent } from './categories'

const testpanel = {
  listquery: 'SELECT * FROM test_panels',
  listqueryid: function (action, id) {
    return `${action} * FROM test_panels WHERE id = ${id}`
  },
  hasquery: function (request) {
    return Object.keys(request.query).length > 0 ? true : false
  },
  updatequery: function (id, price, category) {
    return `UPDATE test_panels SET price = ${price}, category = ${category} WHERE id = ${id}`
  },
  postquery: function (name, price, category) {
    return `INSERT INTO test_panels (NAME,CATEGORY,PRICE) VALUES ('${name}','${category}','${price}')`
  },
  getPanels: function (request, response) {
    connection.query(testpanel.listquery, (err, result) => {
      if (err) throw err
      response.send(result)
    })
  },
  updatePanel: function (request, response) {
    const { id, price, category } = request.query
    // check if all fields are present
    if (id && price && category) {
      // check if all fields have values
      if (allfieldspresent(request.body)) {
        connection.query(
          testpanel.updatequery(id, price, category),
          (err, result) => {
            if (err) throw err
            if (result) {
              response.send({
                message: 'Panel updated successfully',
              })
            }
          },
        )
      } else {
        response.send({
          message: 'All fields must have values',
        })
      }
    }
  },
  deletePanel: function (request, response) {
    if (this.hasquery(request)) {
      const { id } = request.query
      connection.query(testpanel.listqueryid('DELETE', id), (err, result) => {
        if (err) throw err
        response.send(result)
      }),
        (err, result) => {
          if (err) throw err
          response.send(result)
        }
    } else {
      response.send({
        message: 'Id is required',
      })
    }
  },
  postPanel: function (request, response) {
    if (allfieldspresent(request.body)) {
      const { name, price, category } = request.body
      if (id && price && category) {
        connection.query(
          this.postquery(name, price, category),
          (err, result) => {
            if (err) throw err
            response.send({
              message: 'test panel successfully added',
            })
          },
        )
      } else {
        response.send({
          message: 'All fields are required',
        })
      }
    }
  },
}

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      testpanel.getPanels(req, res)
      break
    case 'DELETE':
      testpanel.deletePanel(req, res)
      break
    case 'PUT':
      testpanel.updatePanel(req, res)
      break
    case 'POST':
      testpanel.postPanel(req, res)
    default:
      res.status(405).send({
        message: 'Method not allowed',
      })
      break
  }
}
