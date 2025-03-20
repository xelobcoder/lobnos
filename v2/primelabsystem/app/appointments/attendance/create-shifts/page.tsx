"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { shiftFormSchema, type ShiftFormValues } from "@/lib/validations/shift"
import { customFetch, customPost } from "../../../../lib/customFetch"
import { PrimeToast } from '../../../../components/accessories/PrimeToast'
import { Loader2, Clock, Palette, BadgeCheck, Pencil, Trash2, Plus, CalendarRange } from "lucide-react"
export default function CreateShiftPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [editingShift, setEditingShift] = useState<Shift | null>(null)

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      name: "",
      color: "#000000",
      starttime: "",
      endtime: "",
    },
  })

  const loadShifts = async () => {
    setIsLoading(true)
    try {
      const data = await customFetch("attendance/shifts")
      if (Array.isArray(data)) {
        setShifts(data)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShifts()
  }, [])

  const onSubmit = async (values: ShiftFormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        starttime: values.starttime.length === 5 ? values.starttime + ':00' : values.starttime,
        endtime: values.endtime.length === 5 ? values.endtime + ':00' : values.endtime,
      }

      if (editingShift) {
        await customPost(`attendance/shifts/${editingShift.id}`, 'PUT', payload)
        toast.success('Shift updated successfully!')
      } else {
        await customPost('attendance/shifts', 'POST', payload)
        toast.success('Shift created successfully!')
      }
      
      form.reset()
      setEditingShift(null)
      loadShifts()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift)
    form.reset({
      name: shift.name,
      color: shift.color,
      starttime: shift.starttime.slice(0, 5),
      endtime: shift.endtime.slice(0, 5),
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await customPost(`attendance/shifts/${id}`, "DELETE", {})
      toast.success("Shift deleted successfully!")
      loadShifts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <PrimeToast/>
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            {editingShift ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <h2 className="text-lg font-medium">{editingShift ? "Update Shift" : "Create Shift"}</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Shift Name
                    </FormLabel>
                    <FormControl>
                      <Input className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5" />
                      Color
                    </FormLabel>
                    <FormControl>
                      <Input type="color" className="h-9 w-20" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="starttime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <Input type="time" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        End Time
                      </FormLabel>
                      <FormControl>
                        <Input type="time" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  {loading ? 'Saving...' : editingShift ? 'Update Shift' : 'Create Shift'}
                </Button>
                {editingShift && (
                  <Button variant="outline" size="sm" onClick={() => {
                    form.reset()
                    setEditingShift(null)
                  }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              <h2 className="text-lg font-medium">Existing Shifts</h2>
            </div>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : shifts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm font-medium">ID</TableHead>
                      <TableHead className="text-sm font-medium">Shift Name</TableHead>
                      <TableHead className="text-sm font-medium">Color</TableHead>
                      <TableHead className="text-sm font-medium">Start Time</TableHead>
                      <TableHead className="text-sm font-medium">End Time</TableHead>
                      <TableHead className="text-sm font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="text-sm font-normal">{shift.id}</TableCell>
                        <TableCell className="text-sm font-normal">{shift.name}</TableCell>
                        <TableCell>
                          <div className="w-8 h-5 rounded" style={{ backgroundColor: shift.color }} />
                        </TableCell>
                        <TableCell className="text-sm font-normal">{shift.starttime}</TableCell>
                        <TableCell className="text-sm font-normal">{shift.endtime}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => handleEdit(shift)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(shift.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">No shifts available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}