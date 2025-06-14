import { useAuth } from '@/contexts/auth-context';

export default function WishlistBadge() {
	const { user } = useAuth();

	if (!user || !user?.wishlist || user.wishlist?.length === 0) return null;

	return (
		<div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs font-medium text-white">
			{(user?.wishlist?.length ?? 0) > 20 ? '20+' : (user?.wishlist?.length ?? 0)}
		</div>
	);
}
