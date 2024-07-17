import SupplierLayout from "../../components/inventory/SupplierLayout";
import SUPPLIERS_LIST from "../../components/suppliers/supllyList";
import Pagination from "../../components/accessories/pagination";
import Loader from "../../components/accessories/Loader";
import { useState, useEffect } from "react";
import { customPost, generateRandomTextAndNumbers, getDataAndUpdateState } from "../../components/Auth/customFetch";
import { Button, Col, Row } from "react-bootstrap";
import PlusBookShelf from "../../components/icons/PlusOutlineSvg";
import { useRouter } from "next/navigation";
import AdvancedSupplierFilter from "../../components/suppliers/SupplierAdvancedFilter";

export default function SupplierListPage() {
          const [rawdata, setRawdata] = useState([]);
          const [loading, setLoading] = useState(true);
          const [query, setQuery] = useState({ page: 1, count: 10 });
          const [load, setLoad] = useState(false);
          const router = useRouter();

      const [bloading, setbLoading] = useState(false);
      const [filters, setFilters] = useState({
            name: '',
            email: '',
            contactperson: '',
      });

      const handleFilterChange = (e) => {
            const { name, value } = e.target;
            setFilters({ ...filters, [name]: value });
      };

      const handleFilterSubmit = async (e) => {
            e.preventDefault();
            try {
                  setLoading(true);
                  console.log('Implement backend filtering with:', filters);
            } catch (error) {
                  console.error('Error filtering:', error);
            } finally {
                  setLoading(false);
            }
      };

          useEffect(() => {
                    getDataAndUpdateState(setRawdata, `suppliers?count=${query.count}&&page=${query.page}`, false, setLoading);
          }, [query.count, query.page])


          const renderingView = () => {
                    if (loading) return <Loader />
                    else {
                              return (
                                        <section className='mx-2'>
                                                  <SUPPLIERS_LIST rawdata={rawdata}
                                                            editController={updatehandler}
                                                            deleteController={deletehandler} />
                                                  <div className='d-flex justify-content-center'>
                                                            <Pagination updateFunction={updatePage} page={query.page} load={setLoad} />
                                                  </div>
                                        </section>
                              )
                    }
          }



          const deletehandler = async (id, supplierid) => {
                    let confirmation = confirm(`Do you really want to delete supplier?`);
                    if (!confirmation) return
                    else {
                              try {
                                        const response = await customPost(`suppliers?supplierid=${supplierid}`, 'DELETE', {})
                                        const { status, message } = response;
                                        if (status === "success") {
                                                  toast.success(message, { autoClose: 500 });
                                                  // remove the deleted item from the list using the supplierid
                                                  const nwdata = rawdata.filter((item) => item.supplierid !== supplierid);
                                                  setRawdata(nwdata);
                                        }
                              } catch (error) {
                                        console.log(error)
                              }
                    }
          }


          const updatePage = (value) => {
                    updatePagination(value, setQuery, query);
          }


          // controller for updating a supplier
          const updatehandler = async (supplierid) => {
                    if (!supplierid || typeof supplierid != "number") return;
                    const generatefunnyid = generateRandomTextAndNumbers(20);
                    router.push(`/supplier/addnewsupplier?csvid=${generatefunnyid}${supplierid}&&gen=20`)
          }




      return <SupplierLayout>
            <Row className="mx-1">
                  <AdvancedSupplierFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onFilterSubmit={handleFilterSubmit}
                        loading={bloading}
                  />
                 </Row>   <Row className="mx-1">
                              <Col className="col-12 d-flex justify-content-end">
                                        <Button
                                                  onClick={(ev) => { router.push("/supplier/addnewsupplier") }}
                                                  variant="primary text-capitalize" style={{ position: 'absolute', left: '32%', top: '16.3%', zIndex: 888 }}>
                                                  <PlusBookShelf />
                                                  {" "}  add new supplier</Button>
                              </Col>
                    </Row>
                    {renderingView()}
          </SupplierLayout>
}