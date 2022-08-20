import {Container,Button} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
export default function TESTCART ({testArray,emptytestcart}) {
    return(
        <>
        <div>
                {
                    testArray.length == 0 ? null :
                        (
                            <>
                                <table className='billing-cart-table'>
                                    <thead className='p-0'>
                                        <tr>
                                            <th>no</th>
                                            <th>test</th>
                                            <th>cost</th>
                                            <th>remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            testArray.map((item, index) => {
                                                return (<tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.NAME}</td>
                                                    <td>{item.PRICE}</td>
                                                    <td><RemoveCircleIcon color='error'/></td>
                                                </tr>)
                                            })

                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={1}></td>
                                            <td >total</td>
                                            <td>{testArray.reduce((acc, curr) => { return acc + curr.PRICE }, 0)}</td>
                                            <td>
                                             <Button startIcon={<AutoDeleteIcon/>} type='button' variant='standard' onClick={(e) => emptytestcart(e)}>
                                              remove all    
                                            </Button></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </>
                        )
                }
            </div>
        </>
    )
}