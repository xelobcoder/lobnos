export default function AppointmentSlots({ slot = [], title, handleClick, appointment }) {
       if (slot.length == 0) {
              return <div className="alert alert-danger">No available slots for this {title}</div>
       }
  return (
    <div>
      <h5>{title} slots</h5>
      <div className="col-12">
        {slot.map((item, index) => (
          <div
            onClick={() => {handleClick(item)}}
            key={index}
            className={`shadow btn btn-outline-primary border-2 p-2 rounded mx-2 my-2 ${
              appointment.appointment_time === item ? "time-appointment-box" : ""
            }`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
