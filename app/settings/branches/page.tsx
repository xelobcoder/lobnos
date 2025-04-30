"use client";
import { useState, useEffect } from "react";
import { getBranches, customPost } from "../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import Loader from "../../../components/accessories/Loader";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { Form, Button } from "react-bootstrap";
import {
  RiEditLine,
  RiDeleteBin6Line,
  RiMapPinLine,
  RiPhoneLine,
  RiCalendarLine,
} from "@remixicon/react";
import styles from "./Branches.module.css";
import AddBranchComponent from "../../../components/settingsComponents/AddBranchComponent";

export interface BranchType {
  branchid: number;
  name: string;
  address: string;
  contact: string;
  activation: number;
  date: string;
}



export default function Branches() {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [isedit, setEdit] = useState<{ 
    isediting: boolean; 
    data: BranchType | null 
  }>({ isediting: false, data: null });
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try  {
      getBranches(setBranches, null, setLoading);
    } catch (err) {
      toast.error("Failed to fetch branches"); 
    }
  }, []);

  const deleteData = async (e: React.MouseEvent, index: number) => {
    const confirmation = confirm(
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

  const activateDeactivateBranch = async (
    e: boolean,
    action: number,
    id: number
  ) => {
    const value = e ? 1 : 0;
    const body = { status: value === 1 ? "activate" : "deactivate", id };

    try {
      const response = await customPost(`branches/activation`, "PUT", body);
      const { status, statusCode, message } = response;

      if (statusCode === 200 && status === "success") {
        setBranches((prev: BranchType[]) =>
            prev.map((branch: BranchType) =>
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

  const onSave = (
    data: BranchType | null,
    message: string,
    status: string,
    isEdit: boolean
  ) => {
    if (!data && status === "error" && !isEdit) {
      toast.error(message, { autoClose: 1000, position: "top-center" });
    } else if (data && status === "success" && isEdit) {
      const updateData = { 
        ...data, 
        branchid: isedit.data!.branchid 
      };
      setBranches((prev) =>
        prev.map((branch) =>
          branch.branchid === updateData.branchid ? updateData : branch
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
      Cell: ({ row, value }: { row: any; value: string }) => (
        <div className="d-flex align-items-center">
          <div className={styles.branchIcon}>
            <RiMapPinLine className="text-primary" size={24} />
          </div>
          <div>
            <h6 className="mb-1">{value}</h6>
            <div className={styles.dateContainer}>
              <RiCalendarLine className="me-1" />
              <span>
                Created:{" "}
                {new Date(row.original?.date).toLocaleDateString() ||
                  new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: "Contact Info",
      accessor: "contact",
      Cell: ({ row }: { row: any }) => (
        <div>
          <div className="d-flex align-items-center mb-2">
            <RiMapPinLine className={`me-2 ${styles.contactIcon}`} />
            <span>{row.original.address}</span>
          </div>
          <div className="d-flex align-items-center">
            <RiPhoneLine className={`me-2 ${styles.contactIcon}`} />
            <span>{row.original.contact}</span>
          </div>
        </div>
      ),
    },
    {
      Header: "Status",
      accessor: "activation",
      Cell: ({ row }: { row: any }) => {
        const item = row.original;
        return (
          <div className="d-flex align-items-center">
            <div
              className={`${styles.statusIndicator} ${
                item.activation === 1 ? styles.active : styles.inactive
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
      Cell: ({ row }: { row: any }) => {
        const item = row.original;
        return (
          <div className={styles.actionsContainer}>
            <Form.Check
              className="me-2"
              checked={item.activation === 1}
              type="switch"
              onChange={(e) =>
                activateDeactivateBranch(e.target.checked, item.activation, item.branchid)
              }
            />
            <Button
              variant="outline-primary"
              size="sm"
              className={styles.actionButton}
              onClick={() => setEdit({ isediting: true, data: row.original })}
            >
              <RiEditLine className="me-1" /> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className={styles.actionButton}
              onClick={(e) => deleteData(e, item.branchid)}
            >
              <RiDeleteBin6Line className="me-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Branch Management</h4>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            setEdit({ isediting: false, data: null });
            resetform();
          }}
          className={styles.newBranchButton}
        >
          <RiMapPinLine /> New Branch
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h5 className={styles.sidePanelTitle}>
                {isedit.isediting
                  ? `Edit Branch: ${isedit.data?.name || ""}`
                  : "Add New Branch"}
              </h5>
            </div>
            <AddBranchComponent
              resetform={resetform}
              update={onSave}
              isEdit={isedit.isediting}
              editdata={isedit.data || undefined}
            />
          </div>
        </div>

        <div className="col-lg-8">
          <div className={styles.mainPanel}>
            <div className={styles.tableHeader}>
              <h5 className={styles.tableTitle}>Branch Locations</h5>
              <div className={styles.branchCount}>
                <span className={styles.badge}>{branches.length}</span>
                <span className={styles.countText}>Total Branches</span>
              </div>
            </div>
            
            <div className={styles.tableContainer}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  <Loader />
                  <p className={styles.loadingText}>Loading branch data...</p>
                </div>
              ) : branches.length === 0 ? (
                <div className={styles.emptyState}>
                  <RiMapPinLine size={48} className={styles.emptyIcon} />
                  <h5>No Branches Found</h5>
                  <p className={styles.emptyText}>Add your first branch to get started</p>
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
  );
}

