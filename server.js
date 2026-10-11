
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Allow the frontend to connect to the backend
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Existing test route
app.get("/", (req, res) => {
    res.send("JobGuide backend is running!");
});

// --------------------------------------------------
// EXISTING JOB SEARCH - PRESERVED
// --------------------------------------------------

async function fetchLiveJobs(query) {
    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
        throw new Error(
            "API key is missing. Check backend/.env"
        );
    }

    const url = new URL(
        "https://api.openwebninja.com/jsearch/search-v2"
    );

    url.searchParams.set("query", query);
    url.searchParams.set("country", "in");
    url.searchParams.set("language", "en");
    url.searchParams.set("date_posted", "month");
    url.searchParams.set("num_pages", "1");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "x-api-key": apiKey
        }
    });

    if (!response.ok) {
        const details = await response.text();

        console.error(
            "JSearch API error:",
            response.status,
            details
        );

        throw new Error(
            `External job service returned ${response.status}`
        );
    }

    return response.json();
}

// Keep the original endpoint for standard job search
app.get("/api/jobs", async (req, res) => {
    try {
        const query = String(
            req.query.query ||
            "software developer jobs in India"
        ).trim().slice(0, 200);

        const data = await fetchLiveJobs(query);

        return res.json(data);
    } catch (error) {
        console.error("Job search error:", error.message);

        return res.status(502).json({
            error: error.message
        });
    }
});

// --------------------------------------------------
// SKILL INTELLIGENCE: MULTI-SOURCE MODEL
// --------------------------------------------------

// These are PROTOTYPE reference records, not live feeds.
// Replace or supplement them with verified external sources
// before claiming that they are real-time industry evidence.

const referenceEvidence = [
    {
        skill: "Python",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["aiml", "ai", "ml", "data", "software"],
        reason: "Useful for programming, automation, and AI projects."
    },
    {
        skill: "SQL",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["data", "software", "analytics", "aiml"],
        reason: "Useful for storing, querying, and analysing data."
    },
    {
        skill: "Machine Learning",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["aiml", "ai", "ml", "data"],
        reason: "Useful for building models that learn from data."
    },
    {
        skill: "Git and GitHub",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["software", "web", "aiml", "development"],
        reason: "Useful for version control and collaborative projects."
    },
    {
        skill: "Communication",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["all", "career", "interview"],
        reason: "Useful for teamwork, presentations, and interviews."
    },
    {
        skill: "Data Structures and Algorithms",
        source: "JobGuide skill reference",
        sourceType: "Prototype reference",
        credibility: 0.70,
        updatedAt: "2026-09-20",
        relevanceTags: ["software", "development", "aiml", "coding"],
        reason: "Useful for problem-solving and technical assessments."
    }
];

// Independent evidence is intentionally kept separate.
// These records are synthetic examples for testing disagreement.
// They are NOT actual findings from the named organizations.
const demoEvidence = [
    {
        skill: "Python",
        source: "Demo industry report A",
        sourceType: "Synthetic test evidence",
        credibility: 0.85,
        updatedAt: "2026-10-01",
        relevanceTags: ["aiml", "ai", "software", "data"],
        reason: "Example evidence supporting Python."
    },
    {
        skill: "Python",
        source: "Demo industry report B",
        sourceType: "Synthetic test evidence",
        credibility: 0.80,
        updatedAt: "2026-08-01",
        relevanceTags: ["aiml", "ai", "data"],
        reason: "A second example source supports Python."
    },
    {
        skill: "SQL",
        source: "Demo industry report A",
        sourceType: "Synthetic test evidence",
        credibility: 0.85,
        updatedAt: "2026-09-25",
        relevanceTags: ["data", "analytics", "aiml"],
        reason: "Example evidence supporting SQL."
    },
    {
        skill: "Cloud Computing",
        source: "Demo industry report B",
        sourceType: "Synthetic test evidence",
        credibility: 0.80,
        updatedAt: "2025-01-01",
        relevanceTags: ["software", "development", "cloud"],
        reason: "Older example evidence for cloud skills."
    },
    {
        skill: "Machine Learning",
        source: "Demo industry report A",
        sourceType: "Synthetic test evidence",
        credibility: 0.85,
        updatedAt: "2026-10-03",
        relevanceTags: ["aiml", "ai", "ml", "data"],
        reason: "Example evidence supporting Machine Learning."
    }
];

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

function normalizeSkill(value) {
    const text = String(value || "")
        .trim()
        .toLowerCase();

    const aliases = {
        "ml": "machine learning",
        "machine-learning": "machine learning",
        "js": "javascript",
        "github": "git and github",
        "git": "git and github",
        "dsa": "data structures and algorithms"
    };

    return aliases[text] || text;
}

function freshnessScore(updatedAt) {
    const updated = new Date(updatedAt);

    if (Number.isNaN(updated.getTime())) {
        return 0;
    }

    const ageDays = Math.max(
        0,
        (Date.now() - updated.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Exponential decay: older evidence gets less weight.
    return clamp(Math.exp(-ageDays / 180));
}

function relevanceScore(evidence, profileTerms) {
    if (profileTerms.length === 0) {
        return 0.5;
    }

    const tags = (evidence.relevanceTags || [])
        .map(normalizeSkill);

    const matches = profileTerms.filter(term =>
        tags.some(tag =>
            tag === "all" ||
            tag.includes(term) ||
            term.includes(tag)
        )
    ).length;

    return clamp(matches / profileTerms.length);
}

function getJobSkills(job) {
    const text = [
        job.job_title,
        job.job_description,
        job.job_required_skills,
        job.job_highlights
    ]
        .map(value =>
            typeof value === "string"
                ? value
                : JSON.stringify(value || "")
        )
        .join(" ")
        .toLowerCase();

    const dictionary = [
        "python",
        "sql",
        "machine learning",
        "javascript",
        "java",
        "data analysis",
        "cloud computing",
        "git and github",
        "communication",
        "data structures and algorithms"
    ];

    return dictionary.filter(skill =>
        text.includes(skill)
    );
}

// New endpoint:
// GET /api/skill-intelligence?skills=python,sql&branch=AIML
app.get("/api/skill-intelligence", async (req, res) => {
    try {
        const skillsInput = String(
            req.query.skills || ""
        ).slice(0, 300);

        const interestsInput = String(
            req.query.interests || ""
        ).slice(0, 300);

        const branchInput = String(
            req.query.branch || ""
        ).slice(0, 100);

        const profileTerms = [
            ...skillsInput.split(","),
            ...interestsInput.split(","),
            branchInput
        ]
            .map(normalizeSkill)
            .filter(Boolean)
            .slice(0, 20);

        // Live job evidence is optional for this model:
        // if the job service fails, recommendations can still
        // be returned with a clear source-quality limitation.
        let liveJobs = [];
        let liveSourceStatus = "unavailable";

        if (process.env.JSEARCH_API_KEY) {
            try {
                const queryTerms = [
                    ...skillsInput.split(",").slice(0, 3),
                    branchInput
                ]
                    .map(value => value.trim())
                    .filter(Boolean);

                const query = (
                    queryTerms.join(" ") ||
                    "entry level technology jobs"
                ) + " jobs in India";

                const liveData = await fetchLiveJobs(query);

                liveJobs =
                    liveData.data?.jobs ||
                    liveData.jobs ||
                    liveData.data ||
                    liveData.results ||
                    [];

                if (!Array.isArray(liveJobs)) {
                    liveJobs = [];
                }

                liveSourceStatus = "connected";
            } catch (error) {
                console.error(
                    "Skill model live source:",
                    error.message
                );
            }
        }

        const liveEvidence = [];

        for (const job of liveJobs) {
            if (
                job.job_is_expired === true ||
                job.job_is_expired === "true"
            ) {
                continue;
            }

            const postedAt =
                job.job_posted_at_datetime_utc ||
                job.job_posted_at_timestamp;

            const updatedAt = postedAt
                ? new Date(
                    typeof postedAt === "number"
                        ? postedAt * 1000
                        : postedAt
                ).toISOString().slice(0, 10)
                : null;

            for (const skill of getJobSkills(job)) {
                liveEvidence.push({
                    skill,
                    source:
                        job.employer_name ||
                        "Live job listing",
                    sourceType: "Live job listing",
                    credibility: 0.65,
                    updatedAt,
                    relevanceTags: profileTerms,
                    reason:
                        "Found in a retrieved job listing: " +
                        (job.job_title || "Untitled role")
                });
            }
        }

        const evidence = [
            ...referenceEvidence,
            ...demoEvidence,
            ...liveEvidence
        ];

        const grouped = new Map();

        for (const item of evidence) {
            const key = normalizeSkill(item.skill);

            if (!key) continue;

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }

            grouped.get(key).push(item);
        }

        const recommendations = [];

        for (const [key, records] of grouped.entries()) {
            const uniqueSources = new Set(
                records.map(record => record.source)
            );

            const scoredRecords = records.map(record => {
                const credibility = clamp(
                    record.credibility
                );

                const freshness = record.updatedAt
                    ? freshnessScore(record.updatedAt)
                    : 0;

                const relevance = relevanceScore(
                    record,
                    profileTerms
                );

                return {
                    ...record,
                    credibility,
                    freshness,
                    relevance
                };
            });

            const average = field =>
                scoredRecords.reduce(
                    (sum, item) => sum + item[field],
                    0
                ) / scoredRecords.length;

            const credibility = average("credibility");
            const freshness = average("freshness");
            const relevance = average("relevance");

            // Agreement rises when multiple distinct sources
            // independently mention the same skill.
            const agreement = clamp(
                (uniqueSources.size - 1) / 2
            );

            const score = 100 * (
                0.35 * credibility +
                0.25 * freshness +
                0.25 * relevance +
                0.15 * agreement
            );

            const sources = [...uniqueSources];

            const sourceTypes = [
                ...new Set(
                    records.map(record => record.sourceType)
                )
            ];

            const reasons = [
                `Credibility: ${Math.round(credibility * 100)}%`,
                `Freshness: ${Math.round(freshness * 100)}%`,
                `Profile relevance: ${Math.round(relevance * 100)}%`,
                `Evidence agreement: ${Math.round(agreement * 100)}%`
            ];

            const latestDate = records
                .map(record => record.updatedAt)
                .filter(Boolean)
                .sort()
                .at(-1) || null;

            recommendations.push({
                skill: records[0].skill,
                score: Math.round(score),
                confidence:
                    score >= 70 ? "Higher" :
                    score >= 45 ? "Moderate" : "Lower",
                sourceCount: uniqueSources.size,
                sources,
                sourceTypes,
                latestEvidenceDate: latestDate,
                reasons,
                explanation:
                    `${sources.length} distinct source(s) mention this skill. ` +
                    "Scores are prototype estimates, not verified probabilities.",
                evidence: scoredRecords.map(record => ({
                    source: record.source,
                    sourceType: record.sourceType,
                    credibility: Math.round(
                        record.credibility * 100
                    ),
                    freshness: Math.round(
                        record.freshness * 100
                    ),
                    relevance: Math.round(
                        record.relevance * 100
                    ),
                    updatedAt: record.updatedAt,
                    reason: record.reason
                }))
            });
        }

        recommendations.sort(
            (a, b) => b.score - a.score
        );

        return res.json({
            model: "JobGuide Multi-Source Skill Ranking",
            version: "prototype-1.0",
            weights: {
                credibility: 0.35,
                freshness: 0.25,
                relevance: 0.25,
                independentSourceAgreement: 0.15
            },
            liveJobSourceStatus: liveSourceStatus,
            liveJobEvidenceCount: liveEvidence.length,
            demoEvidenceIncluded: true,
            warning:
                "Some evidence is synthetic demo data. " +
                "Do not treat demo records as real industry research.",
            recommendations: recommendations.slice(0, 10)
        });
    } catch (error) {
        console.error(
            "Skill intelligence error:",
            error.message
        );

        return res.status(500).json({
            error: "Unable to generate skill recommendations."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(
        `JobGuide backend running at http://localhost:${PORT}`
    );
});
