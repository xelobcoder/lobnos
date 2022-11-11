import connection from "../../db";

const chemistry_db_tables = {
  liver: 'setup_liver_function_test',
  renal: 'setup_renal',
  fbc: 'setup_full_blood_count_test_male'
}

const createParameter = async function (parameterDetails, tablename,response) {
  const { parameter, unit, lower, upper } = parameterDetails;
  // check if paramter exist 
  const isExist = function (objct = {}, checkedAgaints) {
    let state = false;
    connection.query(`SELECT * FROM ${tablename}`, (err, results) => {
      if (err) { throw err }
      if (results) {
        if (Object.values(results).includes(parameter)) {
          state = true;
        }
      }
    })

    return state;
  }

  // add parameter 
  if (!isExist()) {

    let SQL_QUERY = `INSERT INTO ${tablename} (PARAMETER,UNIT,LOWER,UPPER)
 VALUES (?,?,?,?)`;
    connection.query(SQL_QUERY, [parameter, unit, lower, upper], function (err, result) {
      if (err) { throw err };
      response.send({
        status: 200,
        success: true,
        message: 'parameter successfully created'
      })
    })
  }
}


const deleteparameter = function (params, response) {
  const [parameter, deleteid, tablename] = params;
  if (parameter && deleteid && tablename) {
    database_queries.setup_deleteParameter(tablename, deleteid)
      .then((r) => {
        response.send({
          message: paramter + " " + 'deleted',
          status: 200
        })
      })
      .catch((err) => { throw err; })
  }
}




export default function createParams(request, response) {
  const method = request.method;
  switch (method) {
    case 'POST':
      const { parameterDetails, testname } = JSON.parse(request.body);
      const tablename = chemistry_db_tables[testname];
      // take three arguments , the testname, the testprams eg paramter name,unit,upper and lower 
      if (parameterDetails && testname) {
        createParameter(parameterDetails, tablename,response)
      } else {
        response.send({
          message: `provide neccessary details including testname,parameter,unit,upper and lower limit`
        })
      }
      break;
    case 'GET':
      const hasQueries = Object.keys(request.query).length > 0;

      if (hasQueries && Object.keys(request.query).includes('testname')) {
        const db_to_query = chemistry_db_tables[request.query.testname];
        connection.query(`SELECT * FROM ${db_to_query}`,
          (err, result) => {
            if (err) {
              throw err;
            }
            response.send(result)
          })
      }
    default:
      return 'http method not recognized';
  }
}