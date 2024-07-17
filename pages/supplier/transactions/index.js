import { Clear, DateRange, Search } from "@mui/icons-material";
import SupplierLayout from "../../../components/inventory/SupplierLayout";
import { Button, ButtonGroup, Col, Row } from "react-bootstrap";
import DatePickerRange from "./../../../components/accessories/DatePickerRange";
import { useEffect, useState } from "react";
import { customFetch, handleChangeWithState } from "../../../components/Auth/customFetch";
import TableDisplay from "../../../components/accessories/TableDisplay";
import Pagination from "../../../components/accessories/pagination";
import { useRouter } from "next/navigation";

const filterDefault = { page: 1, count: 10 };
const endpointDefault = `orders/transactions?count=10&&page=1&&paginate=true`;

export default function SupplysTransactions() {
    const router = useRouter();
    const [date, setDate] = useState({ from: new Date(), end: new Date() });
    const [filter, setFilter] = useState(filterDefault);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endpoint, setEndpoint] = useState(endpointDefault);




    const clearFilterTransactions = () => {
        setEndpoint(endpointDefault);
        setFilter(filterDefault);
        setDate({ from: null, end: null });
    }

          const getRange = (values) => {
              setDate({ from: values[0], end: values[1] })
          }



    useEffect(() => {
        setLoading(true);
              customFetch(endpoint)
                              .then((data) => {
                                        Array.isArray(data) && setData(data);
                              })
                              .catch((err) => {
                                  setData([])
                                  setLoading(false);
                              }).finally(() => { setLoading(false) })
          }, [endpoint])



          const columns = [
                    {
                              Header: 'Requested By',
                              accessor: 'requestedby'
                    },
                    {
                              Header: 'Received By',
                              accessor: 'receivedby'
                    },
                    {
                              Header: 'Order Transaction ID',
                              accessor: 'orderTransactionid'
                    },
                    {
                              Header: 'Order Date',
                              accessor: 'orderdate',
                              Cell: ({ value }) => value ? new Date(value).toLocaleString() : ''
                    }, {
                              Header: "details",
                              accessor: "",
                              Cell: ({ row }) => <Button
                                        onClick={(ev) => { router.push(`/supplier/transactions/${row.original.orderTransactionid}`) }}
                                        variant="primary" className="btn-sm">view details</Button>
                    }
          ];



    const filterTransactions = () => {
        if (date.end && date.from) {
            let endpoint = `orders/transactions?page=${filter.page}&&count=${filter.count}&&from=${date.from}&&end=${date.end}&&paginate=true`;
            setEndpoint(endpoint);
        }
    }

          return <SupplierLayout>



              <Row className="mx-1">
                              <Col className="d-flex col-2">
                      <DateRange /> <DatePickerRange placeholder="select date here" getRange={getRange} start={date.from} end={date.end} />
                              </Col>
                  <Col>

                      <ButtonGroup>
                          <Button onClick={filterTransactions} variant="secondary" size="sm">
                              <Search /> Filter Transactions
                          </Button>
                          <Button onClick={clearFilterTransactions} variant="danger" size="sm" >
                              <Clear /> Clear Filter
                          </Button>
                      </ButtonGroup>
                  </Col>
                    </Row>
                    <Row className="d-flex justify-content-between mx-1 col-12">
                              <Col>
                                        <h6>Transactions</h6>

                              </Col>

                    </Row>
                    <Row className="mx-1">
                              <TableDisplay showpage={false} filtering={true} column={columns} data={data} />
                    </Row>
                    <Row className="mx-1">

                              <Col className="col-12 d-flex justify-content-center">

                                        <Pagination /></Col>
                    </Row>
          </SupplierLayout>
}