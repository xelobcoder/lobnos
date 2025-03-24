import { Button } from "@mui/material";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import TableDisplay from "../../../components/accessories/TableDisplay";
import InventoryIcon from "@mui/icons-material/Inventory";
import { customData, customFetch, customPost, getDepartment } from "../../../components/Auth/customFetch";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
export default function Stocksrequest() {
     const [hxData, setHxData] = useState([]);
     const [departmentId, setDepartmentId] = useState("");
     const [department, setDepartments] = useState([]);



     useEffect(() => { getDepartment(setDepartments) }, []);


     useMemo(() => {
          async function fetchRequisitions() {
               if (departmentId) {
                    try {
                         await customData(`store/departments/requisitions?id=${departmentId}&&type=pending`, setHxData);
                    } catch (error) {
                         console.error(error);
                    }
               }
          }
          fetchRequisitions();
     }, [departmentId]);


     // useEffect(() => {
     //   if (hxData.length > 0) {
     //     let stockidx = hxData.map((item, index) => { return item.stockid }).join(',');
     //     customFetch(`stock/general/lotno?stockidx=${stockidx}`)
     //       .then((data) => {
     //         const { statusCode, status, result } = data;
     //         if (statusCode == 200 && status == 'success') {
     //           const modifiedhx = hxData.map((item, index) => {
     //             const { stockid } = item;
     //             const brands = result.filter((ee, ii) => { return ee.stockid == stockid });
     //             return { ...item, brands, selectedbatch: null }
     //           })
     //           setHxData(modifiedhx);
     //         }
     //       }).catch((err) => setBrandLot([]))
     //   }
     // }, [hxData.length])


     const handleSupply = async (e, id) => {
          const filtered = hxData.filter((item) => item.id === id);
          let BrandError = 0;
          // quantity parsed to integer
          console.log(filtered)
          const quantity = parseInt(filtered[0].quantity);
          const approved = parseInt(filtered[0].quantity_approved);
          if (filtered[0].quantity_approved === null) {
               alert("Please supply the quantity");
               return;
          }

          // check if the quantity approved is greater than the quantity requested
          if (approved > quantity) {
               alert("Quantity supplied cannot be greater than quantity available");
               return;
          }

          if (approved < 0) {
               alert("Quantity supplied cannot be less than 0");
               return;
          }

          filtered.map((item, index) => {
               const { brand, batchnumber } = item;
               if (!brand || !batchnumber) {
                    alert('lot or brand not selected');
                    BrandError++;
               }
          });




          // check if the quantity approved is less than the quantity requested
          if (approved >= 0 && approved <= quantity && BrandError === 0) {
               // update the quantity approved
               // send the data to the backend
               try {
                    const batchnumber = filtered[0]['batchnumber'];
                    const brand = filtered[0]['brand'];
                    const patch_requisition = async () => {
                         const response = await customPost(`departments/requisitions?id=${id}`, 'PATCH', {
                              quantity_approved: approved,
                              store_supplied: approved === 0 ? 0 : 1,
                              batchnumber,
                              brand
                         })

                         const { status, statusCode } = response;

                         if (status === "success" && statusCode === 200) {
                              alert("Request approved successfully");
                              const filtered = hxData.filter((item) => item.id !== id);
                              setHxData(filtered);
                         } else {
                              alert("Request not approved");
                         }
                    };
                    patch_requisition();
               } catch (error) {
                    console.error(error);
               }
          }
     };

     const handleRequiredQty = (e, id) => {
          const { value } = e.target;
          const filtered = hxData.filter((item) => item.id === id);
          filtered[0].quantity_approved = parseInt(value);
     };

     const columns = [
          {
               Header: "id",
               accessor: "id",
          },
          {
               Header: "Name",
               accessor: "name",
          },
          {
               Header: "Consumption Unit",
               accessor: "comsumptionunit",
          },
          {
               Header: "General Stock quantity",
               accessor: "quantity",
          },
          {
               Header: "Quantity Requested",
               accessor: "quantity_requested",
          },
          {
               Header: 'brand', accessor: '', Cell: ({ row }) => {
                    const brands = row.original?.brands || [];
                    return (
                         <>
                              <select className="custom-select" value={row.original?.brand || ''} onChange={(ev) => handleBrandlotUpdate(ev, row.original, 'brand')}>
                                   <option>select brand</option>
                                   {brands.map((item, index) => {
                                        return (
                                             <option key={index}>{item.brand}</option>
                                        )
                                   })}
                              </select>
                         </>
                    )
               }
          },
          {
               Header: 'lot', accessor: '', Cell: ({ row }) => {
                    const brands = row.original?.selectedbatch || [];
                    return (
                         <>
                              <select className="custom-select" value={row.original?.batchnumber || ''} onChange={(ev) => handlelotUpdate(ev, row.original, 'lot')}>
                                   <option >selet lot number</option>
                                   {brands.map((item, index) => {
                                        return (
                                             <option key={index}>{item.batchnumber}</option>
                                        )
                                   })}
                              </select>
                         </>
                    )
               }
          },
          {
               Header: "Quantity Approved",
               accessor: "quantity_approved",
               Cell: ({ row }) => (
                    <>
                         <input
                              type="number"
                              id="redplaceholder"
                              placeholder={row.original.quantity <= 0 ? "out of stock" : null}
                              onChange={(e) => {
                                   handleRequiredQty(e, row.original.id);
                              }}
                              className="custom-input"
                              disabled={row.original.quantity <= 0 ? true : false}
                         />
                    </>
               ),
          },
          {
               Header: "action",
               accessor: "supply ",
               Cell: ({ row }) => (
                    <>
                         <Button
                              onClick={(e) => handleSupply(e, row.original.id)}
                              startIcon={<InventoryIcon />}
                              variant="contained"
                              color="success"
                              size="small"
                         >
                              Supply
                         </Button>
                    </>
               ),
          },
     ];


     const handleBrandlotUpdate = async (ev, data, target) => {
          const { value } = ev.target;
          const { stockid } = data;
          const getIndex = hxData.findIndex((item, index) => { return item.stockid === stockid });

          const nwdata = hxData.map((item, index) => {
               if (index === getIndex) {
                    const { brands } = item;
                    item['brand'] = value;
                    if (brands.length > 0) {
                         const batchNumber = brands.filter((ii, index) => { return ii.brand == value });
                         return { ...item, [target]: value, selectedbatch: batchNumber }
                    } else {
                         return { ...item, [target]: value }
                    }
               } else {
                    return item;
               }
          });
          setHxData(nwdata);
     }


     const handlelotUpdate = async (ev, data, target) => {
          const { value } = ev.target;
          const { stockid } = data;
          const getIndex = hxData.findIndex((item, index) => { return item.stockid === stockid });
          const nwdata = hxData.map((item, index) => {
               if (index == getIndex) {
                    item['batchnumber'] = value;
                    return item;
               }
               return item;
          })
          setHxData(nwdata);
     }



     const Options = (item, index) => <option value={item.id} key={index + 1}>{item.department}</option>;

     return (
          <>
               <InventoryLayout>
                    <div className="container mt-1">
                         <div className="row">
                              <div
                                   style={{ display: "grid", gridTemplateColumns: "auto auto 40%" }}>
                                   <select className="form-control" onChange={(e) => setDepartmentId(e.target.value)}>
                                        <option value="">Select Department</option>
                                        {department.map((item, index) => Options(item, index))}
                                   </select>
                                   <button className="btn btn-primary btn-sm mx-2">transfered</button>
                                   <button className="btn btn-primary btn-sm mx-2">issues raised</button>
                              </div>
                         </div>
                         <div className="row">
                              <TableDisplay column={columns} data={hxData.length === 0 ? [] : hxData} />
                         </div>
                    </div>
               </InventoryLayout>
          </>
     );
}
