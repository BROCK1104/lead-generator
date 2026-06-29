import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { searchDatasetForTitles } from "@/services/quickenrich";
import type { ContactSearchRequest, ContactSearchResponse } from "@/types/contacts";

function cleanWebsite(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactSearchRequest;
    const website = cleanWebsite(body.website || "");
    const titles = Array.from(new Set((body.titles || []).map((title) => title.trim()).filter(Boolean)));

    if (!website) throw new AppError("Enter a company website before searching.", 400, "INVALID_WEBSITE");
    if (!titles.length) throw new AppError("Choose at least one job title.", 400, "NO_TITLES");

    const contacts = await searchDatasetForTitles({ website, titles }, body.apiKey);
    const response: ContactSearchResponse = {
      contacts,
      searchedTitles: titles,
      warnings: contacts.length ? [] : ["No contacts found for this website and title set."]
    };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ message: "Unexpected search failure. Please try again.", code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
