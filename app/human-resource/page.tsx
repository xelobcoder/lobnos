"use client"

import { useState } from "react"
import { Container, Row, Col, Nav } from "react-bootstrap"
import AttendanceLeave from "../../components/HR/AttendanceLeave"
import Benefits from "../../components/HR/Benefits"
import Compliance from "../../components/HR/Compliance"
import Disciplinary from "../../components/HR/Disciplinary"
import EmployeeManagement from "../../components/HR/EmployeeManagement"
import Engagement from "../../components/HR/Engagement"
import Payroll from "../../components/HR/Payroll"
import Recruitment from "../../components/HR/Recruitment"
import Reports from "../../components/HR/Reports"
import SelfService from "../../components/HR/SelfService"
import ShiftManagement from "../../components/HR/ShiftManagement"
import Dashboard from "../../components/HR/Dashboard"
import Performance from "../../components/HR/Performance"
export default function HRLIMSSystem() {
    const [activeModule, setActiveModule] = useState("dashboard")

    const modules = [
        { id: "dashboard", name: "Dashboard", icon: "📊" },
        { id: "employees", name: "Employee Management", icon: "👥" },
        { id: "attendance", name: "Attendance & Leave", icon: "📅" },
        { id: "selfservice", name: "Self Service", icon: "🔧" },
        { id: "payroll", name: "Payroll", icon: "💰" },
        { id: "performance", name: "Performance", icon: "📈" },
        { id: "recruitment", name: "Recruitment", icon: "🎯" },
        { id: "shifts", name: "Shift Management", icon: "🕐" },
        { id: "compliance", name: "Compliance", icon: "📋" },
        { id: "benefits", name: "Benefits", icon: "🎁" },
        { id: "disciplinary", name: "Disciplinary", icon: "⚖️" },
        { id: "engagement", name: "Engagement", icon: "💡" },
        { id: "reports", name: "Reports", icon: "📊" },
    ]

    const renderActiveModule = () => {
        switch (activeModule) {
            case "dashboard":
                return <Dashboard />
            case "employees":
                return <EmployeeManagement />
            case "attendance":
                return <AttendanceLeave />
            case "selfservice":
                return <SelfService />
            case "payroll":
                return <Payroll />
            case "performance":
                return <Performance />
            case "recruitment":
                return <Recruitment />
            case "shifts":
                return <ShiftManagement />
            case "compliance":
                return <Compliance />
            case "benefits":
                return <Benefits />
            case "disciplinary":
                return <Disciplinary />
            case "engagement":
                return <Engagement />
            case "reports":
                return <Reports />
            default:
                return <Dashboard />
        }
    }

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={3} lg={2} className="sidebar">
                    <div className="p-4">
                        <h4 className="text-white mb-4">
                            <span className="me-2">🏢</span>
                            HR LIMS
                        </h4>
                        <Nav className="flex-column">
                            {modules.map((module) => (
                                <Nav.Link
                                    key={module.id}
                                    className={`d-flex align-items-center py-3 px-3 ${activeModule === module.id ? "active" : ""}`}
                                    onClick={() => setActiveModule(module.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="me-3">{module.icon}</span>
                                    <span className="d-none d-lg-inline">{module.name}</span>
                                </Nav.Link>
                            ))}
                        </Nav>
                    </div>
                </Col>
                <Col md={9} lg={10}>
                    <div className="main-content">{renderActiveModule()}</div>
                </Col>
            </Row>
        </Container>
    )
}
