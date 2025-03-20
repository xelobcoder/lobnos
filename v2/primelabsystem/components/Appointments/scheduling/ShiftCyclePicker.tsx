import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ShiftCyclePickerProps {
    shiftCycleStart: string
    shiftCycleEnd: string
    onCycleStartChange: (value: string) => void
    onCycleEndChange: (value: string) => void
    onGenerate: () => void
}

export default function ShiftCyclePicker({
    shiftCycleStart,
    shiftCycleEnd,
    onCycleStartChange,
    onCycleEndChange,
    onGenerate,
}: ShiftCyclePickerProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full sm:w-auto flex-1">
                <Input
                    type="date"
                    value={shiftCycleStart}
                    onChange={(e) => onCycleStartChange(e.target.value)}
                    placeholder="Shift Cycle Start"
                />
            </div>
            <div className="w-full sm:w-auto flex-1">
                <Input
                    type="date"
                    value={shiftCycleEnd}
                    onChange={(e) => onCycleEndChange(e.target.value)}
                    placeholder="Shift Cycle End"
                />
            </div>
            <Button onClick={onGenerate} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
            </Button>
        </div>
    )
}