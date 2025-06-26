"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { customFetch } from '../../../../../../components/Auth/customFetch'
import { toast } from 'react-toastify'
import styles from '../../../../../../styles/SmsTemplateList.module.css'

interface QCReading {
  id: string
  sessionId: string
  parameterId: string
  parameter: string
  value: string
  status: 'normal' | 'warning' | 'critical' | 'unmonitored'
  createdAt: string
  controlMaterialId: string
}

const StatusBadge: React.FC<{ status: QCReading['status'] }> = ({ status }) => {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'normal':
        return {
          text: 'Normal',
          className: 'bg-success text-white',
        }
      case 'warning':
        return {
          text: 'Warning',
          className: 'bg-warning text-dark',
        }
      case 'critical':
        return {
          text: 'Critical',
          className: 'bg-danger text-white',
        }
      case 'unmonitored':
        return {
          text: 'Unmonitored',
          className: 'bg-secondary text-white',
        }
      default:
        // Ensure status is treated as a string before using string methods
        const statusString = String(status);
        return {
          text: statusString.charAt(0).toUpperCase() + statusString.slice(1),
          className: 'bg-light text-dark',
        }
    }
  }, [status])

  return (
    <span className={`badge ${statusConfig.className}`}>
      {statusConfig.text}
    </span>
  )
}

const ReadingRowSkeleton: React.FC = () => (
  <tr>
    <td><div className="placeholder-glow"><span className="placeholder col-8"></span></div></td>
    <td><div className="placeholder-glow"><span className="placeholder col-4"></span></div></td>
    <td><div className="placeholder-glow"><span className="placeholder col-6"></span></div></td>
    <td><div className="placeholder-glow"><span className="placeholder col-10"></span></div></td>
  </tr>
)

export default function ControlSessionReaderList() {
  const params = useParams()
  const router = useRouter()
  const controlMaterialId = useSearchParams()?.get('controlmaterialId') as string | undefined
  const [readings, setReadings] = useState<QCReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = params?.sessionid as string | undefined

  useEffect(() => {
    if (sessionId) {
      loadSessionReadings(sessionId)
    } else {
      setError("Session ID is missing.")
      setLoading(false)
    }
  }, [sessionId])

  const loadSessionReadings = async (currentSessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await customFetch(`qc-readings/session/${currentSessionId}`)
      if (response && Array.isArray(response)) {
        setReadings(response)
      } else {
        console.warn('Unexpected response structure:', response)
        setReadings([])
        toast.error('Failed to load readings: Invalid data format.')
        setError('Received invalid data format from server.')
      }
    } catch (err: any) {
      console.error('Error loading readings:', err)
      const errorMessage = err.message || 'An unknown error occurred while fetching readings.'
      toast.error(errorMessage)
      setError(errorMessage)
      setReadings([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewReading = () => {
    if (sessionId) {
      router.push(`/operations/laboratory/quality-control/qc-recording/${sessionId}/${controlMaterialId}`)
    } else {
      toast.warn("Cannot create new reading: Session ID is missing.")
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="table-responsive">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Status</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, index) => <ReadingRowSkeleton key={index} />)}
            </tbody>
          </table>
        </div>
      )
    }

    if (error) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          <strong>Error:</strong> {error}
          <button onClick={() => sessionId && loadSessionReadings(sessionId)} className="btn btn-sm btn-outline-danger ms-3">
            Try Again
          </button>
        </div>
      )
    }

    if (readings.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No Readings Found</h4>
          <p className="text-muted">
            There are no QC readings recorded for this session yet.
          </p>
          <button className='btn btn-primary mt-3' onClick={handleNewReading} disabled={!sessionId}>
            Record First Reading
          </button>
        </div>
      )
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">Value</th>
              <th scope="col">Status</th>
              <th scope="col">Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading.id}>
                <td>{reading.parameter}</td>
                <td>{reading.value}</td>
                <td>
                  <StatusBadge status={reading.status} />
                </td>
                <td>{new Date(reading.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container-fluid p-md-4">
      <div className="card shadow-sm">
        <div className="card-header bg-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h5 mb-0 text-primary">
              QC Readings for Session {sessionId ? `(ID: ${sessionId})` : ''}
            </h2>
            <button
              className='btn btn-primary'
              onClick={handleNewReading}
              disabled={!sessionId || loading}
            >
              New Reading
            </button>
          </div>
        </div>
        <div className="card-body">
          {renderContent()}
        </div>
        {readings.length > 0 && !loading && (
          <div className="card-footer text-muted small">
            Displaying {readings.length} reading(s).
          </div>
        )}
      </div>
    </div>
  )
}