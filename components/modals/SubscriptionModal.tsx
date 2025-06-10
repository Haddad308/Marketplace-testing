'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FREE_SEARCH_COUNT } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface Props {
	open: boolean;
	onClose: () => void;
}

export function SubscriptionModal({ open, onClose }: Props) {
	const router = useRouter();

	const handleSubscribe = () => {
		onClose();
		router.push('/subscribe');
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md border border-slate-700 bg-slate-900 text-white">
				<DialogHeader>
					<DialogTitle className="text-xl">Search Limit Reached</DialogTitle>
				</DialogHeader>
				<div className="mt-2 text-sm">
					You’ve used all {FREE_SEARCH_COUNT} of your free searches. To continue using search features, please
					subscribe.
				</div>
				<DialogFooter className="mt-4">
					<Button
						onClick={handleSubscribe}
						className="w-full cursor-pointer border border-white bg-purple-600 hover:bg-purple-700"
					>
						Go to Subscription
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
