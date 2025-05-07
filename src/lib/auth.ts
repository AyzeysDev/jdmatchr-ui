// src/lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // Ensure this is set in .env.local
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Ensure this is set in .env.local
    }),
    // Add CredentialsProvider here later if needed for email/password
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Crucial: Ensure this is set in .env.local
  pages: {
    signIn: "/login", // Redirect here if authentication is required
  },
  callbacks: {
    // Callbacks to customize session/token data (optional but useful)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || token.id as string; // Add user ID to session
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