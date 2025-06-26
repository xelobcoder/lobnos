"use client"
import React, { useState } from 'react'
import { Tabs, Tab, Container } from 'react-bootstrap'
import dynamic from 'next/dynamic'

const DeviceManager = dynamic(
  () => import('../../../../components/laboratory/QualityControl/DeviceManager').then(mod => ({ default: mod.DeviceManager })),
  { loading: () => <div>Loading...</div> }
)

const QCDashboard = dynamic(
  () => import('../../../../components/laboratory/QualityControl/Dashboard/QCDashboard').then(mod => ({ default: mod.QCDashboard })),
  { loading: () => <div>Loading...</div> }
)

const QCSetup = dynamic(
  () => import('../../../../components/laboratory/QualityControl/Setup/QCSetup').then(mod => ({ default: mod.QCSetup })),
  { loading: () => <div>Loading...</div> }
)

const ControlMaterialManager = dynamic(
  () => import('../../../../components/laboratory/QualityControl/ControlMaterialManager').then(mod => ({ default: mod.ControlMaterialManager })),
  { loading: () => <div>Loading...</div> }
)

const QCSessionsTable = dynamic(
  () => import('../../../../components/laboratory/QualityControl/QCSessionsTable').then(mod => ({ default: mod.QCSessionsTable })),
  { loading: () => <div>Loading...</div> }
)

const QCSessionCreator = dynamic(
  () => import('../../../../components/laboratory/QualityControl/QCRecording/QCSessionCreator').then(mod => ({ default: mod.QCSessionCreator })),
  { loading: () => <div>Loading...</div> }
)

export default function QualityControlPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <Container fluid>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboard')} className="mb-4">
        <Tab eventKey="dashboard" title="Dashboard">
          {activeTab === 'dashboard' && <QCDashboard />}
        </Tab>
        
        <Tab eventKey="devices" title="Devices">
          {activeTab === 'devices' && <DeviceManager />}
        </Tab>
        
        <Tab eventKey="controls" title="Control Materials">
          {activeTab === 'controls' && <ControlMaterialManager />}
        </Tab>
        
        <Tab eventKey="setup" title="QC Setup">
          {activeTab === 'setup' && <QCSetup />}
        </Tab>
        
        <Tab eventKey="new-session" title="New QC Session">
          {activeTab === 'new-session' && <QCSessionCreator />}
        </Tab>

        <Tab eventKey="sessions" title="QC Sessions">
          {activeTab === 'sessions' && <QCSessionsTable />}
        </Tab>
        
      </Tabs>
    </Container>
  )
}