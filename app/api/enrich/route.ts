import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { normalizeLinkedInProfileUrl } from "@/lib/linkedin";
import { enrichLinkedInProfile } from "@/services/quickenrich";
import type { LinkedInEnrichRequest, LinkedInEnrichResponse } from "@/types/contacts";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LinkedInEnrichRequest;
    const linkedinUrl = normalizeLinkedInProfileUrl(body.linkedinUrl || "");

    if (!linkedinUrl) {
      throw new AppError("Enter a valid LinkedIn profile URL, for example https://www.linkedin.com/in/person-name.", 400, "INVALID_LINKEDIN_URL");
    }

    const contact = await enrichLinkedInProfile(linkedinUrl, body.apiKey);
    const response: LinkedInEnrichResponse = {
      contact,
      warnings: contact ? [] : ["No enrichment data was found for this LinkedIn profile."]
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected enrichment failure. Please try again.", code: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
