import { adminAuth } from '@/firebase/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { email } = await req.json();

		const userRecord = await adminAuth.getUserByEmail(email);
		return NextResponse.json({ exists: true, uid: userRecord.uid });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Internal server error';
		return NextResponse.json({ exists: false, error: message }, { status: 500 });
	}
}
