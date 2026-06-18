import { NextResponse } from 'next/server';
import { getFirebaseInstance } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, productId } = body;
    const apiKey = request.headers.get('x-api-key') || body.apiKey;

    if (!apiKey || !productId || !licenseKey) {
      return NextResponse.json({ isValid: false, error: 'Missing apiKey, productId, or licenseKey parameters.' }, { status: 400, headers: corsHeaders });
    }

    const { db } = getFirebaseInstance(firebaseConfig);
    if (!db) {
      return NextResponse.json({ isValid: false, error: 'Database offline.' }, { status: 500, headers: corsHeaders });
    }

    // 1. Verify API Key and Product ID
    const prodQuery = query(collection(db, 'products'), where('productId', '==', productId));
    const prodSnap = await getDocs(prodQuery);
    if (prodSnap.empty) {
      return NextResponse.json({ isValid: false, error: 'Product not found.' }, { status: 404, headers: corsHeaders });
    }

    const productData = prodSnap.docs[0].data();
    if (productData.apiKey !== apiKey) {
      return NextResponse.json({ isValid: false, error: 'Unauthorized API Key.' }, { status: 401, headers: corsHeaders });
    }

    // 2. Query License document
    const licQuery = query(
      collection(db, 'licenses'), 
      where('productId', '==', productId), 
      where('key', '==', licenseKey)
    );
    const licSnap = await getDocs(licQuery);
    if (licSnap.empty) {
      return NextResponse.json({ isValid: false, reason: 'License key not registered to this product.' }, { headers: corsHeaders });
    }

    const licenseDoc = licSnap.docs[0];
    const licenseData = licenseDoc.data();

    // 3. Validate Status overrides
    if (licenseData.status === 'SUSPENDED') {
      return NextResponse.json({ isValid: false, status: 'SUSPENDED', reason: 'License key is suspended.' }, { headers: corsHeaders });
    }
    if (licenseData.status === 'REVOKED') {
      return NextResponse.json({ isValid: false, status: 'REVOKED', reason: 'License key is revoked.' }, { headers: corsHeaders });
    }

    // 4. Validate Expiration
    const now = new Date();
    const expiry = new Date(licenseData.expiryDate);
    if (now > expiry) {
      // Update state to EXPIRED in Firestore
      await updateDoc(doc(db, 'licenses', licenseData.licenseId), { status: 'EXPIRED' });
      return NextResponse.json({ isValid: false, status: 'EXPIRED', reason: 'License key has expired.' }, { headers: corsHeaders });
    }

    // 5. Validate Usage Limit / Node Count
    if (licenseData.usageLimit > 0 && (licenseData.usageCount || 0) >= licenseData.usageLimit) {
      return NextResponse.json({ 
        isValid: false, 
        status: 'ACTIVE', 
        reason: `Activation limit reached. This license is already active on the maximum allowed nodes (${licenseData.usageLimit}).` 
      }, { headers: corsHeaders });
    }

    // 6. Success - increment activation count and record sync time
    const updatedCount = (licenseData.usageCount || 0) + 1;
    const lastActivatedAt = now.toISOString();

    await updateDoc(doc(db, 'licenses', licenseData.licenseId), {
      usageCount: updatedCount,
      lastActivatedAt
    });

    // Write Log
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let logId = 'log_';
    for (let i = 0; i < 10; i++) {
      logId += chars[Math.floor(Math.random() * chars.length)];
    }
    await setDoc(doc(db, 'activityLogs', logId), {
      logId,
      companyId: productData.companyId,
      userId: 'API_SDK',
      action: `Validated and activated license key ${licenseKey.substring(0, 12)}... for "${productData.name}"`,
      timestamp: lastActivatedAt,
      employeeEmail: 'SDK Gateway'
    });

    return NextResponse.json({
      isValid: true,
      status: 'ACTIVE',
      usageCount: updatedCount,
      usageLimit: licenseData.usageLimit,
      expiryDate: licenseData.expiryDate,
      customerName: licenseData.customerName
    }, { headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({ isValid: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
