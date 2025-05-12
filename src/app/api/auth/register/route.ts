// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';

/**
 * API Route Handler for user registration.
 * This acts as a server-side proxy to your Spring Boot backend's registration endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get the registration data from the request body (sent by SignupForm.tsx)
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Basic server-side validation (optional, as frontend also validates)
    // You might want to add more robust validation here if needed.
    if (!name || !email || !password) {
      console.warn("[API /auth/register] Missing required fields in request body:", body);
      return NextResponse.json({ message: 'Missing required fields: name, email, and password are required.' }, { status: 400 });
    }
    // Add more validation if necessary (e.g., password complexity, email format again)

    // 3. Get the Spring Boot backend URL from environment variables
    const springBootRegisterUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/register`;
    if (!process.env.SPRING_BOOT_API_URL) {
      console.error("[API /auth/register] CRITICAL: SPRING_BOOT_API_URL environment variable is not set.");
      return NextResponse.json({ message: 'Backend registration service is not configured. Please contact support.' }, { status: 500 });
    }

    console.log(`[API /auth/register] Forwarding registration request for email ${email} to Spring Boot: ${springBootRegisterUrl}`);

    // 4. Make the fetch call to your Spring Boot backend's /register endpoint
    const backendResponse = await fetch(springBootRegisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers your Spring Boot backend might expect, if any
      },
      body: JSON.stringify({ name, email, password }),
      // Consider adding a timeout
      // signal: AbortSignal.timeout(10000) // 10 seconds
    });

    // 5. Process the response from the Spring Boot backend
    // Try to parse the response as JSON. If it fails, try to get it as text.
    let responseData;
    const contentType = backendResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        responseData = await backendResponse.json();
    } else {
        responseData = await backendResponse.text(); // Fallback for non-JSON responses or errors
    }

    // Return the backend's response (status and body) to the frontend client (SignupForm.tsx)
    // This allows SignupForm.tsx to display appropriate success or error messages from the backend.
    if (!backendResponse.ok) {
        console.warn(`[API /auth/register] Spring Boot registration failed for ${email}. Status: ${backendResponse.status}, Response:`, responseData);
    } else {
        console.log(`[API /auth/register] Spring Boot registration successful for ${email}. Status: ${backendResponse.status}`);
    }
    
    return NextResponse.json(responseData, { status: backendResponse.status });

  } catch (error: unknown) {
    // Catch any unexpected errors during the process (e.g., network issues, JSON parsing errors from request.json())
    console.error('[API /auth/register] Unexpected error processing registration request:', error);
    let message = 'An unexpected error occurred during registration. Please try again later.';
    if (error instanceof Error) {
      message = error.message; // Use the actual error message if available
    }
    // Return a generic 500 Internal Server Error
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
