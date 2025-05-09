// src/app/api/analyzer/process/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt"; // Use getToken for JWT strategy

// Define expected form data keys for clarity and consistency
const FORM_KEY_RESUME = 'resumeFile';
const FORM_KEY_JOB_DESC = 'jobDescription';
const FORM_KEY_JOB_TITLE = 'jobTitle';

// Define the key your Spring Boot backend expects for the user ID in the form data
const BACKEND_USER_ID_KEY = 'userId'; // Adjust if your backend expects a different key name

/**
 * API Route Handler for processing resume and job description analysis.
 * Requires user authentication.
 * Forwards the request data along with user ID and JWT to the Spring Boot backend.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication and Get User ID
  // getToken decrypts the JWT cookie using NEXTAUTH_SECRET
  const token = await getToken({ req: request });

  // The 'sub' (subject) claim in the JWT should hold our internal User ID
  // after the jwt callback has run and potentially synced with the backend.
  if (!token || !token.sub) {
    console.warn("[API /analyze/process] Unauthorized access attempt: Missing token or token.sub (user ID).");
    // Return a 401 Unauthorized response
    return NextResponse.json({ message: "Unauthorized: Authentication required." }, { status: 401 });
  }
  // Use the validated internal user ID from the token's 'sub' claim
  const userId = token.sub;

  // Optional: Log basic info only in development for privacy/security
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API /analyze/process] Request received from authenticated user ID: ${userId}`);
  }

  try {
    // 2. Extract and Validate Form Data
    const formData = await request.formData();
    const resumeFile = formData.get(FORM_KEY_RESUME);
    const jobDescription = formData.get(FORM_KEY_JOB_DESC);
    const jobTitle = formData.get(FORM_KEY_JOB_TITLE);

    // Perform basic server-side validation (complementary to client-side Zod validation)
    if (!(resumeFile instanceof File)) {
       console.warn(`[API /analyze/process] Bad Request: Missing or invalid resume file for user ${userId}.`);
       return NextResponse.json({ message: `Missing or invalid required field: ${FORM_KEY_RESUME}.` }, { status: 400 });
    }
    if (!jobDescription) {
       console.warn(`[API /analyze/process] Bad Request: Missing job description for user ${userId}.`);
       return NextResponse.json({ message: `Missing required field: ${FORM_KEY_JOB_DESC}.` }, { status: 400 });
    }
     if (!jobTitle) {
       console.warn(`[API /analyze/process] Bad Request: Missing job title for user ${userId}.`);
       return NextResponse.json({ message: `Missing required field: ${FORM_KEY_JOB_TITLE}.` }, { status: 400 });
    }
    if (resumeFile.size === 0) {
        console.warn(`[API /analyze/process] Bad Request: Empty resume file uploaded by user ${userId}.`);
        return NextResponse.json({ message: "Resume file cannot be empty." }, { status: 400 });
    }
    // Consider adding further checks like file type or size limits if necessary,
    // although Zod handles this client-side. Server-side is safer.
    // const MAX_SIZE_MB = 5;
    // if (resumeFile.size > MAX_SIZE_MB * 1024 * 1024) {
    //    return NextResponse.json({ message: `File size exceeds ${MAX_SIZE_MB}MB limit.` }, { status: 400 });
    // }
    // if (resumeFile.type !== 'application/pdf') {
    //    return NextResponse.json({ message: "Invalid file type. Only PDF is allowed." }, { status: 400 });
    // }

    // 3. Prepare Request for Spring Boot Backend
    const springBootApiUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/analyzer/process-documents`;

    // Crucial check: Ensure the backend URL is configured
    if (!process.env.SPRING_BOOT_API_URL) {
        console.error("[API /analyze/process] Configuration Error: SPRING_BOOT_API_URL environment variable is not set.");
        // Return a 500 Internal Server Error as this is a server configuration issue
        return NextResponse.json({ message: "Backend analysis service URL is not configured." }, { status: 500 });
    }

    // Create FormData to send to the backend
    const backendFormData = new FormData();
    backendFormData.append(FORM_KEY_RESUME, resumeFile);
    backendFormData.append(FORM_KEY_JOB_DESC, jobDescription.toString());
    backendFormData.append(FORM_KEY_JOB_TITLE, jobTitle.toString());
    // Include the authenticated user's internal ID
    backendFormData.append(BACKEND_USER_ID_KEY, userId);

    console.log(`[API /analyze/process] Forwarding analysis request for user ${userId} to Spring Boot at ${springBootApiUrl}`);

    // 4. Make the fetch call to Spring Boot Backend
    const backendResponse = await fetch(springBootApiUrl, {
      method: 'POST',
      headers: {
        // Pass the raw, encoded JWT token in the Authorization header.
        // Spring Boot needs to be configured to validate this Bearer token.
        'Authorization': `Bearer ${token.raw}`, // `token.raw` contains the original encoded JWT string
        // 'Accept': 'application/json', // Optional: Indicate preference for JSON response
      },
      body: backendFormData, // `fetch` correctly sets Content-Type for FormData
      // signal: AbortSignal.timeout(30000) // Optional: Add a timeout (e.g., 30 seconds) for the backend call
    });

    // 5. Handle the Response from Spring Boot
    if (!backendResponse.ok) {
      // Try to extract a meaningful error message from the backend response
      let errorDetails = `Backend responded with status ${backendResponse.status} ${backendResponse.statusText}`;
      try {
        // Attempt to parse error response as JSON
        const errorData = await backendResponse.json();
        errorDetails = errorData.message || JSON.stringify(errorData); // Prefer 'message' field
      } catch (parseError) {
        // Log the JSON parsing error for debugging
        console.warn(`[API /analyze/process] Failed to parse backend error response as JSON:`, parseError); // <-- Log parseError here
        // If not JSON, try to get the response body as text
        try {
           const textErrorBody = await backendResponse.text();
           // Use the text body if it's not empty, otherwise stick with status text
           if (textErrorBody) errorDetails = textErrorBody;
        } catch (textError) {
          // If reading as text also fails, log the error but keep the original status text as details.
          console.warn(`[API /analyze/process] Failed to read backend error response body as text:`, textError);
        }
      }
      console.error(`[API /analyze/process] Error from Spring Boot for user ${userId}: ${backendResponse.status} - ${errorDetails}`);
      // Return a structured error to the frontend client, propagating the backend status code
      return NextResponse.json(
        { message: "Analysis request failed.", details: errorDetails },
        { status: backendResponse.status }
      );
    }

    // 6. Process Successful Backend Response
    try {
      // Parse the successful JSON response from the backend
      const analysisResult = await backendResponse.json();
      console.log(`[API /analyze/process] Successfully received analysis result for user ${userId}.`);
      // Return the successful result to the frontend client
      return NextResponse.json(analysisResult, { status: 200 });
    } catch (jsonError) {
        // Handle cases where the backend responded OK (2xx) but the body wasn't valid JSON
        console.error(`[API /analyze/process] Error parsing successful JSON response from backend for user ${userId}:`, jsonError);
        // Return a 502 Bad Gateway error, indicating an issue with the upstream service response
        return NextResponse.json({ message: "Received invalid format from analysis service.", details: "Could not parse JSON response." }, { status: 502 });
    }

  } catch (error: unknown) { // <-- Changed type from 'any' to 'unknown'
    // Catch unexpected errors during the process (e.g., network issues, FormData errors)
    console.error("[API /analyze/process] Internal Server Error:", error);

    let errorMessage = "An internal server error occurred while processing the analysis request.";
    let errorDetails = String(error); // Default detail is string representation

    // Check if it's a standard Error object to get the message
    if (error instanceof Error) {
        errorDetails = error.message;
        // Provide slightly more context for specific common errors if possible
        if (error instanceof TypeError && error.message.includes('formData.get')) {
            errorMessage = "Error reading submitted form data.";
        } else if (error.name === 'TimeoutError') { // Check for TimeoutError if using AbortSignal
            errorMessage = "The request to the analysis service timed out.";
        }
    }

    // Return a generic 500 Internal Server Error to the client
    return NextResponse.json({ message: errorMessage, details: errorDetails }, { status: 500 });
  }
}
