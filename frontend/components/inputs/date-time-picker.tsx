import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";

interface DateTimePickerProps {
  value?: Date;
  onChange: (data: Date | undefined) => void;
  disabled?: boolean;
}

export default function DateTimePicker({
  value,
  onChange,
  disabled,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    const newDate = new Date(date);
    if (selectedDate) {
      // Preserve currently selected hours and minutes
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else {
      // Default time to 09:00 if setting for the first time
      newDate.setHours(9, 0, 0, 0);
    }

    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    if (!timeStr) return;

    const [hours, minutes] = timeStr.split(":").map(Number);
    const updatedDate = selectedDate ? new Date(selectedDate) : new Date();

    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);

    setSelectedDate(updatedDate);
    onChange(updatedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP 'at' p")
          ) : (
            <span>Pick a date & time</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
        />
        <div className="p-3 border-t border-border flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Time:
          </span>

          <Input
            type="time"
            value={selectedDate ? format(selectedDate, "HH:mm") : "09:00"}
            onChange={handleTimeChange}
            className="w-[120px] h-8 text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
