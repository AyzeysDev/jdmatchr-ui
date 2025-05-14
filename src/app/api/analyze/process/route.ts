// src/app/api/analyze/process/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("[API /analyze/process] Route handler invoked.");

  // 1. Extract the session token cookie directly
  const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = secureCookie
    ? process.env.NEXTAUTH_SESSION_TOKEN_SECURE_COOKIE_NAME || "__Secure-next-auth.session-token"
    : process.env.NEXTAUTH_SESSION_TOKEN_COOKIE_NAME || "next-auth.session-token";
  
  const sessionCookie = request.cookies.get(cookieName);
  const encodedTokenForBackend = sessionCookie?.value;

  if (!encodedTokenForBackend) {
    console.error('[API /analyze/process] No session token cookie found.');
    return NextResponse.json({ message: 'Unauthorized: Session token missing.' }, { status: 401 });
  }
  console.log(`[API /analyze/process] Extracted '${cookieName}' cookie (first 50):`, encodedTokenForBackend.substring(0,50)+"...");

  // 2. Get FormData from the incoming request
  let formData: FormData;
  try {
    formData = await request.formData();
    // Log form data keys to confirm (don't log values if they contain sensitive file data directly)
    const formKeys = Array.from(formData.keys());
    console.log("[API /analyze/process] Received FormData with keys:", formKeys);
  } catch (error) {
    console.error("[API /analyze/process] Error parsing FormData:", error);
    return NextResponse.json({ message: 'Invalid request body: Expected FormData.' }, { status: 400 });
  }

  // 3. Call Spring Boot backend
  try {
    const springBootApiUrl = process.env.SPRING_BOOT_API_URL;
    if (!springBootApiUrl) {
        console.error("[API /analyze/process] SPRING_BOOT_API_URL is not defined");
        return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 500 });
    }

    const backendUrl = `${springBootApiUrl}/api/v1/insights/process`;
    console.log(`[API /analyze/process] Forwarding FormData to Spring Boot: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        // DO NOT set Content-Type for FormData; fetch does it automatically with the boundary
        'Authorization': `Bearer ${encodedTokenForBackend}`,
      },
      body: formData, // Pass the FormData directly
    });

    console.log(`[API /analyze/process] Spring Boot response status: ${response.status}`);
    const responseBodyText = await response.text(); // Get text first for robust parsing

    if (!response.ok) {
      console.error(`[API /analyze/process] Error from Spring Boot (${response.status}):`, responseBodyText);
      let errorMessage = `Analysis processing failed. Status: ${response.status}`;
      try {
        if (responseBodyText) {
            const errorData = JSON.parse(responseBodyText);
            errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        console.warn("[API /analyze/process] Could not parse JSON error from Spring Boot.", e);
        errorMessage = `Analysis processing failed. Non-JSON response from backend (first 100 chars): ${responseBodyText.substring(0,100)}`;
      }
      return NextResponse.json({ message: errorMessage, rawError: process.env.NODE_ENV === 'development' ? responseBodyText : undefined }, { status: response.status });
    }

    // If response is OK, parse the JSON (which should be the map with insightId)
    try {
        const data = JSON.parse(responseBodyText);
        console.log("[API /analyze/process] Data from Spring Boot:", data);
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error("[API /analyze/process] Successfully received OK from backend, but failed to parse JSON response:", e, "Response Text:", responseBodyText);
        return NextResponse.json({ message: 'Received malformed success data from backend for analysis.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API /analyze/process] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown internal server error during analysis processing.';
    return NextResponse.json({ message: `Internal Server Error: ${message}` }, { status: 500 });
  }
}
