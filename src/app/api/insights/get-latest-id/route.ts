// src/app/api/insights/get-latest-id/route.ts
import { NextRequest, NextResponse } from 'next/server';
// We are purposefully NOT using getToken here to simplify and directly use the cookie's JWS value,
// relying on Spring Boot for full JWS validation for this backend call.

export async function GET(request: NextRequest) {
  console.log("[API /get-latest-id] Route handler invoked (Direct Cookie JWS Method).");

  const cookieHeader = request.headers.get('cookie');
  console.log("[API /get-latest-id] Raw cookie header (first 200 chars):", cookieHeader ? cookieHeader.substring(0, 200) + "..." : "No cookie header");

  // 1. Directly extract the session token cookie value (the raw JWS)
  const sessionCookieName = process.env.NEXTAUTH_SESSION_TOKEN_NAME ||
    (process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Secure-next-auth.session-token" : "next-auth.session-token");
  const sessionCookie = request.cookies.get(sessionCookieName);
  const encodedTokenForBackend = sessionCookie?.value;

  console.log(`[API /get-latest-id] Extracted '${sessionCookieName}' cookie value (first 50 chars):`, encodedTokenForBackend ? encodedTokenForBackend.substring(0, 50) + "..." : "NOT FOUND");

  // 2. Check if the token (our JWS) exists in the cookie.
  // This is our basic check in the Next.js API route that a session *should* exist.
  // Full validation of the JWS content, signature, and expiration will be done by Spring Boot.
  if (!encodedTokenForBackend) {
    console.error('[API /get-latest-id] No NextAuth.js session token cookie found. User is likely not authenticated.');
    return NextResponse.json({ message: 'Unauthorized: Session token missing.' }, { status: 401 });
  }

  // 3. We have the raw JWS string. Now, attempt to call Spring Boot.
  try {
    const springBootApiUrl = process.env.SPRING_BOOT_API_URL;
    if (!springBootApiUrl) {
        console.error("[API /get-latest-id] SPRING_BOOT_API_URL is not defined");
        return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 500 });
    }

    console.log(`[API /get-latest-id] Attempting to call Spring Boot: ${springBootApiUrl}/api/v1/insights/latest with the extracted JWS.`);
    const response = await fetch(`${springBootApiUrl}/api/v1/insights/latest`, {
      headers: {
        'Authorization': `Bearer ${encodedTokenForBackend}`, // Send the raw, ENCODED JWS
        // No 'Content-Type' needed for GET if not sending a body
      },
    });
    console.log(`[API /get-latest-id] Spring Boot response status: ${response.status}`);

    // Handle Spring Boot response
    if (response.status === 204 || response.status === 404) {
      console.log("[API /get-latest-id] Spring Boot indicated no latest insight (204 or 404).");
      return NextResponse.json({ latestInsightId: null }, { status: 200 });
    }

    // For other errors or success, try to parse the body
    const responseText = await response.text(); // Get text first to avoid parsing errors on empty/non-JSON
    if (!response.ok) {
      console.error(`[API /get-latest-id] Error from Spring Boot (${response.status}):`, responseText);
      let errorMessage = `Failed to fetch latest insight ID from backend. Status: ${response.status}`;
      try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
      } catch (jsonParseException) {
          console.warn("[API /get-latest-id] Failed to parse JSON error response from backend:", jsonParseException);
          errorMessage = `Failed to fetch latest insight ID. Non-JSON response from backend (first 100 chars): ${responseText.substring(0,100)}`;
      }
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    // If response.ok and not 204
    try {
        const data = JSON.parse(responseText); // Parse the text now that we know it's likely JSON
        console.log("[API /get-latest-id] Data from Spring Boot:", data);
        return NextResponse.json(data);
    } catch (jsonParseException) {
        console.error("[API /get-latest-id] Successfully received OK from backend, but failed to parse JSON response:", jsonParseException, "Response Text:", responseText);
        return NextResponse.json({ message: 'Received malformed success response from backend.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API /get-latest-id] Unexpected error during fetch to Spring Boot or response processing:', error);
    return NextResponse.json({ message: 'Internal Server Error fetching latest insight ID' }, { status: 500 });
  }
}
