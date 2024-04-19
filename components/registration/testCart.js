import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import AutoDeleteIcon from '@mui/icons-material/AutoDelete'
export default function TESTCART({ testArray, emptytestcart, handleRemove, calculate }) {
  const renderer = () => {
    if (testArray.length <= 0) {
      return <h6>No data added to cart</h6>
    } else {
      return (
        <table className='table ttable' >
          <thead className="p-0">
            <tr>
              <th>test</th>
              <th>cost</th>
              <th>remove</th>
            </tr>
          </thead>
          <tbody>
            {testArray.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}. {" "}{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <RemoveCircleIcon
                      onClick={(e) => handleRemove(e, item)}
                      color="error"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className='bg-white'>
            <tr>
              <td>
                <span>Amount</span>
              </td>
              <td>
                {testArray.reduce((acc, curr) => {
                  return acc + curr.price
                }, 0)}
              </td>
              <td>
                <button className='btn btn-danger btn-sm my-1' onClick={(e) => emptytestcart(e)}    >
                  <AutoDeleteIcon /> remove all
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      )
    }
  }
  return (
    <>
      {renderer()}
    </>
  )
}
