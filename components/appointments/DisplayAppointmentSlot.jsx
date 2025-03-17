export default function AppointmentSlots({ slot = [], title, handleClick, appointment }) {
	if (slot.length === 0) {
		return <div className="alert alert-danger p-3 rounded">No available slots for this {title}</div>;
	}

	return (
		<div className="mb-3">
			<h5 className="fw-semibold">{title} Slots</h5>
			<div className="d-flex flex-wrap gap-2">
				{slot.map((item, index) => (
					<button
						onClick={() => handleClick(item)}
						key={index}
						className={`btn px-3 btn-sm py-2 border-2 rounded ${appointment.appointment_time === item
								? "btn-primary text-white"
								: "btn-outline-primary"
							}`}
					>
						{item}
					</button>
				))}
			</div>
		</div>
	);
}
