'use client';

import { setGlobalToastHandler, useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ToastComponent } from './toast';

export function Toaster() {
	const toastHandler = useToast();
	const { toasts, removeToast } = toastHandler;

	// Set up global toast handler
	useEffect(() => {
		setGlobalToastHandler(toastHandler);
	}, [toastHandler]);

	// Don't render on server
	if (typeof window === 'undefined') {
		return null;
	}

	return createPortal(
		<div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-start gap-2 p-4 sm:p-6">
			<div className="flex w-full max-w-md flex-col gap-2">
				{toasts.map((toast) => (
					<div key={toast.id} className="animate-in slide-in-from-top-full duration-300 ease-out">
						<ToastComponent toast={toast} onClose={removeToast} />
					</div>
				))}
			</div>
		</div>,
		document.body
	);
}
