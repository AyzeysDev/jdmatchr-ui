// src/lib/auth.ts
import { type NextAuthOptions, type User as NextAuthUser } from "next-auth"; // Import User type
import GoogleProvider from "next-auth/providers/google";
// --- Import CredentialsProvider ---
import CredentialsProvider from "next-auth/providers/credentials";

// Optional: Define interface for clarity if needed later
// interface BackendUser {
//   id: string;
//   name?: string | null;
//   email?: string | null;
// }

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // Ensure this is set in .env.local
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Ensure this is set in .env.local
    }),
    // --- Add CredentialsProvider with MOCK logic ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        // Basic validation
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth][Authorize] Missing email or password.");
          throw new Error("Please enter both email and password.");
        }
        const { email, password } = credentials;

        // --- MOCK USER LOGIC (Replace with backend call later) ---
        console.warn("[Auth][Authorize] Using MOCK authentication logic!");
        if (email === "test@example.com" && password === "password") {
            console.log("[Auth][Authorize] Mock login successful for:", email);
            // Return a mock user object matching NextAuth's User type (needs at least 'id')
            return { id: "mock-user-123", email: email, name: "Mock Dev User" };
        } else {
             console.log("[Auth][Authorize] Mock login failed for:", email);
             // Return null to indicate failed authentication
             return null;
        }
        // --- END MOCK USER LOGIC ---

        /*
        // --- REAL BACKEND CALL (Implement later) ---
        try {
          const backendLoginUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/login`;
          if (!process.env.SPRING_BOOT_API_URL) {
             throw new Error("Authentication backend service is not configured.");
          }
          const res = await fetch(backendLoginUrl, { // ... fetch options ... });
          if (!res.ok) { // ... handle error ... throw new Error(...) }
          const userFromBackend = await res.json();
          if (userFromBackend && userFromBackend.id) {
             return { id: userFromBackend.id, name: userFromBackend.name, email: userFromBackend.email };
          } else {
             throw new Error("Invalid user data received");
          }
        } catch (error: unknown) {
           console.error("[Auth][Authorize] Backend call failed:", error);
           if (error instanceof Error) { throw new Error(error.message); }
           throw new Error("Login failed due to a server error.");
        }
        // --- END REAL BACKEND CALL ---
        */
      }
    })
    // --- End CredentialsProvider ---
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Crucial: Ensure this is set in .env.local
  pages: {
    signIn: "/login", // Redirect here if authentication is required
  },
  callbacks: {
    // Keep your original simple callbacks for now
    // Session callback gets data from JWT token
    async session({ session, token }) {
      // Add the user ID from the token to the session object
      // Uses token.sub (standard JWT subject) or token.id (if added in jwt callback)
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      } else if (token?.id && session.user) {
        session.user.id = token.id as string; // Fallback
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id; // Add user ID to token on initial sign-in
      }
      return token;
    },
  },
  // Enable debug messages in development for more detailed logs
  debug: process.env.NODE_ENV === 'development',
};
