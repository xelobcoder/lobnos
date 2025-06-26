import { Container, Row, Col, Card, Table, Badge, ProgressBar } from "react-bootstrap"

export default function Dashboard() {
  const stats = [
    { title: "Total Employees", value: "156", change: "+5", color: "primary" },
    { title: "Active Recruitments", value: "8", change: "+2", color: "success" },
    { title: "Pending Leaves", value: "12", change: "-3", color: "warning" },
    { title: "Expiring Certifications", value: "4", change: "0", color: "danger" },
  ]

  const recentActivities = [
    { action: "New employee onboarded", employee: "John Smith", time: "2 hours ago", type: "success" },
    { action: "Leave approved", employee: "Sarah Johnson", time: "4 hours ago", type: "info" },
    { action: "Certification expiring", employee: "Mike Davis", time: "1 day ago", type: "warning" },
    { action: "Performance review completed", employee: "Lisa Brown", time: "2 days ago", type: "primary" },
  ]

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">HR Dashboard</h2>
          <p className="text-muted">Overview of your Lab LIMS HR system</p>
        </Col>
      </Row>

      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col md={3} key={index} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                    <small className={`text-${stat.color}`}>{stat.change} this month</small>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                    <i className={`bi bi-people text-${stat.color}`}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Employee</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.action}</td>
                      <td>{activity.employee}</td>
                      <td>{activity.time}</td>
                      <td>
                        <Badge bg={activity.type}>{activity.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Department Distribution</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Quality Control</small>
                  <small>45%</small>
                </div>
                <ProgressBar variant="primary" now={45} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Lab Technicians</small>
                  <small>30%</small>
                </div>
                <ProgressBar variant="success" now={30} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Administration</small>
                  <small>15%</small>
                </div>
                <ProgressBar variant="info" now={15} />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <small>Support</small>
                  <small>10%</small>
                </div>
                <ProgressBar variant="warning" now={10} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
