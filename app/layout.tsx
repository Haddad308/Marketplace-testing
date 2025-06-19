'use client';

import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseProvider } from '@/firebase/firebase-provider';
import Navbar from '@/sections/Navbar';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import type React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isDashboard = pathname.startsWith('/merchant');

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content="#0f172a" />
			</head>
			<body className={inter.className + ' bg-gray-50'}>
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
					<FirebaseProvider>
						<ToastProvider>
							{!isDashboard && <Navbar />}
							<main className={isDashboard ? '' : 'container mx-auto max-w-7xl bg-gray-50 px-4 sm:px-6 lg:px-8'}>
								<div className="bg-white py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">{children}</div>
							</main>
						</ToastProvider>
					</FirebaseProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
