// src/types/next-auth.d.ts

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      // You can add other custom properties here if needed, like role
      // role?: string;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
  }

  /** Extends the default User type */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Keeping this structure for potential future extensions
  interface User extends DefaultUser {
    // Add properties returned by your adapter or authorize function
    // id: string; // DefaultUser already includes id
    // role?: string;
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string;
    /** User ID */
    id?: string; // Or use `sub` which is the default JWT subject (usually user id)
    // Add other custom properties you might add in the jwt callback
    // role?: string;
    // accessToken?: string;
  }
}

