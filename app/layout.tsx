import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseProvider } from '@/firebase/firebase-provider';
import Navbar from '@/sections/Navbar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Merchify - Discover & Shop Services',
	description:
		'Browse, wishlist, and shop the best service deals from top sellers. Affiliate links, no direct purchases. Sellers can add and promote their services easily.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content="#0f172a" />
			</head>
			<body className={inter.className}>
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
					<FirebaseProvider>
						<Navbar />
						<main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
					</FirebaseProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
