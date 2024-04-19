import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const response = await supabase.from("runes").select("*");

  const res = await fetch("https://ordinals.com/blockcount");

  let blockCount = 1000000;
  if (res.ok) {
    blockCount = await res.json();
  }
  return NextResponse.json({ ...response, blockCount });
}
