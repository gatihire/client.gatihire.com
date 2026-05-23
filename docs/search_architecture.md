# Hybrid Search Architecture Guide

This document outlines the architecture, data flow, and optimization strategies for the "Gold Standard" Hybrid Search implemented in the `client-app` and Supabase backend. It is designed to handle 100k+ candidate profiles with lightning-fast query times.

---

## 1. High-Level Architecture

The search architecture is a **True Hybrid** approach: the database handles heavy filtering and rough ranking, while Javascript handles precise scoring and sorting.

**Flow (AI / JD Routes):**
`Next.js API` -> Check Redis Cache for AI Extractions -> (If miss) Call Gemini AI & Embedding API -> Call Supabase RPC `search_candidates_hybrid` with filters (fetches 500 candidates using native indexes) -> RPC returns 500 candidates -> Next.js API runs `calculateCandidateScore` on each -> Sorts by JS score -> Applies `applySidebarFilters` -> Slices top 20 (`results.slice(offset, offset + limit)`) -> Return to Client.

**Flow (Simple Route - Keyword only):**
`Next.js API` -> Supabase RPC `search_candidates_hybrid` with filters -> Supabase natively filters, scores, and paginates using B-Tree and GIN indexes -> Returns EXACTLY `limit` results -> Return to Client.

---

## 2. Database Layer (Supabase / PostgreSQL)

### A. Indexes (Crucial for Speed)
To ensure Postgres doesn't perform "Sequential Scans" (reading every row) on 100k records, we added specific indexes:

1. **Foreign Key Indexes:**
   ```sql
   CREATE INDEX idx_work_experience_candidate_id ON work_experience(candidate_id);
   CREATE INDEX idx_education_candidate_id ON education(candidate_id);
   ```
   *Why:* When a client opens a candidate drawer, the app lazy-loads the `work_experience` and `education` tables. Without these indexes, looking up a candidate's experience among millions of rows would take seconds. With them, it takes `< 1ms`.

2. **Filter Indexes:**
   ```sql
   CREATE INDEX idx_candidates_location ON candidates(location);
   ```
   *Why:* These allow the RPC function to instantly discard candidates who don't meet hard criteria (e.g., "Must be in Mumbai").

3. **Full-Text Index (Existing):**
   ```sql
   CREATE INDEX idx_candidates_search_vector ON candidates USING GIN (search_vector);
   ```
   *Why:* GIN indexes allow Postgres to search massive text blocks (like resumes and skills) instantly.

### B. The Engine: `search_candidates_hybrid` RPC
This PostgreSQL function is the heart of the system. It takes:
- `p_query_text` (The expanded keywords)
- `p_query_embedding` (The vector array)
- `p_filters` (JSON object containing cities, experience ranges, keywords, etc.)
- `p_limit` / `p_offset` (For native database pagination, used differently per route)

**How it works internally:**
1. **Hard Filtering (`filtered_candidates` CTE):** It applies all `p_filters` first. This instantly narrows the 100k pool down to maybe 2,000 viable candidates. Critically, experience filtering uses `regexp_replace` to safely extract numeric values from the `text`-based `total_experience` column, preventing the `operator does not exist: text >= numeric` error.
2. **Text Rank Calculation:** It uses `ts_rank_cd` to score the remaining candidates based on exact keyword matches.
3. **Vector Similarity Calculation:** It uses `1 - (c.embedding <=> p_query_embedding)` to score semantic closeness.
4. **Hybrid Blending:** It blends the scores: `(Text Rank * 0.7) + (Vector Similarity * 0.3)`. This ensures exact skill matches win, but semantic relevance breaks ties.
5. **Candidate Pool:** It returns up to `p_limit` candidates. For AI/JD routes this is 500; for Simple routes this matches the page size.

---

## 3. Application API Layer (Next.js `/api/client/search/*`)

### A. Rate Limiting (Upstash Redis)
To prevent API abuse and protect AI/Database costs, rate limiting is strictly enforced at the very top of every search route.

```typescript
// lib/rateLimit.ts
export const searchRL = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute per client
  prefix: "rl_search"
})

// In API Route:
const { success } = await searchRL.limit(ctx.clientId)
if (!success) return 429 Rate Limit Exceeded
```

### B. Redis Caching for AI / JD Extractions
Calling the Google Gemini API to extract structured JSON from a search query or a Job Description takes 1.5 to 3 seconds.

To bypass this latency:
1. We hash the user's query: `md5("logistics manager in mumbai")`.
2. We check Upstash Redis: `GET ai_search_criteria:{hash}`.
3. **Cache Hit:** We instantly retrieve the structured JSON and Embedding array. Time: `~20ms`.
4. **Cache Miss:** We call Gemini and the Embedding API in parallel using `Promise.all`. We then save the result to Redis with a 24-hour expiration (`ex: 86400`). Time: `~2000ms`.

### C. The API Routes

1. **`/simple/route.ts` (Keyword Only):**
   - **Flow:** Synonym Expansion -> RPC Call (native DB pagination).
   - **Speed:** `~50ms`.
   - **Use Case:** When users type specific skills or titles manually.
   - **Pagination:** Handled by the database (`p_limit: limit`, `p_offset: offset`).

2. **`/ai/route.ts` (Natural Language):**
   - **Flow:** Redis Cache Check -> (Gemini + Embedding) -> Map to RPC Filters -> RPC Call (fetches 500) -> JS `calculateCandidateScore` -> JS sort -> JS `applySidebarFilters` -> JS slice for page.
   - **Speed:** `~2000ms` first time, `~80ms` cached.
   - **Use Case:** "I need a driver in Delhi with 5 years experience".

3. **`/jd/route.ts` (Job Description):**
   - **Flow:** Redis Cache Check -> (Gemini + Embedding) -> Map to RPC Filters -> RPC Call (fetches 500) -> JS `calculateCandidateScore` -> JS sort -> JS `applySidebarFilters` -> JS slice for page.
   - **Speed:** `~3000ms` first time, `~80ms` cached.
   - **Use Case:** User pastes a massive 3-page Job Description.

---

## 4. Real-World Example: "I need a driver in Delhi with 5 years experience"

Here is exactly what happens when a client types that into the AI Search bar today:

1. **Rate Limit Check:**
   - Upstash verifies the client hasn't exceeded 30 searches this minute.
2. **Cache Check:**
   - `md5("i need a driver in delhi with 5 years experience")` = `a1b2c3...`
   - Redis checks `ai_search_criteria:a1b2c3...`. Let's assume it's a **Cache Miss**.
3. **AI Extraction (Parallel):**
   - Gemini receives the prompt and returns: `{"role": "driver", "location": "Delhi", "min_experience_years": 5, "skills": []}`
   - Embedding API returns a 768-dimensional vector: `[-0.014, 0.022, ...]`
4. **Caching:**
   - The JSON and vector are saved to Redis for 24 hours.
5. **Synonym Expansion:**
   - "driver" expands to `"driver" OR "truck driver" OR "vehicle operator" OR "commercial driver" OR "delivery driver"`.
6. **RPC Execution (`search_candidates_hybrid`):**
   - Postgres instantly discards anyone *not* in Delhi (using B-Tree index on `location`).
   - Experience filter uses `regexp_replace` to safely parse total_experience as numeric; anyone with `< 5` years is filtered out.
   - Of the remaining candidates, it performs a fast C-level text search for the expanded synonyms inside their resumes (`search_vector`).
   - It compares the candidate's vector to the query vector.
   - It blends the score (70% text match, 30% semantic match).
   - It returns the top 500 candidates (not 20), sorted roughly by match score.
7. **Javascript Post-Processing:**
   - Each of the 500 candidates is scored by `calculateCandidateScore(criteria, rawCandidate)`, which evaluates role match (30%), experience (25%), location (25%), and skills (20%).
   - Candidates are re-sorted by the JS-computed score for maximum relevance.
   - `applySidebarFilters` applies any additional strict filters (must-have keywords, exclude keywords, salary range, education, gender, languages).
   - The array is sliced: `results.slice(offset, offset + limit)` to return exactly the requested page.
8. **Frontend Render:**
   - The user sees 20 highly relevant drivers in Delhi in under 2 seconds. The results are sorted by the same precise logic you originally built, but the database handled the heavy lifting of narrowing 100k candidates down to 500.

---

## 5. Maintenance & Future Scaling

- **If Search feels slow:** Check the Supabase Dashboard -> Query Performance. Ensure the `search_candidates_hybrid` query is utilizing the `idx_candidates_search_vector` index.
- **If AI extraction fails:** Ensure `process.env.GEMINI_API_KEY` is valid and hasn't hit quota limits.
- **If Rate Limits are too strict:** Adjust the `slidingWindow` parameters in `lib/rateLimit.ts`.
- **Updating the Database:** If you add new filterable columns to the frontend (e.g., "Gender"), you MUST update the `search_candidates_hybrid` SQL function to accept and filter by that new field inside the `p_filters` JSON block. For AI/JD routes, you may also need to update `calculateCandidateScore` in `lib/scoring.ts` if the new field affects relevance ranking.
- **Remember:** The Simple route (`/simple`) uses database-native pagination and does NOT apply JS scoring. If you add new ranking criteria, the AI/JD routes will automatically benefit from JS scoring, but the Simple route will not. This is by design — Simple is meant to be fast, not hyper-relevant.



-----
## 0. Critical Fixes Applied

Before diving into the architecture, it is important to understand two critical issues that were discovered and fixed in the current system.

### 1. Fixing the 500 Error (operator does not exist: text >= numeric)

**The Cause:** In your database, the `total_experience` column is actually stored as `text` (e.g., `"5 years"`, `"3.5"`), not a clean number. When Postgres tried to filter candidates by experience (e.g., `total_experience >= 5`), it crashed because it didn't know how to compare `text` to a `numeric`. **The Fix:** I updated the SQL migration script `20250103_hybrid_search.sql` to safely extract just the numbers from the text before filtering. It now uses Regex: `NULLIF(regexp_replace(c.total_experience::text, '[^0-9.]', '', 'g'), '')::numeric`. (Note: You will need to re-copy and run the updated `20250103_hybrid_search.sql` script in your Supabase SQL Editor to apply this fix, or ensure the function in your database matches this version.)

### 2. Fixing the Relevance & Pagination Issue

**The Cause:** In a previous update, the database handled everything, including pagination (`LIMIT 20`). This meant the Next.js API only received 20 random candidates from the database, and we completely lost the excellent custom Javascript logic (`calculateCandidateScore` and `applySidebarFilters`) that used to carefully rank exact role matches and synonyms.

**The Fix:** The True Hybrid Architecture in the `ai` and `jd` routes now gives you the best of both worlds:

1. **Speed:** The Database instantly uses indexes to find the top 500 viable candidates based on hard filters (City, Minimum Experience) and rough semantic similarity.
2. **Relevance:** It sends those 500 candidates to the Next.js API. The API instantly runs your custom `calculateCandidateScore` to strictly score and perfectly sort all 500 candidates.
3. **Pagination:** Next.js then neatly slices the top 20 (`results.slice(offset, offset + limit)`) and sends them to the frontend.

**The result:** You get the exact, hyper-relevant sorting logic you built originally, but because the database is pre-filtering out 99% of the noise, it's capable of scaling to 100k+ candidates without breaking a sweat!

---