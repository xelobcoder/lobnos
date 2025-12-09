"use client";
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getDataAndUpdateState, customPost } from '../../../components/Auth/customFetch'
import { Form, Alert, Table } from 'react-bootstrap'
import { RiEditLine, RiDeleteBinLine } from '@remixicon/react'
import { toast } from 'react-toastify'
import styles from './tax.module.css'
import PrimeToast from '../../../components/accessories/PrimeToast'
import { useMediaQuery } from 'react-responsive'

interface TaxItem {
  id: number;
  name: string;
  value: string;
  apply: 'Yes' | 'No';
}

const taxSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Tax name is required'),
  value: z.string().min(1, 'Tax value is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number with up to 2 decimal places')
})

type TaxFormData = z.infer<typeof taxSchema>

export default function Application_Taxes_List() {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: '',
      value: ''
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ isEdit: boolean; editdata: TaxItem | null }>({ isEdit: false, editdata: null })
  const [data, setData] = useState<TaxItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const getdata = useCallback(async () => {
    try {
      setError(null)
      await getDataAndUpdateState(setData, 'application/tax', null, setIsLoading as any)
    } catch (err) {
      setError('Failed to load tax data')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { getdata() }, [getdata])

  useEffect(() => {
    if (editing.isEdit && editing.editdata) {
      setValue('name', editing.editdata.name)
      setValue('value', editing.editdata.value)
    }
  }, [editing.isEdit, editing.editdata, setValue])

  const handleActivation = async (id: number, value: boolean) => {
    if (!id || typeof value !== 'boolean') return
    try {
      const response = await customPost("application/tax/activation", 'PUT', { id, status: value })
      if (response.status === "success") {
        toast.success(response.message, { position: "top-center" })
        setData(prevData => prevData.map(item => item.id === id ? { ...item, apply: value ? "Yes" : 'No' } : item))
      } else {
        toast.error(response.message, { position: 'top-center' })
      }
    } catch (err) {
      toast.error("Failed to update tax status", { position: 'top-center' })
    }
  }

  const deleteItem = async (id: number) => {
    if (!id || !window.confirm('Are you sure you want to delete this tax record?')) return
    try {
      const response = await customPost(`application/tax?id=${id}`, 'DELETE', {})
      if (response.status === "success") {
        toast.success(response.message, { position: "top-center" })
        setData(prevData => prevData.filter(item => item.id !== id))
      } else {
        toast.error(response.message, { position: 'top-center' })
      }
    } catch (err) {
      toast.error("Failed to delete tax record", { position: 'top-center' })
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedItems.length || !window.confirm(`Delete ${selectedItems.length} selected items?`)) return

    try {
      let successCount = 0
      let failCount = 0

      for (const id of selectedItems) {
        const response = await customPost(`application/tax?id=${id}`, 'DELETE', {})
        if (response.status === "success") {
          successCount++
        } else {
          failCount++
        }
      }

      if (successCount > 0) {
        setData(prevData => prevData.filter(item => !selectedItems.includes(item.id)))
        setSelectedItems([])
        toast.success(`Successfully deleted ${successCount} items`)
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} items`)
      }
    } catch (err) {
      toast.error("Failed to complete bulk deletion")
    }
  }

  const onSubmit = async (formData: TaxFormData) => {
    try {
      const payload = editing.isEdit && editing.editdata ? { ...formData, id: editing.editdata.id } : formData
      const response = await customPost('application/tax', editing.isEdit ? "PUT" : 'POST', payload)
      if (response.status === 'success') {
        toast.success(response.message)
        await getdata()
        reset()
        setEditing({ editdata: null, isEdit: false })
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      toast.error("Failed to save tax record")
    }
  }

  if (isLoading) return <div className='p-3 bg-secondary-subtle br-5'>Loading...</div>

  return (
    <div className='container-fluid py-3'>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <h4 className='bg-secondary-subtle pls-color br-5 p-3'>Add Tax</h4>
      <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <div className="row g-3">
          <div className="col-md-12">
            <Form.Group className='grid-reg'>
              <Form.Label className='pls-label'>Tax Name</Form.Label>
              <Form.Control type="text" {...register('name')} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-12">
            <Form.Group className='grid-reg'>
              <Form.Label className='pls-label'>Tax Value (%)</Form.Label>
              <Form.Control type="text" {...register('value')} isInvalid={!!errors.value} />
              <Form.Control.Feedback type="invalid">{errors.value?.message}</Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-12">
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary btn-sm">
                {editing.isEdit ? 'Update' : 'Add'} Tax
              </button>
              {editing.isEdit && (
                <button type="button" className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    reset()
                    setEditing({ editdata: null, isEdit: false })
                  }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </Form>
      <div className={styles.tableWrapper}>
        {selectedItems.length > 0 && (
          <div className="mb-2">
            <button className="btn btn-outline-danger btn-sm" onClick={handleBulkDelete}>
              Delete Selected ({selectedItems.length})
            </button>
          </div>
        )}

        {isMobile ? (
          <div>
            {data.map((item) => (
              <div key={item.id} className={styles.listItem}>
                <div className="d-flex justify-content-between bg-secondary-subtle p-1 br-5 ">
                  <div className='d-flex  ' >
                    <Form.Check
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        setSelectedItems(prev =>
                          e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        )
                      }}
                    // className="me-2"
                    />
                    <h6 className="mt-1 pls-label mx-3">{item.name}</h6>
                  </div>
                  <div>
                    <RiEditLine className='text-primary' onClick={() => setEditing({ isEdit: true, editdata: item })} />
                    <RiDeleteBinLine className='mx-2 text-danger' onClick={() => deleteItem(item.id)} />
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Value:</span>
                    <div className="d-flex align-items-center">
                      {item.value}%
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Status:</span>
                    <span className={`${styles.statusBadge} ${item.apply === 'Yes' ? styles.statusActive : styles.statusInactive}`}>
                      {item.apply}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Active:</span>
                    <Form.Check
                      type="switch"
                      className={styles.switchControl}
                      onChange={(e) => handleActivation(item.id, e.target.checked)}
                      checked={item.apply === "Yes"}
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table hover responsive className={styles.taxTable}>
            <thead>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    onChange={(e) => setSelectedItems(e.target.checked ? data.map(item => item.id) : [])}
                    checked={selectedItems.length === data.length && data.length > 0}
                  />
                </th>
                <th>Tax Name</th>
                <th>Tax Value</th>
                <th>Status</th>
                <th>Toggle Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        setSelectedItems(prev =>
                          e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        )
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {item.value}%
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.apply === 'Yes' ? styles.statusActive : styles.statusInactive}`}>
                      {item.apply}
                    </span>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      className={styles.switchControl}
                      onChange={(e) => handleActivation(item.id, e.target.checked)}
                      checked={item.apply === "Yes"}
                    />
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className='btn btn-sm btn-outline-primary'
                        onClick={() => setEditing({ isEdit: true, editdata: item })}>
                        <RiEditLine /> Edit
                      </button>
                      <button className='btn btn-sm btn-outline-danger ms-1'
                        onClick={() => deleteItem(item.id)}>
                        <RiDeleteBinLine /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  )
}