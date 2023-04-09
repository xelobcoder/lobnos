// code for getting all request made by the departments and display them in a table and add input for the quantity to be supplied and a button to approve the request
import { Button } from "@mui/material";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import TableDisplay from "../../components/accessories/TableDisplay";
import InventoryIcon from "@mui/icons-material/Inventory";
import { customFetch } from "../../components/Auth/customFetch";
export default function Stocksrequest({ departments }) {
  const [request, setRequest] = useState([]);
  const [hxData, setHxData] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [department, setDepartments] = useState(departments || []);
  useMemo(() => {
    async function fetchRequisitions() {
      if (departmentId) {
        try {
          const data = await customFetch(`departments/requisitions?id=${departmentId}&&type=pending`);
          if (data?.status === "success" && data?.statusCode === 200) {
            setHxData(data?.data);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    fetchRequisitions();
  }, [departmentId]);

  // handle the supply button
  const handleSupply = (e, id) => {
    // check if the quantity approved is not empty by filtering the hxdata using the id
    const filtered = hxData.filter((item) => item.id === id);
    // quantity parsed to integer
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

    // check if the quantity approved is less than the quantity requested
    if (approved >= 0 && approved <= quantity) {
      // update the quantity approved
      // send the data to the backend
      try {
        const patch_requisition = async () => {
          const response = await fetch(
            `${process.env.BASEURL}/departments/requisitions?id=${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Baerer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
              },
              body: JSON.stringify({
                quantity_approved: approved,
                store_supplied: approved === 0 ? 0 : 1,
              }),
            }
          );
          const data = await response.json();
          if (data?.status === "success" && data?.statusCode === 200) {
            alert("Request approved successfully");
            // update the table
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
    // filter hxdata using the id
    const filtered = hxData.filter((item) => item.id === id);
    // check if the value is greater than the quantity requested
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
          >
            Supply
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="container pt-3">
        <div className="row">
          <div
            style={{ display: "grid", gridTemplateColumns: "auto auto 40%" }}
          >
            <select
              className="custom-input"
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {department.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.department}
                </option>
              ))}
            </select>
            <button className="custom-button">transfered</button>
            <button className="custom-button">issues raised</button>
          </div>
        </div>
        <div className="row">
          <TableDisplay
            column={columns}
            data={hxData.length === 0 ? [] : hxData}
          />
        </div>
      </div>
    </>
  );
}

// get depaertments using server side props
export async function getServerSideProps(context) {
  try {
    const data = await customFetch("departments");
    const { result, status } = data;
    if (status === "success") {
      return {
        props: {
          departments: data?.data,
        },
      };
    }

    if (data?.err) {
      return {
        props: {
          departments: []
        }
      }
    }
  } catch (error) {
    return {
      props: {
        departments: [],
      },
    };
  }
}
