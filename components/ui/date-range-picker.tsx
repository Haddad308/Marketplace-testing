'use client';

import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRange {
	from?: Date;
	to?: Date;
}

interface DateRangePickerProps {
	value?: DateRange;
	onValueChange: (range: DateRange | undefined) => void;
	placeholder?: string;
	className?: string;
}

export function DateRangePicker({
	value,
	onValueChange,
	placeholder = 'Pick a date range',
	className,
}: DateRangePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [startDate, setStartDate] = React.useState<Date | null>(value?.from || null);
	const [endDate, setEndDate] = React.useState<Date | null>(value?.to || null);

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		setStartDate(null);
		setEndDate(null);
		onValueChange(undefined);
	};

	const handleDateChange = (dates: [Date | null, Date | null]) => {
		const [start, end] = dates;
		setStartDate(start);
		setEndDate(end);

		if (start && end) {
			onValueChange({ from: start, to: end });
			setOpen(false);
		} else if (start) {
			onValueChange({ from: start, to: undefined });
		}
	};

	React.useEffect(() => {
		setStartDate(value?.from || null);
		setEndDate(value?.to || null);
	}, [value]);

	return (
		<div className={cn('grid gap-2', className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							'w-full justify-start border-gray-600 bg-gray-700 text-left font-normal text-white hover:bg-gray-600',
							!startDate && 'text-gray-400'
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{startDate ? (
							endDate ? (
								<div className="flex w-full items-center justify-between">
									<span>
										{format(startDate, 'LLL dd, y')} - {format(endDate, 'LLL dd, y')}
									</span>
									<X className="ml-2 h-4 w-4 text-gray-400 hover:text-white" onClick={handleClear} />
								</div>
							) : (
								<div className="flex w-full items-center justify-between">
									<span>{format(startDate, 'LLL dd, y')}</span>
									<X className="ml-2 h-4 w-4 text-gray-400 hover:text-white" onClick={handleClear} />
								</div>
							)
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto border-gray-700 bg-gray-800 p-0" align="start">
					<div className="date-picker-wrapper">
						<DatePicker
							selected={startDate}
							onChange={handleDateChange}
							startDate={startDate}
							endDate={endDate}
							selectsRange
							inline
							calendarClassName="dark-calendar"
						/>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
