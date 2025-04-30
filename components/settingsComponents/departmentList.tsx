import { useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { RiEditLine, RiDeleteBinLine, RiBuildingLine, RiUserLine } from '@remixicon/react';


interface DepartmentItem {
  id: number;
  department: string;
  departmentManager: string;
  date?: string;
  employeeid?: number;
}

interface DepartmentListProps {
  data: DepartmentItem[];
  handleDelete: (id: number) => Promise<boolean>;
  handleEdit: (department: DepartmentItem) => void;
}

export default function DepartmentList({ data, handleDelete, handleEdit }: DepartmentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteWithFeedback = (id: number) => {
    setDeletingId(id);
    try {
      handleDelete(id)
        .catch(error => {
          console.error('Error during department deletion:', error);
        })
        .finally(() => {
          setDeletingId(null);
        });
    } catch (error) {
      console.error('Unexpected error initiating delete operation:', error);
      setDeletingId(null); 
    }
  };

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {data?.map((dept) => (
        <Col key={dept.id}>
          <Card className="h-100 shadow-sm border-0 rounded-3 overflow-hidden">
            <Card.Body className="d-flex flex-column p-0">
              <div className="bg-light p-3 border-bottom">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                    <RiBuildingLine size={24} className="text-primary" />
                  </div>
                  <h5 className="mb-0 fw-semibold text-truncate">{dept.department}</h5>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                    <RiUserLine size={20} className="text-info" />
                  </div>
                  <div>
                    <div className="text-muted small">Department Manager</div>
                    <div className="fw-medium">{dept.departmentManager || 'Not Assigned'}</div>
                  </div>
                </div>
              </div>
              
              {/* Card Footer with Actions */}
              <div className="mt-auto border-top p-3 bg-light bg-opacity-50">
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={() => handleEdit(dept)}
                  >
                    <RiEditLine size={16} className="me-1" /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={() => handleDeleteWithFeedback(dept.id)}
                    disabled={deletingId === dept.id}
                  >
                    {deletingId === dept.id ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <RiDeleteBinLine size={16} className="me-1" /> Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
