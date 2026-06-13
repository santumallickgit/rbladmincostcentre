import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rbl-dashboard-secret-key-2026")
const COOKIE_NAME = "session"

export type UserSession = {
  id: string
  username: string
  role: "ADMIN" | "VIEWER"
}

// Hardcoded users for proto
export const HARDCODED_USERS = [
  { id: "1", username: "rbl_admin", password: "12345678", role: "ADMIN" as const },
  { id: "2", username: "rbl_users", password: "1234", role: "VIEWER" as const },
]

export async function createToken(user: Omit<UserSession, "id"> & { id: string }) {
  return new SignJWT({ id: user.id, username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as UserSession
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
