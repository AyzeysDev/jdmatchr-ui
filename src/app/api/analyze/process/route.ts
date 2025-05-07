// src/app/api/analyzer/process/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt"; // Import getToken to access the JWT

export async function POST(request: NextRequest) {
  // 1. Get the JWT token from the incoming request
  // It uses the NEXTAUTH_SECRET automatically from your environment variables
  const token = await getToken({ req: request });

  // 2. Check if the token exists (i.e., user is authenticated)
  if (!token) {
    // If no token, the user is not authenticated
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 3. Log token contents for debugging (optional, remove in production)
  // The 'sub' claim usually holds the user ID from the provider.
  // Other claims depend on your jwt callback in auth.ts
  console.log("Authenticated user token:", token);
  console.log("User ID (from token.sub):", token.sub);

  try {
    // 4. Get the request body (resume, JD data)
    // Assuming you are sending FormData from the client:
    const formData = await request.formData();
    const resumeFile = formData.get('resumeFile'); // Adjust key as needed
    const jobDescription = formData.get('jobDescription'); // Adjust key as needed

    // Basic validation (add more robust validation)
    if (!resumeFile || !jobDescription) {
       return NextResponse.json({ message: "Missing resume file or job description." }, { status: 400 });
    }

    // TODO: Process the resumeFile if needed (e.g., read content) before sending
    // For now, we assume Spring Boot handles the file

    // 5. Prepare the request to Spring Boot
    const springBootApiUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/analyzer/process-documents`; // Example endpoint

    // Create FormData to send to Spring Boot if sending files
    const backendFormData = new FormData();
    backendFormData.append('resumeFile', resumeFile);
    backendFormData.append('jobDescription', jobDescription.toString());
    // Add user identifier if needed by backend (can be extracted from token)
    if(token.sub) {
      backendFormData.append('userId', token.sub);
    }


    // 6. Make the fetch call to Spring Boot, ADDING the Authorization header
    const backendResponse = await fetch(springBootApiUrl, {
      method: 'POST',
      headers: {
        // Pass the raw JWT token in the Authorization header
        'Authorization': `Bearer ${token.raw}`, // getToken provides the raw token string in token.raw
        // Note: Don't set 'Content-Type': 'application/json' when sending FormData;
        // fetch handles the multipart/form-data boundary automatically.
      },
      body: backendFormData,
    });

    // 7. Handle the response from Spring Boot
    if (!backendResponse.ok) {
      const errorData = await backendResponse.text(); // Get text for potential non-JSON errors
      console.error("Error from Spring Boot:", backendResponse.status, errorData);
      return NextResponse.json({ message: `Error from backend: ${backendResponse.statusText}`, details: errorData }, { status: backendResponse.status });
    }

    const analysisResult = await backendResponse.json();

    // 8. Return the result to the frontend client
    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error) {
    console.error("API /api/analyzer/process error:", error);
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON payload received." }, { status: 400 });
    }
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}
