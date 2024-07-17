import { useCallback, useEffect, useState } from "react";
import UsePaginationTableDisplay from "../../../components/accessories/usePaginationTableDisplay";
import {
  customFetch,
  formatTest,
  handleChangeWithState,
  PrepareResultEntryHeader,
  printResultNavigator,
} from "../../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { Clear, Close, MoreVert, Search } from "@mui/icons-material";
import { ButtonGroup, Row } from "react-bootstrap";
import Select from "react-select";

export default function ResultEntryDepartmentViewTwo() {
  const defaultFilters = { departmentid: "", status: "pending", testid: "", from: "", to: "", fullname: "" };
    const urlQuery = useSearchParams();
    const status = urlQuery.get("status");
    const dept = urlQuery.get("department");
    const [department, setDepartment] = useState([]);
    const [filter, setFilter] = useState(defaultFilters);
    const [endpoint, setEndpoint] = useState(`operation/pendingcases/all?status=pending`);
    const [alltest, setAlltest] = useState([]);
    const [pendingdata, setPending] = useState([]);
    const [isupdate, setUpdate] = useState(false);
    const [showexporters, setExporter] = useState(false);

    const getAllTest = async function () {
      if (alltest.length === 0) {
        try {
          const data = await customFetch("testpanel/list/bulk");
          if (data?.data) {
            const departmentsData = data.data.map((item, index) => ({ label: item.name, value: item.id }));
            setAlltest(departmentsData);
          }
        } catch (err) {
          console.error("Error fetching tests:", err);
          setAlltest([]);
        }
      }
    };

    useEffect(() => {
      customFetch("departments").then((data) => {
        setDepartment(data?.data.map((item) => ({ label: item.department.toLowerCase(), value: item.id })));
      });

      if (status || dept) {
        setEndpoint((prev) => {
          return `operation/pendingcases/all?status=${status}&&department=${dept}`;
        });
      }
    }, [status, dept]);

    const openSingleResult = (ev, row) => {
      const { billingid, name, id } = row;
      printResultNavigator(null, billingid, { ...row, testid: id, testname: name }, true);
    };

    const openMultipleResult = (ev, row) => {
      const { billingid, name, id, patientid } = row;
      window.open(
        `/registration/result/labReportMultiple?billingid=${billingid}&&testid=${id}&&test=${formatTest(name)}&&patientid=${patientid}`
      );
    };

    const columns = [
      {
        Header: "Client name",
        accessor: "fullname",
      },
      { Header: "billing id", accessor: "billingid" },
      {
        Header: "patientid",
        accessor: "patientid",
      },
      {
        Header: "age",
        accessor: "age",
      },
      {
        Header: "test",
        accessor: "name",
        Cell: ({ row, value }) => {
          return (
            <div>
              <span className={row.original.ready === "false" ? "text-danger" : ""}>{value}</span>
              <br />
              <span className={`border-bottom border-2 border-dark ${row.original.ready === "false" ? "text-danger" : ""}`}>
                {row.original.department}
              </span>
            </div>
          );
        },
      },
      {
        Header: "clinician",
        accessor: "clinician",
        Cell: function ({ value, row }) {
          const { clinicianName } = row.original;
          return (
            <div>
              <span>{value === 0 ? "Self" : clinicianName}</span>
            </div>
          );
        },
      },
      {
        Header: "organization",
        accessor: "organization",
        Cell: function ({ value, row }) {
          const { organization } = row.original;
          return (
            <div>
              <span>{organization === 0 ? "Direct" : organization}</span>
            </div>
          );
        },
      },
      {
        Header: "actions",
        accessor: "actions",
        Cell: function ({ row }) {
          const { billingid, patientid } = row.original;
          return (
            <Dropdown>
              <Dropdown.Toggle size="sm" variant="outline-primary" id="archives-dropdown">
                <MoreVert />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  className="text-primary"
                  onClick={(ev) => {
                    PrepareResultEntryHeader(row.original);
                  }}>
                  Result Entry
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(ev) => {
                    openSingleResult(ev, row.original);
                  }}
                  className="text-primary">
                  Print Single
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(ev) => {
                    openMultipleResult(ev, row.original);
                  }}
                  className="text-primary">
                  Print Bulk
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          );
        },
      },
    ];

    const getdata = useCallback(async (value) => {
      setPending(value);
    }, []);

    const handleFilter = async () => {
      let url = `operation/pendingcases/all?`;
      function appendFilter(target) {
        target && (url += `${target}=${filter[target]}&&`);
      }
      Object.entries(filter).forEach((item) => {
        const [key, value] = item;
        if (value.toString().trim().length !== 0) {
          appendFilter(key);
        }
      });
      setEndpoint(url);
    };

    const clearFilters = () => {
      setFilter({ ...defaultFilters });
      setEndpoint(`operation/pendingcases/all`);
    };

    const loadTestOptions = async () => {
      await getAllTest();
    };

    const advancedFiltering = (display) => {
      if (display) {
        return (
          <Row className="mx-2">
            <section className="card-body mx-2" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)" }}>
              <div>
                <Select
                  placeholder="select department"
                  options={department}
                  isClearable={true}
                  onChange={(selectedOption) =>
                    handleChangeWithState(
                      { target: { value: selectedOption ? selectedOption.value : "" } },
                      "departmentid",
                      setFilter,
                      filter
                    )
                  }
                />
              </div>
              <div className="mx-1">
                <input
                  className="custom-input"
                  onChange={(ev) => handleChangeWithState(ev, "fullname", setFilter, filter)}
                  type="text"
                  placeholder="Please type patient fullname or firstname or lastname here"
                />
              </div>
              <div>
                <Select
                  placeholder="Select a test"
                  options={alltest}
                  isClearable={true}
                  onMenuOpen={loadTestOptions}
                  onChange={(selectedOption) =>
                    handleChangeWithState({ target: { value: selectedOption ? selectedOption.value : "" } }, "testid", setFilter, filter)
                  }
                />
              </div>
              <div className="mx-2">
                <input
                  onChange={(ev) => handleChangeWithState(ev, "from", setFilter, filter)}
                  value={filter.from}
                  type="date"
                  className="custom-input br-0"
                />
              </div>
              <div className="mx-1">
                <input
                  onChange={(ev) => handleChangeWithState(ev, "to", setFilter, filter)}
                  value={filter.to}
                  type="date"
                  className="custom-input br-0"
                />
              </div>
              <div>
                <div className="d-flex">
                  <ButtonGroup size="sm">
                    <Button onClick={handleFilter} variant="primary">
                      <Search /> filter
                    </Button>
                    <Button onClick={clearFilters} variant="danger">
                      <Clear /> clear
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </section>
          </Row>
        );
      }
    };

  
  const isExporter = !showexporters
  ? { position: 'relative', bottom: '-60px', right: '20px', zIndex: 100 } : { position: 'relative', bottom: '0px', right: '0px', zIndex: 0 }
    return (
      <LaboratoryLayout>
        {advancedFiltering(true)}
        {/* end of advanced filter */}
        <section className="mx-2">
          <div className="d-flex justify-content-between">
            <h4>Result Entry Records</h4>
            <Button
              style={isExporter}
              variant="secondary"
              onClick={(ev) => {
                setExporter(!showexporters);
              }}>
              show exports
            </Button>
          </div>
          <UsePaginationTableDisplay
            exporters={showexporters}
            column={columns}
            endpoint={endpoint}
            update={isupdate}
            updatedata={pendingdata}
            getdata={getdata}
          />
        </section>
      </LaboratoryLayout>
    );
}
