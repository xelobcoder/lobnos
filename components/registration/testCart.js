import { Button } from '@mui/material'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import AutoDeleteIcon from '@mui/icons-material/AutoDelete'
export default function TESTCART({ testArray, emptytestcart, handleRemove, outstanding }) {
  return (
    <>
      {testArray.length == 0 ? null : (
          <>
            <table className='billing-cart-table br-5 bg-white'>
              <thead className="p-0">
                <tr>
                  <th>no</th>
                  <th>test</th>
                  <th>cost</th>
                  <th>remove</th>
                </tr>
              </thead>
              <tbody>
                {testArray.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
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
                  <td colSpan={1}></td>
                  <td>
                    <span>Payable Amount</span>
                  </td>
                  <td>
                    {testArray.reduce((acc, curr) => {
                      return acc + curr.PRICE
                    }, 0)}
                  </td>
                  <td>
                    <Button
                      startIcon={<AutoDeleteIcon />}
                      type="button"
                      className='m-2'
                      variant="contained"
                      color='error'
                      size='small'
                      onClick={(e) => emptytestcart(e)}
                    >
                      remove all
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
            <div>

            </div>
          </>
        )}
    </>
  )
}
