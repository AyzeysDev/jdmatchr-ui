// // src/app/api/insights/detail/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const insightId = params.id;
//   console.log(`[API /insights/detail/${insightId}] Route handler invoked.`);

//   // 1. Directly extract the session token cookie
//   const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://");
//   const cookieName = secureCookie
//     ? process.env.NEXTAUTH_SESSION_TOKEN_SECURE_COOKIE_NAME || "__Secure-next-auth.session-token"
//     : process.env.NEXTAUTH_SESSION_TOKEN_COOKIE_NAME || "next-auth.session-token";
  
//   const sessionCookie = request.cookies.get(cookieName);
//   const encodedTokenForBackend = sessionCookie?.value;

//   if (!encodedTokenForBackend) {
//     console.error(`[API /insights/detail/${insightId}] No session token cookie found.`);
//     return NextResponse.json({ message: 'Unauthorized: Session token missing.' }, { status: 401 });
//   }

//   // 2. Call Spring Boot backend
//   try {
//     const springBootApiUrl = process.env.SPRING_BOOT_API_URL;
//     if (!springBootApiUrl) {
//         console.error(`[API /insights/detail/${insightId}] SPRING_BOOT_API_URL is not defined`);
//         return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 500 });
//     }

//     const backendUrl = `${springBootApiUrl}/api/v1/insights/${insightId}`;
//     console.log(`[API /insights/detail/${insightId}] Attempting to call Spring Boot: ${backendUrl}`);

//     const response = await fetch(backendUrl, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${encodedTokenForBackend}`,
//       },
//     });

//     console.log(`[API /insights/detail/${insightId}] Spring Boot response status: ${response.status}`);
//     const responseBodyText = await response.text();

//     if (!response.ok) {
//       console.error(`[API /insights/detail/${insightId}] Error from Spring Boot (${response.status}):`, responseBodyText);
//       let errorMessage = `Failed to fetch insight details. Status: ${response.status}`;
//       try {
//         if (responseBodyText) {
//             const errorData = JSON.parse(responseBodyText);
//             errorMessage = errorData.message || errorMessage;
//         }
//       } catch (e) { /* Ignore parsing error, use status-based message */ }
//       return NextResponse.json({ message: errorMessage }, { status: response.status });
//     }
    
//     // If response.ok, parse the JSON
//     try {
//         const data = JSON.parse(responseBodyText);
//         console.log(`[API /insights/detail/${insightId}] Data from Spring Boot:`, data);
//         return NextResponse.json(data, { status: 200 });
//     } catch (e) {
//         console.error(`[API /insights/detail/${insightId}] Failed to parse JSON success response:`, e, "Response Text:", responseBodyText);
//         return NextResponse.json({ message: 'Received malformed success data from backend.' }, { status: 500 });
//     }

//   } catch (error) {
//     console.error(`[API /insights/detail/${insightId}] Unexpected error:`, error);
//     const message = error instanceof Error ? error.message : 'Unknown internal server error.';
//     return NextResponse.json({ message: `Internal Server Error: ${message}` }, { status: 500 });
//   }
// }
