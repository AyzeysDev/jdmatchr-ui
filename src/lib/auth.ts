// src/lib/auth.ts
import {
  type NextAuthOptions,
  type User as NextAuthUser,
  type Account as NextAuthAccountType, // Aliased for explicit use
  type Profile as NextAuthProfileType, // Aliased for explicit use
  type Session
} from "next-auth";
import { type JWT, type JWTEncodeParams, type JWTDecodeParams } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jsonwebtoken, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

interface BackendUserResponse {
  id: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

interface BackendErrorResponse {
    timestamp?: string;
    status?: number;
    error?: string;
    message: string;
    path?: string;
}

// Extends NextAuth's Profile to include 'picture' if Google sends it that way
interface GoogleProfile extends NextAuthProfileType { // Use the alias
    picture?: string;
}

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

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
          console.error("[Auth][Authorize] Error: Missing email or password.");
          throw new Error("Please enter both email and password.");
        }
        const { email, password } = credentials;

        try {
          const backendLoginUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/login`;
          if (!process.env.SPRING_BOOT_API_URL) {
             console.error("[Auth][Authorize] Error: SPRING_BOOT_API_URL not set.");
             throw new Error("Auth backend not configured.");
          }

          const response = await fetch(backendLoginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            let errorResponseMessage = `Login failed: Server responded with ${response.status}.`;
            try {
              const errorData: BackendErrorResponse = await response.json();
              errorResponseMessage = errorData.message || `Login failed: ${response.status}.`;
            } catch (parseError) {
                console.error("[Auth][Authorize] Error parsing JSON error response from backend, or backend sent non-JSON error:", parseError);
            }
            console.error(`[Auth][Authorize] Backend login failed for ${email}. Reason: ${errorResponseMessage}`);
            throw new Error(errorResponseMessage);
          }

          const userFromBackend: BackendUserResponse = await response.json();

          if (userFromBackend && userFromBackend.id) {
            return {
              id: userFromBackend.id,
              name: userFromBackend.name,
              email: userFromBackend.email,
              image: userFromBackend.imageUrl,
            };
          } else {
            console.error("[Auth][Authorize] Backend login OK, but invalid user data received.");
            throw new Error("Invalid user data from auth server.");
          }
        } catch (error: unknown) {
          console.error("[Auth][Authorize] Exception during backend call/processing:", error);
          if (error instanceof Error) throw error;
          throw new Error("Login communication error or unexpected issue.");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET as string,
    async encode(params: JWTEncodeParams): Promise<string> {
      const { token: tokenPayload, secret, maxAge } = params;
      if (!secret) throw new Error("JWT encode: secret is missing.");
      if (!tokenPayload) throw new Error("JWT encode: token payload is missing.");

      const payloadToSign = {
        ...tokenPayload,
        iat: tokenPayload.iat ?? Math.floor(Date.now() / 1000),
        exp: tokenPayload.exp ?? (Math.floor(Date.now() / 1000) + (maxAge ?? SESSION_MAX_AGE_SECONDS)),
      };
      console.log("[Auth][JWT_Encode] Encoding payload (first 100 chars):", JSON.stringify(payloadToSign).substring(0,100)+"...");
      return jsonwebtoken.sign(payloadToSign, secret, { algorithm: 'HS256' });
    },
    async decode(params: JWTDecodeParams): Promise<JWT | null> {
      const { token: tokenString, secret: decodeSecret } = params;
      console.log(`[Auth][JWT_Decode_Entry] Attempting to decode. Token string provided: ${tokenString ? 'Yes' : 'No'}, Secret provided: ${decodeSecret ? 'Yes' : 'No'}`);
      if (tokenString) console.log(`[Auth][JWT_Decode_Entry] Token string (first 50): ${tokenString.substring(0,50)}...`);
      const secretForLog = typeof decodeSecret === 'string' ? decodeSecret : '[Secret is a Buffer]';
      if (decodeSecret) console.log(`[Auth][JWT_Decode_Entry] Secret (first 10 of string representation): ${secretForLog.substring(0,10)}...`);

      if (!decodeSecret) {
        console.error("[Auth][JWT_Decode_Error] Critical: Secret is missing in decode params.");
        return null;
      }
      if (!tokenString) {
        console.log("[Auth][JWT_Decode_Info] Token string is missing in decode params, returning null.");
        return null;
      }

      try {
        const decoded = jsonwebtoken.verify(tokenString, decodeSecret, { algorithms: ['HS256'] });
        console.log("[Auth][JWT_Decode_Success] Successfully decoded token:", decoded);
        return decoded as JWT;
      } catch (error: unknown) {
        console.error("[Auth][JWT_Decode_Fail] Error during jsonwebtoken.verify:");
        if (error instanceof TokenExpiredError) {
            console.error("[Auth][JWT_Decode_Fail] TokenExpiredError:", error.message, "Expired at:", error.expiredAt);
        } else if (error instanceof JsonWebTokenError) {
            console.error("[Auth][JWT_Decode_Fail] JsonWebTokenError:", error.message);
        } else if (error instanceof Error) {
            console.error("[Auth][JWT_Decode_Fail] Generic Error:", error.name, error.message);
        } else {
            console.error("[Auth][JWT_Decode_Fail] Unknown error object during decode:", error);
        }
        return null;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
      account, // Parameter 'account'
      profile, // Parameter 'profile'
    }: { // Explicitly typing the parameters object
      token: JWT;
      user?: NextAuthUser;
      account?: NextAuthAccountType | null; // Using the aliased NextAuthAccountType
      profile?: NextAuthProfileType | null; // Using the aliased NextAuthProfileType
    }) {
      console.log("[Auth][JWT_Callback_Entry] User:", user ? "Present" : "Absent", "Account:", account ? "Present" : "Absent");

      if (user) {
        console.log("[Auth][JWT_Callback] Initial sign-in, 'user' object present:", user);
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (account && profile && account.provider === 'google') {
        console.log(`[Auth][JWT_Callback] OAuth Google sign-in. Profile email: ${profile.email}`);
        token.email = profile.email ?? token.email;
        token.name = profile.name ?? token.name;
        // Use the GoogleProfile type for 'profile' here to safely access 'picture'
        const googleProfile = profile as GoogleProfile;
        token.picture = googleProfile.picture ?? profile.image ?? token.picture;

        try {
          const backendEnsureUrl = `${process.env.SPRING_BOOT_API_URL}/api/v1/users/ensure-oauth`;
          if (!process.env.SPRING_BOOT_API_URL) throw new Error("Backend API URL not configured for OAuth.");

          const ensureRes = await fetch(backendEnsureUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              providerId: account.provider,
              providerAccountId: account.providerAccountId,
              email: profile.email,
              name: profile.name,
              imageUrl: token.picture,
            }),
          });

          if (!ensureRes.ok) {
            const errorText = await ensureRes.text();
            console.error(`[Auth][JWT_Callback] Backend /ensure-oauth failed (${ensureRes.status}): ${errorText}`);
            throw new Error(`Failed to sync OAuth user: ${errorText}`);
          }

          const backendResult: { userId: string } = await ensureRes.json();
          if (backendResult.userId) {
            token.sub = backendResult.userId;
            token.id = backendResult.userId;
            console.log(`[Auth][JWT_Callback] Synced OAuth user. Internal DB User ID: ${token.sub}`);
          } else {
            console.error("[Auth][JWT_Callback] Backend /ensure-oauth did not return a userId.");
            throw new Error("Backend /ensure-oauth did not return a userId.");
          }
        } catch (error) {
          console.error("[Auth][JWT_Callback] Error calling /ensure-oauth or processing its result:", error);
          throw new Error("Could not sync OAuth user with backend.");
        }
      }
      console.log("[Auth][JWT_Callback] Returning payload for encode (first 100):", JSON.stringify(token).substring(0,100)+"...");
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      console.log("[Auth][Session_Callback] Returning session:", JSON.stringify(session));
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
