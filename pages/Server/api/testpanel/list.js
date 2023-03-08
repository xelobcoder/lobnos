const connection = require ('../db');
const { allFieldsHasValues } = require ('./categories')
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
  panelExist: function (name) {
    return new Promise((resolve, reject) => {
      let query = `SELECT NAME FROM test_panels WHERE NAME = '${name}'`
      connection.query(query, (err, result) => {
        if (err) {
          reject(err)
        }
        if (result) {
          if (result.length > 0) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    })
  },
  getPanels: function (request, response) {
    connection.query(this.listquery, (err, result) => {
      if (err) throw err
      response.send(result)
    })
  },
  updatePanel: function (request, response) {
    const { id, price, category } = request.query
    // check if all fields are present
    if (id && price && category) {
      // check if all fields have values
      if (allFieldsHasValues(request.body)) {
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
    if (allFieldsHasValues(request)) {
      const { name, price, category } = request.body
      if (name && price && category) {
        this.panelExist(name)
          .then((res) => {
            if (res) {
              response.send({
                message: 'panel Already Exist'
              })
            }
            else {
              connection.query(
                this.postquery(name, price, category),
                (err, result) => {
                  if (err) throw err
                  response.send({
                    message: 'test panel successfully added',
                  })
                },
              )
            }
          })
      } else {
        response.send({
          message: 'All fields are required',
        })
      }
    }
  },
}

module.exports = testpanel;
