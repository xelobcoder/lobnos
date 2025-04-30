import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Table, Spinner } from "react-bootstrap";
import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import { fetchOurSourcingOrganization } from "../../../../../../lib/billingLib";
import {
  customFetch,
  customPost,
} from "../../../../../../components/Auth/customFetch";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";

export default function TestPanelOutSourcingListOrganizationSelection() {
  const [outsourcingOrganizations, setOutsouringOrganizations] = useState([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { testname, id: testid } = useRouter().query;

  const options = outsourcingOrganizations.map((org) => ({
    value: org.outsourceid,
    label: org.name,
    organization: org,
  }));

  useEffect(() => {
    const fetchStoredOrganizations = async () => {
      if (testid) {
        try {
          const storedOrgs = await customFetch(
            `outsourcing/organization/testpanel/outsourceinfo?testid=${testid}`
          );
          const selectedOrgs = storedOrgs.map((org) => ({
            outsourceid: org.outsourceid,
            name: org.name,
            organizationType: org.organizationType,
          }));
          setSelectedOrganizations(selectedOrgs);
        } catch (error) {
          toast.error(`Error fetching stored organizations:${error}`);
        }
      }
    };
    fetchStoredOrganizations();
    fetchOurSourcingOrganization(setOutsouringOrganizations);
  }, [testid]);

  const handleSelectChange = async (selectedOption) => {
    if (selectedOption) {
      const organization = selectedOption.organization;
      const isInSelected = selectedOrganizations.find(
        (org) => org.outsourceid === organization.outsourceid
      );
      if (!isInSelected) {
        setIsLoading(true);
        const isProvided = await checkTestSevicesIsProvidedByOrganization(
          organization.outsourceid,
          testid
        );
        setIsLoading(false);
        if (isProvided) {
          setSelectedOrganizations([...selectedOrganizations, organization]);
        } else {
          toast.info(
            `The organization "${organization.name}" does not provide the test service "${testname}".`
          );
        }
      }
    }
  };

  const handleRemoveOrganization = (orgToRemove) => {
    setSelectedOrganizations(
      selectedOrganizations.filter(
        (org) => org.outsourceid !== orgToRemove.outsourceid
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedOrganizations.length > 0) {
      const selectedOutsorcingOrg = selectedOrganizations.map(
        (item) => item.outsourceid
      );
      const pushResponse = await customPost(
        "outsourcing/organization/testpanel/outsourceinfo/update",
        "PUT",
        { organizations: selectedOutsorcingOrg, testid }
      );
      const { status } = pushResponse;
      status === true
        ? toast.success("Test outsourcing Organizations updated successfully")
        : toast.error("Update failed");
    }
  };

  const checkTestSevicesIsProvidedByOrganization = async (
    outsourceid,
    testid
  ) => {
    try {
      const { isProvideTest } = await customFetch(
        `outsourcing/organization/check/test?outsourceid=${outsourceid}&&testid=${testid}`
      );
      return isProvideTest;
    } catch (error) {
      console.error("Error checking test service:", error);
      return false;
    }
  };

  return (
    <MainSettingsLayoutView>
      <ToastContainer
        theme="colored"
        position="top-center"
        className={"text-sm"}
      />
      <h5>{testname}</h5>
      <div>
        <div className="col-4">
          <Select
            options={options}
            onChange={handleSelectChange}
            placeholder="Select outsourcing organization"
          />
        </div>

        {isLoading && (
          <div className="mt-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Checking test service...</span>
            </Spinner>
            <span className="ml-2">
              Checking if test service is provided...
            </span>
          </div>
        )}

        {selectedOrganizations.length > 0 && (
          <Table className="mt-4 billing-cart-table table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrganizations.map((org) => (
                <tr key={org.outsourceid}>
                  <td>{org.name}</td>
                  <td>{org.organizationType}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveOrganization(org)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <button className="btn btn-success mt-3" onClick={handleSubmit}>
          Update Records
        </button>
      </div>
    </MainSettingsLayoutView>
  );
}
