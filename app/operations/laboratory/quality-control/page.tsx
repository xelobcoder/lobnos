"use client"
import React, { useState } from 'react'
import { Tabs, Tab, Container, Row, Col } from 'react-bootstrap'
import { DeviceManager } from '../../../../components/laboratory/QualityControl/DeviceManager';
import { QCRecordingManager } from '../../../../components/laboratory/QualityControl/QCRecording/QCRecordingManager';
import { QCDashboard } from '../../../../components/laboratory/QualityControl/Dashboard/QCDashboard';
import { QCSetup } from '../../../../components/laboratory/QualityControl/Setup/QCSetup';
import { ControlMaterialManager } from '../../../../components/laboratory/QualityControl/ControlMaterialManager';

export default function QualityControlPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <Container fluid>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboard')} className="mb-4"
      >
        <Tab eventKey="dashboard" title="Dashboard">
          <QCDashboard />
        </Tab>
        
        <Tab eventKey="devices" title="Devices">
          <DeviceManager />
        </Tab>
        
        <Tab eventKey="controls" title="Control Materials">
        <ControlMaterialManager />
        </Tab>
        
        <Tab eventKey="record" title="Record QC">
          <QCRecordingManager />
        </Tab>
        
        <Tab eventKey="setup" title="QC Setup">
          <QCSetup />
        </Tab>
      </Tabs>
    </Container>
  )
}