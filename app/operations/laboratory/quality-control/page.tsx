"use client"
import React from 'react'
import { QualityControlWorkspace } from '../../../../components/laboratory/QualityControl/QualityControlWorkspace'
import dynamic from 'next/dynamic'

const DeviceManager = dynamic(
  () => import('../../../../components/laboratory/QualityControl/DeviceManager').then(mod => ({ default: mod.DeviceManager })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const QCDashboard = dynamic(
  () => import('../../../../components/laboratory/QualityControl/Dashboard/QCDashboard').then(mod => ({ default: mod.QCDashboard })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const QCSetup = dynamic(
  () => import('../../../../components/laboratory/QualityControl/Setup/QCSetup').then(mod => ({ default: mod.QCSetup })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const ControlMaterialManager = dynamic(
  () => import('../../../../components/laboratory/QualityControl/ControlMaterialManager').then(mod => ({ default: mod.ControlMaterialManager })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const QCSessionsTable = dynamic(
  () => import('../../../../components/laboratory/QualityControl/QCSessionsTable').then(mod => ({ default: mod.QCSessionsTable })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const QCSessionCreator = dynamic(
  () => import('../../../../components/laboratory/QualityControl/QCRecording/QCSessionCreator').then(mod => ({ default: mod.QCSessionCreator })),
  { loading: () => <div role="status" className="p-4">Loading quality-control workspace…</div> }
)

const panels={dashboard:QCDashboard,sessions:QCSessionsTable,'new-session':QCSessionCreator,controls:ControlMaterialManager,devices:DeviceManager,setup:QCSetup};
export default function QualityControlPage(){return <QualityControlWorkspace panels={panels}/>}
