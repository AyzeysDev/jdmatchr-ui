// src/lib/auth.ts
import { type NextAuthOptions, type User as NextAuthUser, type Account, type Profile, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";
import { type AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Interface defining the expected structure of user data
 * returned by the backend's /login endpoint or /ensure-oauth endpoint.
 * This should match the UserResponse DTO from your Spring Boot backend.
 */
interface BackendUserResponse {
  id: string;
  name?: string | null;
  email?: string | null;
  // imageUrl?: string | null; // If your UserResponse DTO includes it
}

/**
 * Interface for the expected structure of a JSON error response from the backend.
 * Should match your ApiErrorResponse DTO in Spring Boot.
 */
interface BackendErrorResponse {
    timestamp?: string;
    status?: number;
    error?: string;
    message: string; // The most important field for user feedback
    path?: string;
}


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth][Authorize] Error: Missing email or password in submitted credentials.");
          throw new Error("Please enter both email and password.");
        }
        const { email, password } = credentials;

        try {
          const backendLoginUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/login`;
          if (!process.env.SPRING_BOOT_API_URL) {
             console.error("[Auth][Authorize] Error: SPRING_BOOT_API_URL environment variable is not set.");
             throw new Error("Authentication backend service is not configured. Please contact support.");
          }

          console.log(`[Auth][Authorize] Attempting to authenticate user ${email} via backend: ${backendLoginUrl}`);

          const response = await fetch(backendLoginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            let errorResponseMessage = `Login failed: Server responded with ${response.status}.`; // Default
            try {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const errorData: BackendErrorResponse = await response.json();
                errorResponseMessage = errorData.message || `Login failed: ${response.status}.`; // Use message from JSON error
              } else {
                // If not JSON, try to get the response as text
                const errorText = await response.text();
                if (errorText) {
                  errorResponseMessage = errorText; // Use the plain text error from backend
                } else {
                  errorResponseMessage = `Login failed: ${response.status} ${response.statusText || 'Server error (empty response)'}`;
                }
                console.warn("[Auth][Authorize] Backend error response was not JSON or text was empty. Status:", response.status);
              }
            } catch (e) { // Catch error if response.json() or response.text() itself fails unexpectedly
              console.error("[Auth][Authorize] Error parsing backend error response body:", e);
              errorResponseMessage = `Login failed: ${response.status} ${response.statusText || 'Server error (parsing failed)'}`;
            }
            console.error(`[Auth][Authorize] Backend login failed for ${email}. Reason: ${errorResponseMessage}`);
            throw new Error(errorResponseMessage); // This error message will be available in result.error on the client
          }

          // If login is successful, backend should return user details
          const userFromBackend: BackendUserResponse = await response.json();

          if (userFromBackend && userFromBackend.id) {
            console.log(`[Auth][Authorize] Backend login successful for ${email}. User ID from DB: ${userFromBackend.id}`);
            return {
              id: userFromBackend.id,
              name: userFromBackend.name,
              email: userFromBackend.email,
              // image: userFromBackend.imageUrl, // If your UserResponse DTO includes it
            };
          } else {
            console.error(`[Auth][Authorize] Backend login OK, but invalid user data for ${email}. Data:`, userFromBackend);
            throw new Error("Invalid user data received from authentication server.");
          }
        } catch (error: unknown) {
          console.error("[Auth][Authorize] Exception during backend call or processing:", error);
          if (error instanceof Error) {
            throw error; // Re-throw it if it's already an Error object
          }
          // For other types of caught errors (e.g., network errors before response)
          throw new Error("Login failed due to a server communication error or unexpected issue.");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      } else if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
      profile?: Profile | null;
    }): Promise<JWT> {
      let internalUserId: string | undefined = token.sub ?? token.id;

      if (user) {
        internalUserId = user.id;
        token.id = user.id;
      }

      if (account && profile && (account.provider === 'google')) {
        console.log(`[Auth][JWT] Processing OAuth sign-in for provider: ${account.provider}, User from provider: ${profile.email}`);
        try {
          const backendEnsureUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/users/ensure-oauth`;
          if (!process.env.SPRING_BOOT_API_URL) {
            throw new Error("Backend API URL not configured for OAuth user persistence.");
          }

          let imageUrl: string | undefined | null = null;
          if (profile.image) {
            imageUrl = profile.image;
          } else if (profile && 'picture' in profile && typeof profile.picture === 'string') {
            imageUrl = profile.picture;
          }

          const ensureRes = await fetch(backendEnsureUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              providerId: account.provider,
              providerAccountId: account.providerAccountId,
              email: profile.email,
              name: profile.name,
              imageUrl: imageUrl,
            }),
          });

          if (!ensureRes.ok) {
            const errorText = await ensureRes.text(); // Or try .json() if backend sends JSON errors
            console.error(`[Auth][JWT] Failed to ensure OAuth user in backend (${ensureRes.status}): ${errorText}`);
            throw new Error("Failed to synchronize OAuth user with backend.");
          }

          const backendResult: { userId: string } = await ensureRes.json();
          if (backendResult.userId) {
            internalUserId = backendResult.userId;
            console.log(`[Auth][JWT] Synced OAuth user. Internal DB User ID: ${internalUserId}`);
          } else {
             console.error("[Auth][JWT] Backend /ensure-oauth endpoint did not return a userId.");
             throw new Error("Failed to get internal user ID from backend for OAuth user.");
          }
        } catch (error) {
          console.error("[Auth][JWT] Error calling /ensure-oauth backend endpoint:", error);
          throw new Error("Could not synchronize OAuth user with backend.");
        }
      }

      if (internalUserId) {
        token.sub = internalUserId;
        token.id = internalUserId;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
