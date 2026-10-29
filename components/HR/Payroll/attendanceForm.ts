export function attendanceHours(clockIn?: string | null, clockOut?: string | null, nightShift = false): number | undefined {
 if (!clockIn || !clockOut) return undefined;
 const minutes = (time: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) throw new Error('Enter valid clock-in and clock-out times.');
  const [hours, mins, seconds = 0] = time.split(':').map(Number); return hours * 60 + mins + seconds / 60;
 };
 let duration = minutes(clockOut) - minutes(clockIn);
 if (duration < 0) {
  if (!nightShift) throw new Error('Clock-out is earlier than clock-in. Select a night shift for an overnight record.');
  duration += 24 * 60;
 }
 return Math.round(duration / 60 * 100) / 100;
}
export function attendancePayload(record: any) {
 const employeeid = Number(record.employeeid);
 if (!Number.isSafeInteger(employeeid) || employeeid <= 0) throw new Error('Select an employee before saving attendance.');
 const numeric = (value: unknown, label: string, maximum: number) => {
  const number = value == null || value === '' ? 0 : Number(value);
  if (!Number.isFinite(number) || number < 0 || number > maximum) throw new Error(`${label} must be between 0 and ${maximum}.`);
  return number;
 };
 const absent = record.status === 'absent';
 const supported = ['present','absent','half_day','late','early_departure'];
 if (!supported.includes(record.status)) throw new Error('Choose a supported attendance status. Leave requests are recorded under Leave Management.');
 if (!absent && !record.clock_in) throw new Error('Enter clock-in time for this attendance status.');
 const total = absent ? 0 : attendanceHours(record.clock_in, record.clock_out, record.shift_type === 'night');
 const overtime = absent ? 0 : numeric(record.overtime_hours, 'Overtime hours', 24);
 if (total != null && overtime > total) throw new Error('Overtime cannot exceed the total worked hours.');
 const approved = !absent && Boolean(record.overtime_approved);
 const approver = approved ? Number(record.overtime_approved_by) : null;
 if (approved && (!Number.isSafeInteger(approver) || Number(approver) <= 0)) throw new Error('Select the overtime approver.');
 return { employeeid, attendance_date: record.attendance_date, clock_in: absent ? null : record.clock_in || null,
  clock_out: absent ? null : record.clock_out || null, total_hours: total ?? 0,
  shift_type: record.shift_type, work_location: record.work_location, status: record.status,
  late_minutes: absent ? 0 : numeric(record.late_minutes, 'Late minutes', 1440), overtime_hours: overtime,
  overtime_approved: approved, overtime_approved_by: approver, remarks: record.remarks || null };
}
