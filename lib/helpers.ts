import { User } from '@/types';

export const getInitials = (user: User) => {
	if (user.displayName) {
		return user.displayName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	}
	return user.email ? user.email[0].toUpperCase() : 'U';
};
