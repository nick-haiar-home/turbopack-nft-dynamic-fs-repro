import { NextResponse } from "next/server";
import { loadStuff } from "../../../lib/loader.js";

// force-dynamic so the route is a real server entry whose deps get traced for
// the standalone output.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ count: loadStuff().length });
}
