"use client";

import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

interface WeeklyCalendarProps {
    selectedDays: number[];
    onDayToggle: (days: number[]) => void;
}

const daysOfWeek = [
    { label: 'D', value: 0 },
    { label: 'L', value: 1 },
    { label: 'M', value: 2 },
    { label: 'X', value: 3 },
    { label: 'J', value: 4 },
    { label: 'V', value: 5 },
    { label: 'S', value: 6 },
];

export function WeeklyCalendar({ selectedDays, onDayToggle }: WeeklyCalendarProps) {
    
    const handleToggle = (dayValue: number) => {
        const newSelectedDays = selectedDays.includes(dayValue)
            ? selectedDays.filter(d => d !== dayValue)
            : [...selectedDays, dayValue];
        onDayToggle(newSelectedDays);
    };

    return (
        <div className="flex justify-between gap-1">
            {daysOfWeek.map(day => (
                <Toggle
                    key={day.value}
                    pressed={selectedDays.includes(day.value)}
                    onPressedChange={() => handleToggle(day.value)}
                    variant="outline"
                    className="w-10 h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    aria-label={`Seleccionar ${day.label}`}
                >
                    {day.label}
                </Toggle>
            ))}
        </div>
    );
}
