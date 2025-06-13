import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoadingButton() {
	return (
		<Button variant="outline" className="flex h-10 w-32 items-center space-x-2 rounded-full border-gray-300 px-4 py-2">
			<Loader2 className="h-4 w-4 animate-spin" />
		</Button>
	);
}
