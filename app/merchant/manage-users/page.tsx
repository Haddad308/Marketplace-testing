'use client';

import { ChevronLeft, ChevronRight, Search, Settings, Shield, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import { getUsers, updateUserPermissions, updateUserRole } from '@/firebase/userServices';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/hooks/use-toast';
import { USERS_PAGE_SIZE } from '@/lib/constants';
import { getInitials } from '@/lib/helpers';
import { permission, User } from '@/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export default function ManageUsersPage() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingPermissions, setUpdatingPermissions] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
	const [tempPermissions, setTempPermissions] = useState<permission[]>([]);

	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	useEffect(() => {
		fetchUsers(true);
	}, [currentUser, debouncedSearchQuery]);

	const fetchUsers = async (reset = false) => {
		try {
			setLoading(true);
			const result = await getUsers(USERS_PAGE_SIZE, reset ? undefined : lastDoc, debouncedSearchQuery || undefined);

			if (reset) {
				setUsers(result.users);
				setCurrentPage(1);
			} else {
				setUsers(result.users.slice(0, USERS_PAGE_SIZE));
			}

			setHasMore(result.hasMore);
			setLastDoc(result.lastDoc);
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Error', 'Failed to fetch users');
		} finally {
			setLoading(false);
		}
	};

	const handleMakeMerchant = async (user: User) => {
		try {
			if (!user.id) {
				throw new Error('User ID is missing');
			}

			await updateUserRole(user.id, 'merchant', ['add', 'edit', 'delete']);
			setUsers((prev) =>
				prev.map((u) =>
					u.id === user.id ? { ...u, role: 'merchant' as const, permissions: ['add', 'edit', 'delete'] } : u
				)
			);
			toast.success('Success', `${user.displayName || user.email} is now a merchant`);
		} catch (error) {
			console.error('Error updating user role:', error);
			toast.error('Error', `Failed to update user role: ${error}`);
		}
	};

	const handleUpdatePermissions = async () => {
		if (!selectedUser) return;
		setUpdatingPermissions(true);

		try {
			if (!selectedUser.id) {
				throw new Error('User ID is missing');
			}

			await updateUserPermissions(selectedUser.id, tempPermissions);
			setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions: tempPermissions } : u)));
			setPermissionsDialogOpen(false);
			toast.success('Success', 'Permissions updated successfully');
		} catch (error) {
			console.error('Error updating permissions:', error);
			toast.error('Error', `Failed to update permissions: ${error}`);
		} finally {
			setUpdatingPermissions(false);
		}
	};

	const openPermissionsDialog = (user: User) => {
		setSelectedUser(user);
		setTempPermissions(user.permissions || []);
		setPermissionsDialogOpen(true);
	};

	const handlePermissionChange = (permission: permission, checked: boolean) => {
		setTempPermissions((prev) => {
			if (checked) {
				const newPermissions = [...prev, permission];
				// If edit is selected, automatically include add
				if (permission === 'edit' && !newPermissions.includes('add')) {
					newPermissions.push('add');
				}
				return newPermissions;
			} else {
				const newPermissions = prev.filter((p) => p !== permission);
				// If add is deselected, also deselect edit
				if (permission === 'add') {
					return newPermissions.filter((p) => p !== 'edit');
				}
				return newPermissions;
			}
		});
	};

	const goToNextPage = () => {
		if (hasMore) {
			setCurrentPage((prev) => prev + 1);
			fetchUsers(false);
		}
	};

	const goToPrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
			fetchUsers(true);
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-red-600';
			case 'merchant':
				return 'bg-blue-600';
			default:
				return 'bg-gray-600';
		}
	};

	if (currentUser?.role !== 'admin') {
		return (
			<div className="flex items-center justify-center py-12">
				<Card className="border-gray-700 bg-gray-800">
					<CardContent className="p-8 text-center">
						<Shield className="mx-auto mb-4 h-12 w-12 text-red-400" />
						<h3 className="mb-2 text-lg font-medium text-white">Access Denied</h3>
						<p className="text-gray-400">You are not authorized to access this page.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card className="border-gray-700 bg-gray-800">
				<CardHeader>
					<CardTitle className="text-2xl text-white">Manage Users</CardTitle>
					<CardDescription className="text-gray-400">View and manage user roles and permissions</CardDescription>
				</CardHeader>
			</Card>

			{/* Search */}
			<Card className="border-gray-700 bg-gray-800">
				<CardContent className="p-4">
					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							placeholder="Search users by name or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card className="border-gray-700 bg-gray-800">
				<CardContent className="p-0">
					{loading ? (
						<div className="p-8 text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
							<p className="text-gray-400">Loading users...</p>
						</div>
					) : users.length === 0 ? (
						<div className="p-8 text-center">
							<Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
							<h3 className="mb-2 text-lg font-medium text-white">No users found</h3>
							<p className="text-gray-400">{searchQuery ? 'No users match your search criteria.' : 'No users available.'}</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow className="border-gray-700 hover:bg-transparent">
										<TableHead className="text-gray-300">User</TableHead>
										<TableHead className="text-gray-300">Role</TableHead>
										<TableHead className="text-gray-300">Permissions</TableHead>
										<TableHead className="text-gray-300">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user, ind) => (
										<TableRow key={ind} className="border-gray-700">
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-10 w-10">
														<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
														<AvatarFallback className="bg-gray-600 text-white">{getInitials(user)}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium text-white">{user.displayName || user.email?.split('@')[0] || 'Unknown'}</p>
														<p className="text-sm text-gray-400">{user.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
													{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
												</Badge>
											</TableCell>
											<TableCell>
												{user.role === 'merchant' ? (
													<div className="flex flex-wrap gap-1">
														{(user.permissions || []).map((permission, i) => (
															<Badge key={i} variant="outline" className="border-gray-600 text-gray-300">
																{permission}
															</Badge>
														))}
													</div>
												) : (
													<span className="text-gray-500">-</span>
												)}
											</TableCell>
											<TableCell>
												{user.role === 'user' ? (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button size="sm" className="bg-blue-600 hover:bg-blue-700">
																<UserCheck className="mr-1 h-3 w-3" />
																Make Merchant
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent className="border-gray-700 bg-gray-800">
															<AlertDialogHeader>
																<AlertDialogTitle className="text-white">Make Merchant</AlertDialogTitle>
																<AlertDialogDescription className="text-gray-400">
																	Are you sure you want to make {user.displayName || user.email} a merchant? They will be granted all
																	product management permissions (add, edit, delete).
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
																	Cancel
																</AlertDialogCancel>
																<AlertDialogAction onClick={() => handleMakeMerchant(user)} className="bg-blue-600 hover:bg-blue-700">
																	Make Merchant
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												) : user.role === 'merchant' ? (
													<Button
														size="sm"
														variant="outline"
														onClick={() => openPermissionsDialog(user)}
														className="border-gray-600 text-gray-300 hover:bg-gray-700"
													>
														<Settings className="mr-1 h-3 w-3" />
														Update Permissions
													</Button>
												) : (
													<span className="text-gray-500">-</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Pagination */}
							<div className="flex items-center justify-between border-t border-gray-700 p-4">
								<p className="text-sm text-gray-400">
									Page {currentPage} • Showing {users.length} {users.length === 1 ? 'user' : 'users'}
								</p>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={goToPrevPage}
										disabled={currentPage === 1}
										className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
									>
										<ChevronLeft className="h-4 w-4" />
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={goToNextPage}
										disabled={!hasMore}
										className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
									>
										Next
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Permissions Dialog */}
			<Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
				<DialogContent className="border-gray-700 bg-gray-800">
					<DialogHeader>
						<DialogTitle className="text-white">Update Permissions</DialogTitle>
						<DialogDescription className="text-gray-400">
							Manage permissions for {selectedUser?.displayName || selectedUser?.email}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="add"
									checked={tempPermissions.includes('add')}
									onCheckedChange={(checked) => handlePermissionChange('add', checked as boolean)}
								/>
								<Label htmlFor="add" className="text-gray-300">
									Add Products
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit"
									checked={tempPermissions.includes('edit')}
									onCheckedChange={(checked) => handlePermissionChange('edit', checked as boolean)}
								/>
								<Label htmlFor="edit" className="text-gray-300">
									Edit Products (includes Add)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="delete"
									checked={tempPermissions.includes('delete')}
									onCheckedChange={(checked) => handlePermissionChange('delete', checked as boolean)}
								/>
								<Label htmlFor="delete" className="text-gray-300">
									Delete Products
								</Label>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setPermissionsDialogOpen(false)}
							className="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Cancel
						</Button>
						<Button
							disabled={updatingPermissions}
							onClick={handleUpdatePermissions}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{updatingPermissions ? '...updating' : 'Update Permissions'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
