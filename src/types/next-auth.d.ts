// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      username: string
      phone_number: string
      role: string
      address: string
      email_verified_at: string
      created_at: string
      updated_at: string
      deleted_at: string | null
      accessToken: string
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string
    username: string
    phone_number: string
    role: string
    address: string
    email_verified_at: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  /** Extend the built-in JWT types */
  interface JWT {
    id: string
    username: string
    phone_number: string
    role: string
    address: string
    accessToken: string
  }
}