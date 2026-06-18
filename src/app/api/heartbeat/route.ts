import { NextResponse } from 'next/server';
import { getFirebaseInstance } from '../../../lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';

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
    const { productId, version, activeUsers, environment, serverStatus } = body;
    
    // API key can be in headers or body
    const apiKey = request.headers.get('x-api-key') || body.apiKey;

    if (!apiKey || !productId) {
      return NextResponse.json({ success: false, error: 'Missing apiKey or productId parameters.' }, { status: 400, headers: corsHeaders });
    }

    const { db } = getFirebaseInstance(firebaseConfig);
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection offline.' }, { status: 500, headers: corsHeaders });
    }

    // Query product to verify keys match
    const q = query(collection(db, 'products'), where('productId', '==', productId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404, headers: corsHeaders });
    }

    const productDoc = snap.docs[0];
    const productData = productDoc.data();

    if (productData.apiKey !== apiKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key.' }, { status: 401, headers: corsHeaders });
    }

    // Provision Heartbeat record
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let heartbeatId = 'hb_';
    for (let i = 0; i < 10; i++) {
      heartbeatId += chars[Math.floor(Math.random() * chars.length)];
    }
    const timestamp = new Date().toISOString();

    const newHeartbeat = {
      heartbeatId,
      companyId: productData.companyId,
      productId,
      version: version || productData.version,
      activeUsers: Number(activeUsers) || 0,
      environment: environment || 'production',
      serverStatus: serverStatus || 'UP',
      timestamp
    };

    // Calculate health
    let status = 'LIVE';
    let healthScore = 100;
    if (serverStatus === 'DOWN') {
      status = 'OFFLINE';
      healthScore = 0;
    } else {
      healthScore = activeUsers > 5000 ? 92 : Math.min(100, 95 + Math.floor(Math.random() * 6));
    }

    // Maintain administrative status overrides
    if (productData.status === 'SUSPENDED') {
      status = 'SUSPENDED';
      healthScore = 40;
    } else if (productData.status === 'REVOKED') {
      status = 'REVOKED';
      healthScore = 10;
    }

    await setDoc(doc(db, 'heartbeats', heartbeatId), newHeartbeat);
    await updateDoc(doc(db, 'products', productId), {
      status,
      version: version || productData.version,
      activeUsers: Number(activeUsers) || 0,
      healthScore,
      lastHeartbeat: timestamp
    });

    // Write log doc
    let logId = 'log_';
    for (let i = 0; i < 10; i++) {
      logId += chars[Math.floor(Math.random() * chars.length)];
    }
    await setDoc(doc(db, 'activityLogs', logId), {
      logId,
      companyId: productData.companyId,
      userId: 'API_SDK',
      action: `SDK Heartbeat received from "${productData.name}" (Version: ${newHeartbeat.version}, Environment: ${newHeartbeat.environment}, Status: ${newHeartbeat.serverStatus})`,
      timestamp,
      employeeEmail: 'SDK Gateway'
    });

    return NextResponse.json({ success: true, message: 'Heartbeat recorded successfully.', status, healthScore }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
