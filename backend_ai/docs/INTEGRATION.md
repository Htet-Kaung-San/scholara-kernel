# Integration Guide

How the Express backend calls the Scholara AI service.

## Setup

1. Add `AI_SERVICE_URL` and `AI_INTERNAL_KEY` to your Express `.env`:

```env
AI_SERVICE_URL=http://localhost:8001
AI_INTERNAL_KEY=change-me-to-a-strong-random-string
```

2. The `AI_INTERNAL_KEY` must match `INTERNAL_API_KEY` in `backend_ai/.env`.

---

## POST /match — Scholarship Matching

Call from Express after the user requests personalized recommendations.

### Express Integration Snippet

```typescript
// backend/src/routes/scholarships.ts (add new route)
import axios from "axios"; // or use fetch

router.get(
  "/recommendations",
  authenticate,
  asyncHandler(async (req, res) => {
    // 1. Get user profile
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
    });

    // 2. Get open scholarships
    const scholarships = await prisma.scholarship.findMany({
      where: { status: "OPEN" },
    });

    // 3. Call AI service
    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-INTERNAL-KEY": process.env.AI_INTERNAL_KEY!,
        },
        body: JSON.stringify({
          user_profile: {
            id: profile.id,
            nationality: profile.nationality,
            residingCountry: profile.country,
            educationLevel: profile.educationLevel,
            interests: profile.interests || [],
            fieldOfStudy: profile.fieldOfStudy,
          },
          scholarships: scholarships.map((s) => ({
            id: s.id,
            title: s.title,
            provider: s.provider,
            country: s.country,
            description: s.description,
            status: s.status,
            level: s.level,
            duration: s.duration,
            deadline: s.deadline?.toISOString().split("T")[0],
            value: s.value,
            fieldOfStudy: s.fieldOfStudy,
            type: s.type,
            eligibility: s.eligibility,
            benefits: s.benefits,
            requirements: s.requirements,
            featured: s.featured,
          })),
          limit: 20,
        }),
      }
    );

    const data = await aiResponse.json();
    res.json({ success: true, data });
  })
);
```

### Example Request

```json
{
  "user_profile": {
    "id": "user-uuid-123",
    "nationality": "Myanmar",
    "residingCountry": "Myanmar",
    "educationLevel": "Bachelor's Degree",
    "interests": ["AI", "Computer Science", "Machine Learning"],
    "fieldOfStudy": "Computer Science"
  },
  "scholarships": [
    {
      "id": "schol-uuid-001",
      "title": "Global Korea Scholarship",
      "provider": "Korean Government",
      "country": "South Korea",
      "description": "Full scholarship for international students...",
      "status": "OPEN",
      "level": "Master's",
      "deadline": "2026-03-15",
      "value": "Full tuition + monthly stipend",
      "fieldOfStudy": "Computer Science, Engineering",
      "type": "GOVERNMENT",
      "eligibility": {
        "nationalities_allowed": [],
        "gpa_min": 3.0
      },
      "benefits": {
        "tuition": "Full coverage",
        "stipend": "$900/month"
      },
      "featured": true
    }
  ],
  "limit": 10
}
```

### Example Response

```json
{
  "matches": [
    {
      "scholarship_id": "schol-uuid-001",
      "score": 85,
      "reasons": [
        "Scholarship is open for applications",
        "33 days until deadline",
        "Your field (Computer Science) matches",
        "Education level matches",
        "Open to all nationalities"
      ],
      "missing_requirements": [],
      "explanation": "The Global Korea Scholarship is a strong match for your profile. As a Computer Science student, you align well with the scholarship's target fields. The program is open to Myanmar nationals and offers full tuition coverage with a monthly stipend.",
      "confidence": 0.78
    }
  ],
  "total_evaluated": 1,
  "profile_completeness": 1.0
}
```

---

## POST /admin/discover — Scholarship Discovery

Call from Express admin routes when an admin wants to discover new scholarships.

### Express Integration Snippet

```typescript
// backend/src/routes/admin.ts (add new route)

router.post(
  "/discover",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { query, degreeLevel, country, year, maxResults } = req.body;

    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/admin/discover`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-INTERNAL-KEY": process.env.AI_INTERNAL_KEY!,
        },
        body: JSON.stringify({
          query,
          degree_level: degreeLevel,
          country,
          year,
          max_results: maxResults || 5,
        }),
      }
    );

    const data = await aiResponse.json();
    res.json({ success: true, data });
  })
);
```

### Example Request

```json
{
  "query": "ASEAN scholarships for masters students",
  "degree_level": "MASTERS",
  "country": "Japan",
  "year": 2026,
  "max_results": 5
}
```

### Example Response

```json
{
  "proposed": [
    {
      "extracted": {
        "name": "MEXT Scholarship",
        "provider": "Japanese Government (MEXT)",
        "official_url": "https://www.mext.go.jp/en/...",
        "source_urls": ["https://www.mext.go.jp/en/..."],
        "deadline": "2026-04-30",
        "deadline_type": "fixed",
        "funding_type": "full",
        "study_levels": ["MASTERS"],
        "field_of_study": null,
        "country": "Japan",
        "duration": "2 years",
        "value": "Full tuition + ¥144,000/month",
        "eligibility": {
          "nationalities_allowed": [],
          "age_min": null,
          "age_max": 35,
          "gpa_min": null,
          "language_requirements": ["Japanese N2 or English proficiency"]
        },
        "benefits": {
          "tuition": "Full coverage",
          "stipend": "¥144,000/month",
          "travel": "Round-trip airfare",
          "other": ["Settling-in allowance"]
        },
        "required_documents": [
          "Transcript",
          "Research proposal",
          "Language certificates",
          "Health certificate"
        ],
        "evidence": [
          {
            "field": "deadline",
            "source_url": "https://www.mext.go.jp/en/...",
            "quote": "Applications must be submitted by April 30, 2026",
            "char_start": 1234,
            "char_end": 1283
          },
          {
            "field": "funding_type",
            "source_url": "https://www.mext.go.jp/en/...",
            "quote": "The scholarship covers tuition fees, monthly stipend, and travel expenses",
            "char_start": 456,
            "char_end": 527
          }
        ],
        "confidence": 0.92,
        "flags": [],
        "description": "The MEXT Scholarship for international students to study in Japan."
      },
      "search_query_used": "ASEAN scholarships for masters students MASTERS Japan 2026 scholarship",
      "discovery_rank": 1,
      "is_duplicate": false,
      "duplicate_of": null
    }
  ],
  "query": "ASEAN scholarships for masters students MASTERS Japan 2026 scholarship",
  "total_urls_searched": 10,
  "total_urls_parsed": 5,
  "errors": [
    "Failed to fetch: https://example.com/broken-link"
  ]
}
```

### Admin Approval Flow

After receiving discovery results, the Express backend should present them in the admin dashboard. When an admin approves a proposal:

```typescript
// When admin clicks "Approve" on a proposed scholarship:
const approved = proposedScholarship.extracted;

const newScholarship = await prisma.scholarship.create({
  data: {
    title: approved.name,
    provider: approved.provider,
    country: approved.country || "International",
    description: approved.description || "",
    status: "DRAFT",  // Admin can change to OPEN after review
    level: approved.study_levels?.[0] || "MASTERS",
    duration: approved.duration,
    deadline: approved.deadline ? new Date(approved.deadline) : null,
    value: approved.value || "See official page",
    fieldOfStudy: approved.field_of_study || "Various",
    type: "GOVERNMENT",  // Admin selects
    eligibility: approved.eligibility,
    benefits: approved.benefits,
    requirements: approved.required_documents,
    featured: false,
    createdById: req.userId,
  },
});
```

---

## Error Handling

All AI service errors return standard HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Success |
| `401` | Invalid or missing `X-INTERNAL-KEY` |
| `422` | Invalid request body (Pydantic validation) |
| `500` | Internal server error |

The Express backend should handle errors gracefully:

```typescript
try {
  const aiResponse = await fetch(`${AI_URL}/match`, { ... });
  if (!aiResponse.ok) {
    console.error("AI service error:", aiResponse.status);
    // Fallback: return scholarships without AI ranking
  }
} catch (error) {
  console.error("AI service unreachable:", error);
  // Fallback: return scholarships without AI ranking
}
```
