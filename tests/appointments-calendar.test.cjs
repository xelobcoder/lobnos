const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = (relativePath) => readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('appointments page uses react-big-calendar with month, week, day, and agenda views', () => {
	const page = read('app/appointments/page.jsx');
	assert.match(page, /from 'react-big-calendar'/);
	assert.match(page, /momentLocalizer\(moment\)/);
	assert.match(page, /<Calendar/);
	assert.match(page, /views=\{\['month', 'week', 'day', 'agenda'\]\}/);
	assert.match(read('app/layout.tsx'), /react-big-calendar\/lib\/css\/react-big-calendar\.css/);
});

test('calendar fetch is bounded by exact dates and responds to calendar view navigation', () => {
	const page = read('app/appointments/page.jsx');
	assert.match(page, /appointments\/month\?startDate=\$\{visibleRange\.start\}&endDate=\$\{visibleRange\.end\}/);
	assert.match(page, /onNavigate=\{\(date\) =>/);
	assert.match(page, /onView=\{\(nextView\) => setViewMode\(nextView\)\}/);
	assert.match(page, /onSelectEvent=\{\(event\) => openAppointment\(event\.appointment\)\}/);
});

test('appointment search and workflow filters are accessible and kept with the agenda', () => {
	const page = read('app/appointments/page.jsx');
	const styles = read('app/appointments/appointments.module.css');
	for (const label of ['Search appointments', 'Filter by appointment type', 'Filter by status']) {
		assert.ok(page.includes(`aria-label="${label}"`), `Missing accessible control: ${label}`);
	}
	assert.match(page, /Selected day agenda/);
	assert.match(styles, /event_laboratory/);
	assert.match(styles, /event_ultrasound/);
	assert.match(page, /value: 'follow_up', label: 'CRM follow-up'/);
	assert.match(page, /onRangeChange=\{\(range\) =>/);
	assert.match(styles, /@media \(max-width: 600px\)/);
});

test('appointments calendar and agenda use dark-theme surfaces and readable event colors', () => {
	const styles = read('app/appointments/appointments.module.css');
	assert.match(styles, /:global\(\[data-bs-theme="dark"\]\) \.page/);
	for (const selector of [
		'\.calendarCanvas :global\(\.rbc-today\)',
		'\.calendarCanvas :global\(\.rbc-off-range-bg\)',
		'\.calendarCanvas \.eventShell_consultation',
		'\.calendarCanvas \.eventShell_laboratory',
		'\.calendarCanvas \.eventShell_ultrasound',
		'\.calendarCanvas \.eventShell_follow_up',
		'\.agendaItemActive',
		'\.detailCard',
		'\.loadingOverlay',
	]) {
		assert.ok(styles.includes(selector.replaceAll('\\', '')), `Missing dark theme styling for ${selector}`);
	}
});

test('booking form carries calendar type/date and supports CRM and diagnostic links', () => {
	const form = read('components/appointments/newAppointmentModal.jsx');
	const appointment = read('lib/appointment.ts');
	assert.match(form, /get\("appointment_date"\)/);
	assert.match(form, /get\("appointment_type"\)/);
	assert.match(form, /appointment-lead/);
	assert.match(form, /appointment-billing/);
	assert.match(appointment, /appointment_type: data\.appointment_type/);
	assert.match(appointment, /lead_id: data\.lead_id/);
	assert.match(appointment, /billingid: data\.billingid/);
	assert.match(appointment, /patient or CRM lead/);
});
