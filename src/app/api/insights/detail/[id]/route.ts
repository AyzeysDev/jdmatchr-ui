// src/app/api/insights/detail/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // The dynamic segment 'id'
) {
  const insightId = params.id;
  console.log(`[API /insights/detail/${insightId}] Route handler invoked.`);

  if (!insightId) {
    return NextResponse.json({ message: 'Insight ID is required.' }, { status: 400 });
  }

  // 1. Directly extract the session token cookie
  const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = secureCookie
    ? process.env.NEXTAUTH_SESSION_TOKEN_SECURE_COOKIE_NAME || "__Secure-next-auth.session-token"
    : process.env.NEXTAUTH_SESSION_TOKEN_COOKIE_NAME || "next-auth.session-token";
  
  const sessionCookie = request.cookies.get(cookieName);
  const encodedTokenForBackend = sessionCookie?.value;

  if (!encodedTokenForBackend) {
    console.error(`[API /insights/detail/${insightId}] No session token cookie found.`);
    return NextResponse.json({ message: 'Unauthorized: Session token missing.' }, { status: 401 });
  }
  console.log(`[API /insights/detail/${insightId}] Extracted '${cookieName}' cookie (first 50):`, encodedTokenForBackend.substring(0,50)+"...");

  // 2. Call Spring Boot backend
  try {
    const springBootApiUrl = process.env.SPRING_BOOT_API_URL;
    if (!springBootApiUrl) {
        console.error(`[API /insights/detail/${insightId}] SPRING_BOOT_API_URL is not defined`);
        return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 500 });
    }

    const backendUrl = `${springBootApiUrl}/api/v1/insights/${insightId}`; // Use the insightId in the URL
    console.log(`[API /insights/detail/${insightId}] Attempting to call Spring Boot: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${encodedTokenForBackend}`,
      },
    });

    console.log(`[API /insights/detail/${insightId}] Spring Boot response status: ${response.status}`);
    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(`[API /insights/detail/${insightId}] Error from Spring Boot (${response.status}):`, responseBodyText);
      let errorMessage = `Failed to fetch insight details. Status: ${response.status}`;
      
      // Improved error parsing with proper typing
      try {
        if (responseBodyText) {
            const errorData = JSON.parse(responseBodyText);
            // Safely extract message if it exists
            if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && 
                typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            }
        }
      } catch (parseError: unknown) {
        // Log the parsing error but continue with the default error message
        console.warn(`[API /insights/detail/${insightId}] Failed to parse error response as JSON:`, 
          parseError instanceof Error ? parseError.message : String(parseError));
      }
      
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }
    
    try {
        const data = JSON.parse(responseBodyText);
        console.log(`[API /insights/detail/${insightId}] Data from Spring Boot:`, data);
        return NextResponse.json(data, { status: 200 });
    } catch (parseError: unknown) {
        // Properly typed error handling
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.error(`[API /insights/detail/${insightId}] Failed to parse JSON success response:`, 
          errorMessage, "Response Text:", responseBodyText);
        return NextResponse.json({ 
          message: 'Received malformed success data from backend.',
          details: errorMessage 
        }, { status: 500 });
    }

  } catch (error: unknown) {
    // Properly typed outer error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[API /insights/detail/${insightId}] Unexpected error:`, error);
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}