import { useState, useEffect } from "react";
import { getBranches, customPost } from "../../../components/Auth/customFetch";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import AddBranchComponent from "../../../components/settingsComponents/AddBranchComponent";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../../components/accessories/Loader";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { Form, Card, Button } from "react-bootstrap";
import {
  RiEditLine,
  RiDeleteBin6Line,
  RiMapPinLine,
  RiPhoneLine,
  RiCalendarLine,
} from "@remixicon/react";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [isedit, setEdit] = useState({ isediting: false, data: null });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getBranches(setBranches, null, setLoading);
  }, []);

  const deleteData = async function (e, index) {
    let confirmation = confirm(
      "Do you want to delete branch? Note this will have consequence on your data integrity hence accounting section. It is much better to deactivate"
    );
    if (confirmation) {
      setLoading(true);
      const branch = branches.find((item) => item.branchid === index);
      if (!branch) return;

      try {
        const response = await customPost("branches", "DELETE", {
          branchid: branch.branchid,
        });
        const { status, message } = response;
        if (status === "success") {
          toast.success(message, { autoClose: 500, position: "top-center" });
          setBranches((prev) => prev.filter((item) => item.branchid !== index));
        } else {
          toast.error(message, { autoClose: 1000, position: "top-center" });
        }
      } catch (err) {
        toast.error("Failed to delete branch");
      }
      setLoading(false);
    }
  };

  const activateDeactivateBranch = async function (e, action, id) {
    const value = e === true ? 1 : 0;
    const body = { status: value === 1 ? "activate" : "deactivate", id };

    try {
      const response = await customPost(`branches/activation`, "PUT", body);
      const { status, statusCode, message } = response;

      if (statusCode === 200 && status === "success") {
        setBranches((prev) =>
          prev.map((branch) =>
            branch.branchid === id ? { ...branch, activation: value } : branch
          )
        );
        toast.success(message);
      } else {
        toast.error(message, { autoClose: 1000, position: "top-center" });
      }
    } catch (error) {
      toast.error("Failed to update branch status");
    }
  };

  const onSave = (data, message, status, isEdit) => {
    if (!data && status === "error" && !isEdit) {
      toast.error(message, { autoClose: 1000, position: "top-center" });
    } else if (data && status === "success" && isEdit) {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.branchid === data.branchid ? data : branch
        )
      );
      toast.success(message, { autoClose: 500, position: "top-center" });
    } else if (data && !isEdit && status === "success") {
      setBranches((prev) => [...prev, data]);
      toast.success(message, { autoClose: 500, position: "top-center" });
    } else {
      toast.success(message, { autoClose: 500, position: "top-center" });
    }
  };

  const resetform = () => setEdit({ isediting: false, data: null });

  const columns = [
    {
      Header: "Branch Details",
      accessor: "name",
      Cell: ({ row, value }) => {
        const date =
          new Date(row.original?.date).toLocaleDateString() ||
          new Date().toLocaleDateString();
        return (
          <div className="d-flex align-items-center">
            <div className="branch-icon bg-light rounded-circle p-3 me-3">
              <RiMapPinLine className="text-primary" size={24} />
            </div>
            <div>
              <h6 className="mb-1">{value}</h6>
              <div className="d-flex align-items-center text-muted small">
                <RiCalendarLine className="me-1" />
                <span>Created: {date}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Contact Info",
      accessor: "contact",
      Cell: ({ row }) => (
        <div>
          <div className="d-flex align-items-center mb-2">
            <RiMapPinLine className="me-2 text-muted" />
            <span>{row.original.address}</span>
          </div>
          <div className="d-flex align-items-center">
            <RiPhoneLine className="me-2 text-muted" />
            <span>{row.original.contact}</span>
          </div>
        </div>
      ),
    },
    {
      Header: "Status",
      accessor: "activation",
      Cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="d-flex align-items-center">
            <div
              className={`status-indicator ${
                item.activation === 1 ? "bg-success" : "bg-danger"
              }`}
            />
            <span
              className={`ms-2 ${
                item.activation === 1 ? "text-success" : "text-danger"
              }`}
            >
              {item.activation === 1 ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    {
      Header: "Actions",
      accessor: "",
      Cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="d-flex align-items-center gap-2">
            <Form.Check
              className="me-2"
              checked={item.activation === 1}
              type="switch"
              onChange={(e) =>
                activateDeactivateBranch(
                  e.target.checked,
                  item.activation,
                  item.branchid
                )
              }
            />
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center"
              onClick={() => setEdit({ isediting: true, data: row.original })}
            >
              <RiEditLine className="me-1" /> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="d-flex align-items-center"
              onClick={(e) => deleteData(e, item.branchid)}
            >
              <RiDeleteBin6Line className="me-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const handleNewBranchClick = () => {
    setEdit({ isediting: false, data: null });
    resetform();
  };

  return (
    <MainSettingsLayoutView>
      <ToastContainer />
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 bg-secondary-subtle br-5 pls-label p-2">Branch Management</h4>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleNewBranchClick}
            className="d-flex align-items-center gap-2"
          >
            <RiMapPinLine /> New Branch
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="bg-white rounded-3 p-4 h-100 position-relative">
              <div className="border-end position-absolute top-0 bottom-0 end-0" style={{ width: '1px', backgroundColor: '#dee2e6' }}></div>
              <div className="border-bottom pb-3 mb-4">
                <h5 className="mb-0 fw-semibold">
                  {isedit.isediting
                    ? `Edit Branch: ${isedit.data?.name}`
                    : "Add New Branch"}
                </h5>
              </div>
              <AddBranchComponent
                resetform={resetform}
                update={onSave}
                isEdit={isedit.isediting}
                editdata={isedit.data}
              />
            </div>
          </div>

          <div className="col-lg-8">
            <div className="bg-white rounded-3 h-100">
              <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">Branch Locations</h5>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">{branches.length}</span>
                  <span className="text-muted small">Total Branches</span>
                </div>
              </div>
              
              <div className="table-responsive">
                {isLoading ? (
                  <div className="p-5 text-center">
                    <Loader />
                    <p className="text-muted mt-3">Loading branch data...</p>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="p-5 text-center">
                    <RiMapPinLine size={48} className="text-muted mb-3" />
                    <h5>No Branches Found</h5>
                    <p className="text-muted">Add your first branch to get started</p>
                  </div>
                ) : (
                  <PrimeTable
                    column={columns}
                    data={branches}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
                    filtering={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .branch-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(13, 110, 253, 0.1);
        }
        :global(.table) {
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 0;
        }
        :global(.table th) {
          font-weight: 600;
          background-color: #f8f9fa;
          white-space: nowrap;
        }
        :global(.table td) {
          vertical-align: middle;
        }
        :global(.table-responsive) {
          min-height: 400px;
        }
      `}</style>
    </MainSettingsLayoutView>
  );
}
