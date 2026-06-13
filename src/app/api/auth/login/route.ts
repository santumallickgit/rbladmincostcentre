import { NextResponse } from "next/server"
import { HARDCODED_USERS, createToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const user = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password
    )
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createToken({ id: user.id, username: user.username, role: user.role })
    const res = NextResponse.json({ success: true, role: user.role })

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("Login error:", msg, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
