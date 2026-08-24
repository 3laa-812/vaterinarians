import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) return NextResponse.json({ error: "No URL" });

  try {
    const res = await fetch(targetUrl);
    const html = await res.text();
    fs.writeFileSync("/tmp/stitch_extract.html", html);
    return NextResponse.json({ ok: true, htmlLength: html.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
