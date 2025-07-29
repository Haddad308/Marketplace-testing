import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';

// Check if all required environment variables are present
const requiredEnvVars = {
	publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
	urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
};

// Validate environment variables
const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
	console.error(`Missing ImageKit environment variables: ${missingVars.join(', ')}`);
}

// Initialize ImageKit only if all variables are present
let imagekit: ImageKit | null = null;

if (missingVars.length === 0) {
	imagekit = new ImageKit({
		publicKey: requiredEnvVars.publicKey!,
		privateKey: requiredEnvVars.privateKey!,
		urlEndpoint: requiredEnvVars.urlEndpoint!,
	});
}

export async function GET() {
	if (!imagekit) {
		return NextResponse.json(
			{ 
				error: 'ImageKit not configured properly', 
				message: `Missing environment variables: ${missingVars.join(', ')}`,
				help: 'Please add the required ImageKit environment variables to your .env.local file'
			}, 
			{ status: 500 }
		);
	}

	try {
		const result = imagekit.getAuthenticationParameters();
		return NextResponse.json(result);
	} catch (error) {
		console.error('ImageKit authentication error:', error);
		return NextResponse.json(
			{ 
				error: 'Failed to generate ImageKit authentication parameters',
				message: error instanceof Error ? error.message : 'Unknown error'
			}, 
			{ status: 500 }
		);
	}
}
