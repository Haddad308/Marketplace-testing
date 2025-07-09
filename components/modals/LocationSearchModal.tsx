'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { searchLocationsByQuery } from '@/lib/helpers';
import { LocationData } from '@/types';
import { MapPin, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LocationSearchModalProps {
	isOpen: boolean;
	onClose: () => void;
	onLocationSelect: (location: string) => void;
}

export function LocationSearchModal({ isOpen, onClose, onLocationSelect }: LocationSearchModalProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<LocationData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	useEffect(() => {
		if (debouncedSearchQuery.trim()) {
			setIsLoading(true);
			const results = searchLocationsByQuery(debouncedSearchQuery);
			setSearchResults(results.slice(0, 20)); // Limit to 20 results
			setIsLoading(false);
		} else {
			setSearchResults([]);
		}
	}, [debouncedSearchQuery]);

	const handleLocationSelect = (location: string) => {
		onLocationSelect(location);
		onClose();
		setSearchQuery('');
		setSearchResults([]);
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		setSearchResults([]);
	};

	const getMatchType = (location: LocationData, query: string): string => {
		const lowerQuery = query.toLowerCase();

		if (location.city.toLowerCase().includes(lowerQuery)) return 'city';
		if (location.zipCodes.some((zip) => zip.includes(query))) return 'zip';
		if (location.neighborhoods.some((n) => n.toLowerCase().includes(lowerQuery))) return 'neighborhood';
		return 'state';
	};

	const getMatchedItem = (location: LocationData, query: string): string => {
		const lowerQuery = query.toLowerCase();

		if (location.city.toLowerCase().includes(lowerQuery)) return location.city;

		const matchedZip = location.zipCodes.find((zip) => zip.includes(query));
		if (matchedZip) return matchedZip;

		const matchedNeighborhood = location.neighborhoods.find((n) => n.toLowerCase().includes(lowerQuery));
		if (matchedNeighborhood) return matchedNeighborhood;

		return location.state;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl border-gray-200 bg-white text-gray-900">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-gray-900">
						<MapPin className="h-5 w-5 text-purple-600" />
						Search by Location
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search Input */}
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<Input
							type="text"
							placeholder="Enter city, zip code, or neighborhood..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full border-gray-300 bg-white pr-10 pl-10 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
						/>
						{searchQuery && (
							<Button
								onClick={handleClearSearch}
								className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-transparent"
								variant="ghost"
								size="sm"
							>
								<X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
							</Button>
						)}
					</div>

					{/* Search Results */}
					<div className="max-h-96 overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600"></div>
							</div>
						) : searchResults.length > 0 ? (
							<div className="space-y-2">
								{searchResults.map((location, index) => {
									const matchType = getMatchType(location, searchQuery);
									const matchedItem = getMatchedItem(location, searchQuery);

									return (
										<div
											key={`${location.city}-${location.state}-${index}`}
											onClick={() => handleLocationSelect(location.displayName)}
											className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300 hover:bg-gray-100"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2">
														<h3 className="font-medium text-gray-900">{location.displayName}</h3>
														<Badge variant="secondary" className="bg-purple-100 text-xs text-purple-800">
															{matchType}
														</Badge>
													</div>
													<p className="text-sm text-gray-600">Match: {matchedItem}</p>

													{/* Show some neighborhoods for context */}
													{location.neighborhoods.length > 0 && (
														<div className="mt-2 flex flex-wrap gap-1">
															{location.neighborhoods.slice(0, 3).map((neighborhood) => (
																<Badge key={neighborhood} variant="outline" className="border-gray-300 text-xs text-gray-600">
																	{neighborhood}
																</Badge>
															))}
															{location.neighborhoods.length > 3 && (
																<Badge variant="outline" className="border-gray-300 text-xs text-gray-500">
																	+{location.neighborhoods.length - 3} more
																</Badge>
															)}
														</div>
													)}
												</div>
												<MapPin className="mt-1 h-4 w-4 text-gray-400" />
											</div>
										</div>
									);
								})}
							</div>
						) : searchQuery.trim() ? (
							<div className="py-8 text-center text-gray-500">
								<MapPin className="mx-auto mb-3 h-12 w-12 text-gray-300" />
								<p>No locations found for &quot;{searchQuery}&quot;</p>
								<p className="mt-1 text-sm text-gray-400">Try searching for a city, zip code, or neighborhood</p>
							</div>
						) : (
							<div className="py-8 text-center text-gray-500">
								<Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />
								<p>Start typing to search locations</p>
								<p className="mt-1 text-sm text-gray-400">Search by city, zip code, or neighborhood</p>
							</div>
						)}
					</div>

					{/* Popular Locations */}
					{!searchQuery && (
						<div className="border-t border-gray-200 pt-4">
							<h4 className="mb-3 font-medium text-gray-900">Popular Locations</h4>
							<div className="grid grid-cols-2 gap-2">
								{['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'].map(
									(location) => (
										<Button
											key={location}
											onClick={() => handleLocationSelect(location)}
											variant="outline"
											className="justify-start border-gray-300 bg-white text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900"
										>
											<MapPin className="mr-2 h-4 w-4" />
											{location}
										</Button>
									)
								)}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
