"use client"
import { useEffect, useState } from 'react'
import { customFetch } from '../../../../../../components/Auth/customFetch';
import { useParams } from 'next/navigation';
import { Button, Table, Modal } from 'react-bootstrap';
import BillingPagePatientInformation from '../../../../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { RiFileList2Line, RiEyeLine, RiAlertLine } from "@remixicon/react";
import styles from '../../../../../../styles/SmsTemplateList.module.css'

export default function CRASCENSIONVIEW() {
  const [criticalValue, setCriticalValue] = useState<CriticalAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedConstraints, setSelectedConstraints] = useState<Constraint[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.identity) {
        setError('No identity parameter provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await customFetch(`result/criticalvalues/logging/${params.identity}`);
        setCriticalValue(data);
      } catch (err) {
        setError('Failed to fetch critical value data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.identity]);

  if (isLoading) {
    return (
      <div >
        <div>Loading critical value data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        color: '#d32f2f'
      }}>
        {error}
      </div>
    );
  }

  if (!criticalValue) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        No critical value found
      </div>
    );
  }

  const handleShowConstraints = (recordValue: any) => {
    setSelectedConstraints(recordValue.constraints || []);
    setSelectedField(recordValue.name);
    setShowModal(true);
  };

  const handleClearConstraints = () => {
    setSelectedConstraints([]);
    setSelectedField("");
    setShowModal(false);
  };

  return (
    <div className=" px-0">
      <div className="bg-secondary-subtle rounded-3 shadow-sm p-3 mb-4">
        <BillingPagePatientInformation data={criticalValue} />
      </div>
      <div className="d-flex">
        <div className='col-md-5' >
          <div className="bg-white rounded-3 shadow-sm p-3 mb-4">
            <h4 className="pls-label mb-3 d-flex align-items-center">
              <RiFileList2Line size={22} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 6 }} />
              {criticalValue.testname}
            </h4>
            <table  className={styles.table} >
              <thead className="bg-light">
                <tr>
                  <th>Field</th>
                  <th>Original Value</th>
                  <th>Current Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(criticalValue.recordValues) && criticalValue.recordValues.length > 0 && (
                  criticalValue.recordValues.map((item, index) => (
                    <tr key={index}  className='text-sm'>
                      <td>{item.field}</td>
                      <td>{item.originalvalue}</td>
                      <td>{item.value}</td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleShowConstraints(item)}
                          className="d-flex align-items-center gap-1 br-5"
                        >
                          <RiEyeLine size={16} style={{ marginRight: 2 }} />
                          View 
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='mx-3 col-md-7' >
          <div className="card shadow-sm rounded-3">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <span className="pls-label">
                <RiAlertLine size={20} style={{ verticalAlign: "middle", color: "#d32f2f", marginRight: 6 }} />
                Constraints {selectedField ? `for ${selectedField}` : ""}
              </span>
              {selectedField && (
                <Button variant="outline-secondary" size="sm" onClick={handleClearConstraints} className="br-5">
                  Clear
                </Button>
              )}
            </div>
            <div className="card-body" style={{ minHeight: 200 }}>
              {selectedConstraints.length === 0 ? (
                <div className="text-muted text-center py-3">No constraints selected.</div>
              ) : (
                <table  className={styles.table}>
                  <thead className="bg-light">
                    <tr>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Action</th>
                      <th>Replacement Text</th>
                      <th>Prefix</th>
                      <th>Suffix</th>
                      <th>Statement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedConstraints.map((constraint, idx) => (
                      <tr key={idx} className="text-sm">
                        <td>
                          {constraint.constraint_type === "greater" && (
                            <span title="Greater than">&gt; Greater</span>
                          )}
                          {constraint.constraint_type === "less" && (
                            <span title="Less than">&lt; Less</span>
                          )}
                          {constraint.constraint_type === "equal" && (
                            <span title="Equal">= Equal</span>
                          )}
                          {constraint.constraint_type !== "greater" && constraint.constraint_type !== "less" && constraint.constraint_type !== "equal" && (
                            <span>{constraint.constraint_type}</span>
                          )}
                        </td>
                        <td className="fw-bold">{constraint.value}</td>
                        <td>{constraint.action}</td>
                        <td>{constraint.replacement_text}</td>
                        <td>{constraint.prefix}</td>
                        <td>{constraint.suffix}</td>
                        <td>
                          <div className="alert alert-warning mb-0 py-2 px-3 text-wrap" style={{ fontSize: "0.95em" }}>
                            {constraint.statement}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      </div>
  )
}
