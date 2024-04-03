import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { createClient } from "@/utils/supabase/server";

async function fetchAndParseHTML() {
  const response = await fetch("http://54.160.80.123:8181/runes");
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const runes: any = [];
  const links = document.querySelectorAll("ul li a");
  links.forEach((link: any) => {
    if (link.href.startsWith("/rune/")) {
      const runeName = link.href.substring(6);
      runes.push(runeName);
    }
  });

  return runes;
}

async function parseRuneDetails(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const details = {};

  // Extract the <title> content
  const title = document.querySelector("title")?.textContent?.trim();
  if (title) {
    // @ts-ignore
    details["title"] = title.split("Rune ")[1];
  }

  const dtElements = document.querySelectorAll("dl dt");
  dtElements.forEach((dt) => {
    const dd = dt.nextElementSibling;
    let key: any = dt?.textContent?.trim();
    let value: any = dd ? dd?.textContent?.trim() : "";

    if (dd && dd.querySelector("time")) {
      value = dd.querySelector("time")?.textContent?.trim();
    } else if (dd && dd.querySelector("dl")) {
      value = {};
      const nestedDts = dd.querySelectorAll("dt");
      nestedDts.forEach((nestedDt) => {
        const nestedDd = nestedDt.nextElementSibling;
        let nestedKey: any = nestedDt.textContent?.trim();
        let nestedValue = nestedDd ? nestedDd.textContent?.trim() : "";
        value[nestedKey] = nestedValue;
      });
    }

    // Apply numeric extraction for specific keys
    if (["amount", "supply", "premine", "burned"].includes(key)) {
      const match = value.match(/\d+\.?\d*/);
      value = match ? match[0] : "";
    }

    if (key === "number") value = parseInt(value);

    // @ts-ignore
    details[key] = value;
  });

  return details;
}

// Function to modify keys by replacing spaces with underscores
function modifyKeysAndDropMint(details: any) {
  // Use Object.entries to iterate over the object, then reduce to transform it
  return Object.entries(details).reduce((acc, [key, value]) => {
    // Replace spaces with underscores in the key
    const modifiedKey = key.replace(/\s+/g, "_");
    // Exclude the 'mint' key from the result
    if (modifiedKey !== "mint") {
      // @ts-ignore
      acc[modifiedKey] = value;
    }
    return acc;
  }, {});
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const runes = await fetchAndParseHTML();
  const allDetailsPromises = runes.map((rune: string) =>
    parseRuneDetails(`http://54.160.80.123:8181/rune/${rune}`)
  );

  const allDetails = await Promise.all(allDetailsPromises);
  const formattedData = allDetails.map((detail) =>
    modifyKeysAndDropMint(detail)
  );

  // Insert modified rune details into the Supabase table
  const response = await supabase.from("runes").upsert(formattedData);

  console.log({ response });
  return NextResponse.json(formattedData);
}
