"use client";

import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type DateTimePickerProps = {
  value?: Date | string | null;
  onChange?: (date: Date | undefined) => void;
};

export default function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps) {
  const dateObject = value ? new Date(value) : undefined;
  const isValidDate = dateObject && !isNaN(dateObject.getTime());

  const timeString = isValidDate ? format(dateObject, "HH:mm") : "12:00";

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined);
      return;
    }

    // Preserve existing time (if any) when selecting a new calendar day
    const newDate = new Date(selectedDate);
    if (isValidDate) {
      newDate.setHours(dateObject.getHours(), dateObject.getMinutes());
    } else {
      newDate.setHours(12, 0); // Default to 12:00 PM if no time was set before
    }

    onChange?.(newDate);
  };

  // 2. Handle Time change from <Input type="time" />
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value; // Format: "HH:mm"
    if (!timeVal) return;

    const [hours, minutes] = timeVal.split(":").map(Number);

    // If no date was selected yet, base it off Today
    const baseDate = isValidDate ? new Date(dateObject) : new Date();
    baseDate.setHours(hours, minutes, 0, 0);

    onChange?.(baseDate);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="">
            {isValidDate
              ? `Due ${format(dateObject, "MMM d, yyyy 'at' h:mm a")}`
              : "Due Date"}
          </Button>
        }
      />

      <PopoverContent className="w-auto flex flex-col gap-2">
        <Calendar
          mode="single"
          selected={dateObject}
          onSelect={handleDateSelect}
          className="rounded-lg border"
        />

        <div className="flex items-center ml-auto gap-3">
          <span className="text-sm font-medium">Time</span>

          <Input
            type="time"
            value={timeString}
            onChange={handleTimeChange}
            className="text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
