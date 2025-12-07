import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const token = searchParams.get("token");
  const to = searchParams.get("to") || "/settings/security";
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  const res = NextResponse.redirect(new URL(to, req.url));
  // dev cookie (httpOnly)
  res.cookies.set("tawawunak_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return res;
}


