import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const response = await supabase.from("runes").select("*");
  return NextResponse.json(response);
}
