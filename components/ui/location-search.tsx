'use client';

import { Check, ChevronDown, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { USA_LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LocationSearchProps {
	value: string;
	onValueChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	error?: boolean;
}

export function LocationSearch({
	value,
	onValueChange,
	onBlur,
	placeholder = 'Select location...',
	className,
	error = false,
}: LocationSearchProps) {
	const [open, setOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');

	const filteredLocations = USA_LOCATIONS.filter((location) =>
		location.toLowerCase().includes(searchValue.toLowerCase())
	);

	const handleSelect = (selectedValue: string) => {
		onValueChange(selectedValue);
		setOpen(false);
		setSearchValue('');
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setSearchValue('');
			onBlur?.();
		}
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						'w-full justify-between border-gray-600 bg-gray-700 text-white hover:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
						error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
						className
					)}
				>
					<div className="flex items-center">
						<MapPin className="mr-2 h-4 w-4 text-gray-400" />
						<span className={cn('truncate', !value && 'text-gray-400')}>{value || placeholder}</span>
					</div>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] border-gray-600 bg-gray-800 p-0"
				align="start"
				sideOffset={4}
			>
				<Command className="border-0 bg-gray-800">
					<CommandInput
						placeholder="Search locations..."
						value={searchValue}
						onValueChange={setSearchValue}
						className="border-gray-600 bg-gray-800 text-white"
					/>
					<CommandList className="bg-gray-800">
						<CommandEmpty className="text-gray-400">No location found.</CommandEmpty>
						<CommandGroup className="bg-gray-800">
							{filteredLocations.map((location) => (
								<CommandItem
									key={location}
									value={location}
									onSelect={() => handleSelect(location)}
									className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700 data-[selected=true]:bg-gray-700"
								>
									<Check className={cn('mr-2 h-4 w-4', value === location ? 'opacity-100' : 'opacity-0')} />
									{location}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
