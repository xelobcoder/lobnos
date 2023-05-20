import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ClientContextConsumer } from './cxtProvider';

export default function UpdatePersonal({ handleview }) {
  return (
    <>
      <ClientContextConsumer>
        {
          clientDetails => {
            return (
              <>
                <div>
                  {clientDetails.length > 0 && (
                    <div className="billing-personal-info">
                      <div className="billing-personal-info-header">
                        <div className="split">
                          <h4 className="text-white bg-success">personal information</h4>
                          <Button
                            variant="contained"
                            color={
                              clientDetails[0]["ACTIVATION_STATUS"] == "TRUE"
                                ? "success"
                                : "error"
                            }
                          >
                            {clientDetails[0]["ACTIVATION_STATUS"] == "TRUE"
                              ? "Activated"
                              : "deactivated"
                            }
                          </Button>
                        </div>
                        <main>
                          <div
                            className="billing-side"
                            style={{ display: "grid", gridTemplateColumns: "30% auto" }}
                          >
                            <div>
                              <PersonIcon />
                              <h6 className="text-capitalize lims-text-color">
                                {clientDetails[0]["FIRSTNAME"]} {clientDetails[0]["MIDDLENAME"]} {clientDetails[0]["LASTNAME"]}
                              </h6>
                              <h6>{clientDetails[0]["PATIENTID"]}</h6>
                            </div>
                            <div>
                              <div className="reference-information">
                                <div>
                                  <p>DOB</p>
                                  <p>{clientDetails[0]["DOB"].slice(0, 10)}</p>
                                </div>
                                <div>
                                  <p>Gender</p>
                                  <p>{clientDetails[0]["GENDER"]}</p>
                                </div>
                                {/* age */}
                                <div>
                                  <p>Age</p>
                                  <p>
                                    {clientDetails[0]["AGE"]} {clientDetails[0]["AGETYPE"]}
                                  </p>
                                </div>
                                {/* phone */}
                                <div>
                                  <p>Phone</p>
                                  <p>{clientDetails[0]["MOBILE_NUMBER"]}</p>
                                </div>
                                {/* email */}
                                <div>
                                  <p>Email</p>
                                  <p>{clientDetails[0]["EMAIL"]}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="billing-other-side">
                            <Button startIcon={<AddIcon />} sx={{ marginLeft: '20px' }} onClick={() => handleview()}>update test</Button>
                          </div>
                        </main>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )
          }
        }
      </ClientContextConsumer>
    </>
  );
}
