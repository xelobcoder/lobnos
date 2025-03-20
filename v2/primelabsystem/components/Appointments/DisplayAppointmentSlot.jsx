import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppointmentSlots({ title, slot, appointment, handleClick }) {
  if (!slot || slot.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="py-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2">
          {slot.map((time, index) => (
            <Button
              key={index}
              variant={appointment.appointment_time === time ? "default" : "outline"}
              size="sm"
              onClick={() => handleClick(time)}
              className="text-xs"
            >
              {time}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
