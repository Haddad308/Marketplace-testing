import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseProvider } from '@/firebase/firebase-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'OmniSearch - Search Across Platforms',
	description: 'Search Google, YouTube, and Reddit all in one place',
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
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<FirebaseProvider>{children}</FirebaseProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
