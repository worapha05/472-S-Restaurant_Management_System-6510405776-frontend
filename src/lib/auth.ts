import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import type { NextAuthOptions } from 'next-auth';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/error",
  },
  // Configure session handling
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          console.log(`Attempting to authenticate with email: ${credentials.email}`);
          
          try {
            const response = await api.post("/api/login", {
              email: credentials.email,
              password: credentials.password,
            });

            console.log("API Response status:", response.status);
            console.log("API Response structure:", Object.keys(response.data));

            if (response.status === 200 && response.data) {
              const { token, user } = response.data;
              
              if (!user || !token) {
                console.error("Invalid response format from API:", response.data);
                throw new Error("Invalid response format from authentication API");
              }
              
              console.log("Authentication successful for user:", user.email);
              
              // Return required NextAuth user object with token included
              return {
                id: String(user.id), // Convert to string as NextAuth expects string IDs
                email: user.email,
                name: user.name,
                username: user.username,
                phone_number: user.phone_number,
                role: user.role,
                address: user.address,
                email_verified_at: user.email_verified_at,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at,
                accessToken: token // Store the token for use in API calls
              };
            } else {
              console.error("Authentication failed with status:", response.status);
              throw new Error(`Authentication failed: Server returned ${response.status}`);
            }
          } catch (apiError) {
            if (apiError.response) {
              console.error("API error response:", {
                status: apiError.response.status,
                data: apiError.response.data
              });
              
              // Return specific error messages from the API if available
              if (apiError.response.data?.message) {
                throw new Error(apiError.response.data.message);
              }
            }
            
            // Re-throw the error to be caught by the outer catch
            throw apiError;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          // Important: throw the error rather than returning null
          // This allows NextAuth to properly handle and display the error
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        // Add user data to the token when first signing in
        token.id = String(user.id);
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.phone_number = user.phone_number;
        token.role = user.role;
        token.address = user.address;
        token.accessToken = user.accessToken;
        // You can choose to include other user fields as needed
      }
      return token;
    },
    async session({ session, token }) {
      // Add properties to the session from the token
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.phone_number = token.phone_number as string;
        session.user.role = token.role as string;
        session.user.address = token.address as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

// For compatibility with Pages API
export default NextAuth(authOptions);