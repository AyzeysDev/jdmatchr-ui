// src/app/api/insights/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
// We are NOT using getToken from next-auth/jwt in this approach for this route's primary logic.
// We will directly extract the JWS from the cookie and pass it to the Spring Boot backend for validation.

export async function GET(request: NextRequest) {
  console.log("[API /history] Route handler invoked (Direct Cookie JWS Method).");

  const cookieHeader = request.headers.get('cookie');
  console.log("[API /history] Raw cookie header (first 200 chars):", cookieHeader ? cookieHeader.substring(0, 200) + "..." : "No cookie header");

  // 1. Directly extract the session token cookie value (the raw JWS)
  const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = secureCookie
    ? process.env.NEXTAUTH_SESSION_TOKEN_SECURE_COOKIE_NAME || "__Secure-next-auth.session-token"
    : process.env.NEXTAUTH_SESSION_TOKEN_COOKIE_NAME || "next-auth.session-token";

  const sessionCookie = request.cookies.get(cookieName);
  const encodedTokenForBackend = sessionCookie?.value;

  console.log(`[API /history] Extracted '${cookieName}' cookie value (first 50 chars):`, encodedTokenForBackend ? encodedTokenForBackend.substring(0, 50) + "..." : "NOT FOUND");

  // 2. Check if the token string (our JWS) exists in the cookie.
  // This is the basic check in this Next.js API route that a session *should* exist.
  // Full validation of the JWS content, signature, and expiration will be done by Spring Boot.
  if (!encodedTokenForBackend) {
    console.error('[API /history] No NextAuth.js session token cookie found. User is likely not authenticated.');
    return NextResponse.json({ message: 'Unauthorized: Session token missing.' }, { status: 401 });
  }

  // 3. We have the raw JWS string. Now, attempt to call Spring Boot.
  try {
    const springBootApiUrl = process.env.SPRING_BOOT_API_URL;
    if (!springBootApiUrl) {
        console.error("[API /history] SPRING_BOOT_API_URL is not defined");
        return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 500 });
    }

    console.log(`[API /history] Attempting to call Spring Boot: ${springBootApiUrl}/api/v1/insights/history with the extracted JWS.`);
    const response = await fetch(`${springBootApiUrl}/api/v1/insights/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${encodedTokenForBackend}`, // Send the raw, ENCODED JWS
        // 'Content-Type': 'application/json', // Not strictly needed for GET with no body
      },
    });
    console.log(`[API /history] Spring Boot response status: ${response.status}`);

    // Handle Spring Boot response
    const responseText = await response.text(); // Get text first to handle empty or non-JSON responses gracefully
    if (!response.ok) {
      console.error(`[API /history] Error from Spring Boot (${response.status}):`, responseText);
      let errorMessage = `Failed to fetch insights history from backend. Status: ${response.status}`;
      try {
          if (responseText) { // Only try to parse if there's text
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
      } catch (jsonParseException) {
          console.warn("[API /history] Failed to parse JSON error response from backend:", jsonParseException);
          errorMessage = `Failed to fetch insights history. Non-JSON response from backend (first 100 chars): ${responseText.substring(0,100)}`;
      }
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    // If response.ok, try to parse as JSON
    try {
        // If responseText is empty (e.g. for a 204, though we'd ideally handle that before .ok check)
        // or if backend sends an empty array for an OK response.
        const data = responseText ? JSON.parse(responseText) : [];
        console.log("[API /history] Data from Spring Boot:", data);
        return NextResponse.json(data);
    } catch (jsonParseException) {
        console.error("[API /history] Successfully fetched from Spring Boot, but failed to parse JSON response:", jsonParseException, "Response text:", responseText);
        return NextResponse.json({ message: 'Received malformed data from backend.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API /history] Unexpected error during fetch to Spring Boot or response processing:', error);
    return NextResponse.json({ message: 'Internal Server Error fetching insights history' }, { status: 500 });
  }
}
