import React, { useEffect, useState } from "react";
import { TestPanelProvider } from "../../../components/testpanel/contextTest";
import TestPanelLayout from "../../../components/testpanel/TestPanelLayout";
import { customFetch } from "../../../components/Auth/customFetch";
import { Button } from "@mui/material";
import Loader from "../../../components/accessories/Loader";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";

export default function CATEGORIES() {
  const [data, setData] = useState([]);
  const [isloading, setLoading] = useState(true);

  useEffect(() => {
    async function getadata() {
      try {
        const categories = await customFetch("testpanel/categories");
        const response = Array.isArray(categories) && categories.length > 0 ? categories : [];
        setData(response);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    getadata();
  }, []);

  const rendering = () => {
    if (isloading) return <Loader />;
    else {
      if (data.length === 0) {
        return <h3>No Data found</h3>;
      } else {
        return (
          <div className="list-group" id="categories-list-wrapper">
            {data.map((item, index) => {
              return (
                <div key={index} className="list-group-item group-grid">
                  <h6>{item.ID}</h6>
                  <h6>{item.CATEGORY}</h6>
                  <h6>{item.DESCRIPTION}</h6>
                  <div>
                    <Button>edit</Button>
                    <Button color="error">Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    }
  };

  return (
    <div>
      <TestPanelProvider>
        <MainSettingsLayoutView>
          {rendering()}
   </MainSettingsLayoutView>
      </TestPanelProvider>
    </div>
  );
}
