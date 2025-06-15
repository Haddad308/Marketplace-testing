'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import * as React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	description?: string;
	duration?: number;
}

interface ToastProps {
	toast: Toast;
	onClose: (id: string) => void;
}

const toastIcons = {
	success: CheckCircle,
	error: AlertCircle,
	info: Info,
	warning: AlertTriangle,
};

const toastStyles = {
	success: 'border-green-200 bg-green-50 text-green-800',
	error: 'border-red-200 bg-red-50 text-red-800',
	info: 'border-blue-200 bg-blue-50 text-blue-800',
	warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
};

const iconStyles = {
	success: 'text-green-500',
	error: 'text-red-500',
	info: 'text-blue-500',
	warning: 'text-yellow-500',
};

export function ToastComponent({ toast, onClose }: ToastProps) {
	const Icon = toastIcons[toast.type];

	React.useEffect(() => {
		const duration = toast.duration || 5000;
		const timer = setTimeout(() => {
			onClose(toast.id);
		}, duration);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onClose]);

	return (
		<div
			className={cn(
				'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
				toastStyles[toast.type]
			)}
		>
			<Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', iconStyles[toast.type])} />

			<div className="flex-1 space-y-1">
				<div className="font-medium">{toast.title}</div>
				{toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
			</div>

			<button
				onClick={() => onClose(toast.id)}
				className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 focus:ring-2 focus:ring-black/20 focus:outline-none"
			>
				<X className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</button>
		</div>
	);
}
