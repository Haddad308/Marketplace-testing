'use client';

import type React from 'react';

import { LayoutDashboard, LogOut, Menu, Package, Plus, Store, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/helpers';
import { IKContext } from 'imagekitio-react';

const navigation = [
	{ name: 'Dashboard', href: '/merchant/dashboard', icon: LayoutDashboard },
	{ name: 'Add Product', href: '/merchant/add-product', icon: Plus },
	{ name: 'Manage Products', href: '/merchant/manage-products', icon: Package },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
	const { user, signOut, loading } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && !user && pathname !== '/merchant/login') {
			router.push('/merchant/login');
		}
	}, [user, loading, pathname, router]);

	const handleSignOut = async () => {
		try {
			await signOut();
			toast.success('Success', 'Signed out successfully');
			router.push('/merchant/login');
		} catch (error) {
			console.error('Sign out error:', error);
			toast.error('Error', 'Failed to sign out');
		}
	};

	// Don't show layout on login page
	if (pathname === '/merchant/login') {
		return children;
	}

	// Show loading state
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!user) {
		return null;
	}

	return (
		<IKContext
			publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
			urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
			authenticationEndpoint="/api/imagekit-auth"
			authenticator={async () => {
				const res = await fetch('/api/imagekit-auth');
				const authParams = await res.json();
				return authParams;
			}}
		>
			<div className="flex min-h-screen bg-gray-900">
				{/* Mobile sidebar overlay */}
				{sidebarOpen && (
					<div className="fixed inset-0 z-40 lg:hidden">
						<div className="bg-opacity-75 fixed inset-0 bg-gray-600" onClick={() => setSidebarOpen(false)} />
					</div>
				)}

				{/* Sidebar */}
				<div
					className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
				>
					{/* Sidebar Header */}
					<div className="flex h-16 flex-shrink-0 items-center justify-between bg-gray-900 px-6">
						<div className="flex items-center space-x-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
								<Store className="h-5 w-5 text-white" />
							</div>
							<span className="text-xl font-bold text-white">Merchant</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="text-gray-400 hover:text-white lg:hidden"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
										isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
									}`}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* User Profile Section */}
					<div className="flex-shrink-0 border-t border-gray-700 p-4">
						<div className="mb-4 flex items-center space-x-3">
							<Avatar className="h-10 w-10 flex-shrink-0">
								<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
								<AvatarFallback className="bg-blue-600 text-sm text-white">{getInitials(user)}</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-white">
									{user.displayName || user.email?.split('@')[0] || 'Merchant'}
								</p>
								<p className="truncate text-xs text-gray-400">{user.email}</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
							onClick={handleSignOut}
						>
							<LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
							Sign Out
						</Button>
					</div>
				</div>

				{/* Main content */}
				<div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
					{/* Top bar */}
					<div className="sticky top-0 z-10 flex-shrink-0 border-b border-gray-700 bg-gray-800 px-4 py-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								size="sm"
								className="text-gray-400 hover:text-white lg:hidden"
								onClick={() => setSidebarOpen(true)}
							>
								<Menu className="h-5 w-5" />
							</Button>
							<div className="flex-1 lg:flex lg:items-center lg:justify-between">
								<h1 className="text-xl font-semibold text-white lg:text-2xl">
									{navigation.find((item) => item.href === pathname)?.name || 'Merchant Portal'}
								</h1>
							</div>
						</div>
					</div>

					{/* Page content */}
					<main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
				</div>
			</div>
		</IKContext>
	);
}
