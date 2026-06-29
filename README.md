# Polynovea Lead Finder

A production-oriented Next.js 15 dashboard for finding restaurant, cafe, and hospitality decision makers with the QuickEnrich API.

## Features

- Server-side QuickEnrich API calls so production secrets are not exposed in the browser
- Dataset Search across multiple selected job titles with duplicate contact merging
- Typed API wrapper functions for Dataset Search, Employee Search, Phone Search, Reverse Email Lookup, and Contact Finder
- Searchable, sortable, paginated results table
- Has Email and Has Phone filters
- Row selection with copy emails, copy phones, and CSV export
- Export selected contacts only when rows are selected
- Settings page for a local development API key
- Dark mode, recent searches, favorite companies, responsive layout, and keyboard shortcuts

## Installation

Run: npm install

## Environment Variables

Create .env.local from .env.example and set:

QUICKENRICH_API_KEY=your_quickenrich_api_key_here

Do not use NEXT_PUBLIC_ for this value.

## Running Locally

Run: npm run dev

Open http://localhost:3000.

If you do not want to use .env.local during development, open Settings and enter a QuickEnrich API key. The app stores that key in local storage and sends it only to this app server-side route.

## Production Build

Run: npm run build, then npm run start.

Configure QUICKENRICH_API_KEY in your hosting provider server environment variables.

## QuickEnrich Integration

API base URL defaults to https://app.quickenrich.io/api.

The API service lives in services/quickenrich.ts. It centralizes endpoint paths, authentication headers, response normalization, and user-friendly error handling. Dataset Search is currently used by the dashboard; the remaining wrapper functions are ready for future workflows.

Endpoint defaults are based on the QuickEnrich docs at https://app.quickenrich.io/docs. Path environment overrides are available if QuickEnrich changes route names:

- QUICKENRICH_DATASET_SEARCH_PATH defaults to /employees/dataset-search
- QUICKENRICH_EMPLOYEE_SEARCH_PATH defaults to /employees/search
- QUICKENRICH_PHONE_SEARCH_PATH defaults to /employees/phone-search
- QUICKENRICH_REVERSE_EMAIL_PATH defaults to /employees/email-search
- QUICKENRICH_CONTACT_FINDER_PATH defaults to /employees/contact-finder

## Keyboard Shortcuts

- / focuses company website
- Ctrl + Enter or Cmd + Enter searches contacts
- E exports current results

## Future Enhancements

The project is structured for CSV restaurant import, bulk enrichment, lead scoring, CRM integration, outreach workflows, saved searches, search history, and multi-user authentication.
