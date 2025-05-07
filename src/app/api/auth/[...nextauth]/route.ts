import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import your configuration
import type { NextRequest } from "next/server"; // Use NextRequest for better typing

// Initialize the main NextAuth handler
const handler = NextAuth(authOptions);

// Explicitly export named async functions for GET and POST
export async function GET(req: NextRequest, { params }: { params: { nextauth: string[] } }) {
  // Pass the request and context (params) to the main NextAuth handler
  // Using 'Request' type for broader compatibility, cast if needed or use specific types if known
  return handler(req as Request, { params });
}

export async function POST(req: NextRequest, { params }: { params: { nextauth: string[] } }) {
  // Pass the request and context (params) to the main NextAuth handler
  return handler(req as Request, { params });
}

// DO NOT use: export { handler as GET, handler as POST };
// DO NOT use: export default handler;