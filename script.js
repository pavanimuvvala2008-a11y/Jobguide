
"use strict";

/* =====================================================
   JOBGUIDE
   Slide Navigation + Live Jobs + Skill Intelligence
   ===================================================== */

const API_URL = "http://localhost:3000/api/jobs";
const SKILL_INTELLIGENCE_URL =
    "http://localhost:3000/api/skill-intelligence";

const PROFILE_KEY = "jobguide_profile";
const SAVED_KEY = "jobguide_saved_jobs";

const $ = (id) => document.getElementById(id);

const profileForm = $("profileForm");
const jobList = $("jobList");
const resultFilter = $("resultFilter");
const keywordFilter = $("keywordFilter");

let currentProfile = null;
let currentJobs = [];
let usingDemoJobs = false;
let showingSavedOnly = false;
let isSearching = false;
let currentSlide = 0;

const profileSlides = Array.from(
    document.querySelectorAll(".form-slide")
);

/* =====================================================
   SAMPLE OPPORTUNITIES
   These are examples, NOT verified vacancies.
   ===================================================== */

const DEMO_JOBS = [
    {
        job_id: "demo-1",
        job_title: "Python Developer Intern",
        employer_name: "Example Technologies",
        job_city: "India",
        job_employment_type: "Internship",
        job_description:
            "Example role for learning Python, APIs, debugging and software development.",
        job_apply_link: "https://www.linkedin.com/jobs/",
        job_is_demo: true
    },
    {
        job_id: "demo-2",
        job_title: "Junior Software Developer",
        employer_name: "Sample Software",
        job_city: "India",
        job_employment_type: "Full-time",
        job_description:
            "Example role involving programming, Git, databases and software projects.",
        job_apply_link: "https://www.naukri.com/",
        job_is_demo: true
    },
    {
        job_id: "demo-3",
        job_title: "AI and Machine Learning Intern",
        employer_name: "Example AI Labs",
        job_city: "India",
        job_employment_type: "Internship",
        job_description:
            "Example role for learning Python, machine learning and data analysis.",
        job_apply_link: "https://www.linkedin.com/jobs/",
        job_is_demo: true
    }
];

/* =====================================================
   SKILL REFERENCE
   Curated examples, not a live external feed.
   ===================================================== */

const SKILL_REFERENCE = [
    {
        skill: "Python",
        keywords: ["python", "django", "flask", "pandas"],
        fields: ["aiml", "computer science", "software", "data"],
        roles: ["developer", "software", "machine learning", "data analyst"]
    },
    {
        skill: "SQL",
        keywords: ["sql", "mysql", "postgresql", "database"],
        fields: ["aiml", "computer science", "software", "data"],
        roles: ["data analyst", "developer", "database", "business analyst"]
    },
    {
        skill: "Git and GitHub",
        keywords: ["git", "github", "version control"],
        fields: ["aiml", "computer science", "software", "information technology"],
        roles: ["developer", "software", "engineer", "programmer"]
    },
    {
        skill: "Machine Learning",
        keywords: ["machine learning", "scikit-learn", "ml model"],
        fields: ["aiml", "artificial intelligence", "data science"],
        roles: ["machine learning", "ai engineer", "data scientist"]
    },
    {
        skill: "Data Analysis",
        keywords: ["data analysis", "excel", "power bi", "tableau"],
        fields: ["aiml", "data science", "computer science"],
        roles: ["data analyst", "business analyst", "data scientist"]
    },
    {
        skill: "JavaScript",
        keywords: ["javascript", "react", "node.js", "frontend"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["web developer", "frontend", "full stack", "software developer"]
    },
    {
        skill: "HTML and CSS",
        keywords: ["html", "css", "responsive design"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["web developer", "frontend", "ui developer"]
    },
    {
        skill: "REST APIs",
        keywords: ["api", "rest api", "backend", "http"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["backend", "developer", "software engineer", "full stack"]
    },
    {
        skill: "Communication",
        keywords: ["communication", "presentation", "teamwork", "collaboration"],
        fields: ["all"],
        roles: ["intern", "trainee", "graduate", "analyst", "engineer"]
    },
    {
        skill: "Testing and Debugging",
        keywords: ["testing", "debugging", "quality assurance", "test automation"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["tester", "qa", "software", "developer"]
    },
    {
        skill: "Cloud Fundamentals",
        keywords: ["cloud", "aws", "azure", "google cloud"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["cloud", "devops", "software engineer", "developer"]
    },
    {
        skill: "Data Structures and Algorithms",
        keywords: ["data structures", "algorithms", "dsa", "problem solving"],
        fields: ["computer science", "software", "information technology", "aiml"],
        roles: ["software engineer", "developer", "programmer"]
    }
];

/* =====================================================
   SLIDE NAVIGATION
   ===================================================== */

function updateSlide() {
    profileSlides.forEach((slide, index) => {
        const isActive = index === currentSlide;

        slide.hidden = !isActive;
        slide.classList.toggle("active", isActive);
    });

    const headings = [
        {
            step: "YOUR PROFILE",
            title: "Let's get to know you",
            description: "Tell us about your education.",
            icon: "👤"
        },
        {
            step: "YOUR SKILLS",
            title: "Skills & Interests",
            description: "Tell us what you know and enjoy.",
            icon: "🧠"
        },
        {
            step: "YOUR PREFERENCES",
            title: "Find your direction",
            description: "Choose the opportunities you want.",
            icon: "🎯"
        }
    ];

    const info = headings[currentSlide];

    if (info) {
        if ($("slideStepLabel")) {
            $("slideStepLabel").textContent =
                `STEP 0${currentSlide + 1} OF 03`;
        }

        if ($("slideHeading")) {
            $("slideHeading").textContent = info.title;
        }

        if ($("slideDescription")) {
            $("slideDescription").textContent = info.description;
        }

        if ($("slideIcon")) {
            $("slideIcon").textContent = info.icon;
        }
    }

    const progressFill = $("progressFill");

    if (progressFill) {
        progressFill.style.width =
            `${((currentSlide + 1) / profileSlides.length) * 100}%`;
    }

    const progressText = $("progressText");

    if (progressText) {
        progressText.textContent =
            `Step ${currentSlide + 1} of ${profileSlides.length}`;
    }

    const profilePanel = $("profile");

    if (profilePanel) {
        profilePanel.classList.add("active");
        profilePanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function showWelcome() {
    const welcome = $("welcomeSlide");
    const profilePanel = $("profile");

    if (welcome) {
        welcome.classList.add("active");
    }

    if (profilePanel) {
        profilePanel.classList.remove("active");
    }

    if ($("skillIntelligence")) {
        $("skillIntelligence").classList.remove("active");
    }

    if ($("opportunities")) {
        $("opportunities").classList.remove("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function startProfile() {
    const welcome = $("welcomeSlide");

    if (welcome) {
        welcome.classList.remove("active");
    }

    currentSlide = 0;
    updateSlide();
}

function validateCurrentSlide() {
    const slide = profileSlides[currentSlide];

    if (!slide) return true;

    const fields = Array.from(
        slide.querySelectorAll("input, select, textarea")
    );

    for (const field of fields) {
        if (!field.checkValidity()) {
            field.reportValidity();
            field.focus();
            return false;
        }
    }

    return true;
}

function goToNextSlide() {
    if (!validateCurrentSlide()) return;

    if (currentSlide < profileSlides.length - 1) {
        currentSlide++;
        updateSlide();
    }
}

function goToPreviousSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlide();
    } else {
        showWelcome();
    }
}

if ($("startProfileButton")) {
    $("startProfileButton").addEventListener(
        "click",
        startProfile
    );
}

if ($("backToWelcomeButton")) {
    $("backToWelcomeButton").addEventListener(
        "click",
        showWelcome
    );
}

document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", goToNextSlide);
});

document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
        const previousIndex = Number(button.dataset.back);

        if (Number.isInteger(previousIndex) && previousIndex >= 0) {
            currentSlide = previousIndex;
            updateSlide();
        }
    });
});

/* =====================================================
   LOCAL STORAGE
   ===================================================== */

function readSavedJobs() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(SAVED_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.warn("Could not read saved jobs.", error);
        return [];
    }
}

function saveSavedJobs(jobs) {
    try {
        localStorage.setItem(
            SAVED_KEY,
            JSON.stringify(jobs)
        );
    } catch (error) {
        console.warn("Could not save jobs.", error);
    }

    updateSavedCount();
}

function updateSavedCount() {
    const button = $("savedButton");

    if (!button) return;

    button.textContent = showingSavedOnly
        ? "← All opportunities"
        : `♡ Saved ${readSavedJobs().length}`;
}

/* =====================================================
   STATUS MESSAGE
   ===================================================== */

function setStatus(message, type = "") {
    const status = $("statusMessage");

    if (!status) {
        console.log(message);
        return;
    }

    status.textContent = message;
    status.className = "status-message";

    if (type) {
        status.classList.add(type);
    }
}

/* =====================================================
   PROFILE
   ===================================================== */

function readProfile() {
    if (!profileForm) return null;

    const formData = new FormData(profileForm);

    const getValue = (name) =>
        String(formData.get(name) || "").trim();

    const getList = (name) =>
        getValue(name)
            .split(/[,;\n]/)
            .map((item) => item.trim())
            .filter(Boolean);

    return {
        name: getValue("name"),
        degree: getValue("degree"),
        branch: getValue("branch"),
        graduationYear: getValue("graduationYear"),
        skills: getList("skills"),
        interests: getList("interests"),
        location: getValue("location"),
        type: getValue("type") || "all"
    };
}

function restoreSavedProfile() {
    try {
        const savedProfile = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "null"
        );

        if (!savedProfile || !profileForm) return;

        for (const [key, value] of Object.entries(savedProfile)) {
            const field = profileForm.elements.namedItem(key);

            if (field && typeof value === "string") {
                field.value = value;
            } else if (
                field &&
                Array.isArray(value)
            ) {
                field.value = value.join(", ");
            }
        }
    } catch (error) {
        console.warn("Could not restore profile.", error);
    }
}

/* =====================================================
   NORMALIZE JOB DATA
   ===================================================== */

function normalizeJob(job, index = 0) {
    const title =
        job.job_title ||
        job.title ||
        job.position ||
        "Opportunity";

    const company =
        job.employer_name ||
        job.company_name ||
        job.company ||
        "Company not specified";

    const applyLink =
        job.job_apply_link ||
        job.apply_link ||
        job.url ||
        "";

    return {
        ...job,
        id: String(
            job.job_id ||
            job.id ||
            `${title}-${company}-${index}`
        ),
        job_id: job.job_id || job.id || `${title}-${index}`,
        job_title: title,
        employer_name: company,
        job_city:
            job.job_city ||
            job.job_location ||
            job.location ||
            "Location not specified",
        job_employment_type:
            job.job_employment_type ||
            job.employment_type ||
            job.type ||
            "Not specified",
        job_description:
            job.job_description ||
            job.description ||
            "No description provided.",
        job_apply_link: applyLink,
        job_posted_at:
            job.job_posted_at_datetime_utc ||
            job.job_posted_at ||
            job.posted_at ||
            job.date_posted ||
            job.publication_date ||
            "",
        job_is_expired: Boolean(job.job_is_expired),
        job_is_demo: Boolean(job.job_is_demo)
    };
}

/* =====================================================
   PROFILE MATCH SCORE
   ===================================================== */

function calculateMatch(job) {
    if (!currentProfile) return 0;

    const jobText = [
        job.job_title,
        job.employer_name,
        job.job_description,
        job.job_employment_type,
        job.job_city
    ].join(" ").toLowerCase();

    const terms = [
        ...(currentProfile.skills || []),
        ...(currentProfile.interests || []),
        currentProfile.branch
    ]
        .filter(Boolean)
        .map((term) => term.toLowerCase());

    if (!terms.length) return 0;

    const matched = terms.filter((term) =>
        jobText.includes(term)
    ).length;

    return Math.min(
        100,
        Math.round((matched / terms.length) * 100)
    );
}

/* =====================================================
   FILTER OPPORTUNITIES
   ===================================================== */

function getVisibleJobs() {
    let jobs = showingSavedOnly
        ? currentJobs.filter((job) =>
            readSavedJobs().some((saved) => saved.id === job.id)
        )
        : [...currentJobs];

    const type = resultFilter?.value || "all";

    const keyword = (
        keywordFilter?.value || ""
    ).trim().toLowerCase();

    if (type !== "all") {
        jobs = jobs.filter((job) => {
            const jobType = String(
                job.job_employment_type || ""
            ).toLowerCase();

            if (type === "internships") {
                return jobType.includes("intern");
            }

            if (type === "jobs") {
                return !jobType.includes("intern");
            }

            return true;
        });
    }

    if (keyword) {
        jobs = jobs.filter((job) =>
            [
                job.job_title,
                job.employer_name,
                job.job_city,
                job.job_description,
                job.job_employment_type
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }

    return jobs;
}

/* =====================================================
   RENDER OPPORTUNITIES
   ===================================================== */

function renderJobs() {
    if (!jobList) return;

    const jobs = getVisibleJobs();

    const savedIds = new Set(
        readSavedJobs().map((job) => job.id)
    );

    jobList.replaceChildren();

    if (jobs.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-state";

        message.textContent = showingSavedOnly
            ? "You haven't saved any opportunities yet."
            : "No opportunities found. Try different skills, keywords or filters.";

        jobList.appendChild(message);
        return;
    }

    jobs.forEach((job) => {
        const card = document.createElement("article");
        card.className = "job-card";

        const top = document.createElement("div");
        top.className = "card-top";

        const badge = document.createElement("span");
        badge.className = job.job_is_demo
            ? "pill demo"
            : "pill live";

        badge.textContent = job.job_is_demo
            ? "SAMPLE"
            : "JOB LISTING";

        const match = document.createElement("span");
        match.className = "match-score";
        match.textContent = `${calculateMatch(job)}% match`;

        top.append(badge, match);

        const title = document.createElement("h3");
        title.textContent = job.job_title;

        const company = document.createElement("p");
        company.className = "company";
        company.textContent = job.employer_name;

        const meta = document.createElement("div");
        meta.className = "job-meta";

        const location = document.createElement("span");
        location.textContent = `📍 ${job.job_city}`;

        const type = document.createElement("span");
        type.textContent = `💼 ${job.job_employment_type}`;

        meta.append(location, type);

        const description = document.createElement("p");
        description.className = "job-description";
        description.textContent = job.job_description;

        card.append(top, title, company, meta, description);

        if (job.job_posted_at) {
            const posted = document.createElement("p");
            posted.className = "footnote";
            posted.textContent = `Posted: ${job.job_posted_at}`;
            card.appendChild(posted);
        }

        if (job.job_is_demo) {
            const notice = document.createElement("p");
            notice.className = "footnote";
            notice.textContent =
                "Sample only — this is not a verified live vacancy.";
            card.appendChild(notice);
        }

        const actions = document.createElement("div");
        actions.className = "job-actions";

        if (
            job.job_apply_link &&
            /^https?:\/\//i.test(job.job_apply_link)
        ) {
            const link = document.createElement("a");
            link.className = "apply-link";
            link.href = job.job_apply_link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View / Apply";
            actions.appendChild(link);
        } else {
            const noLink = document.createElement("span");
            noLink.className = "apply-link";
            noLink.textContent = "No application link";
            actions.appendChild(noLink);
        }

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "save-button";
        saveButton.dataset.saveId = job.id;

        const isSaved = savedIds.has(job.id);

        saveButton.classList.toggle("saved", isSaved);
        saveButton.textContent = isSaved ? "♥ Saved" : "♡ Save";

        actions.appendChild(saveButton);
        card.appendChild(actions);
        jobList.appendChild(card);
    });
}

/* =====================================================
   LOCAL SKILL RECOMMENDATIONS
   ===================================================== */

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function getJobText(job) {
    return [
        job.job_title,
        job.employer_name,
        job.job_description,
        job.job_employment_type
    ].join(" ").toLowerCase();
}

function buildSkillRecommendations() {
    if (!currentProfile) return [];

    const profileText = [
        currentProfile.branch,
        ...(currentProfile.skills || []),
        ...(currentProfile.interests || [])
    ].join(" ").toLowerCase();

    const knownSkills = (currentProfile.skills || [])
        .map(normalizeText);

    const jobText = currentJobs
        .filter((job) => !job.job_is_demo)
        .map(getJobText)
        .join(" ");

    return SKILL_REFERENCE.map((item) => {
        const alreadyKnown = knownSkills.some((skill) =>
            item.keywords.some((keyword) =>
                skill.includes(keyword) ||
                keyword.includes(skill)
            )
        );

        const fieldMatch =
            item.fields.includes("all") ||
            item.fields.some((field) =>
                profileText.includes(field)
            );

        const roleMatch = item.roles.some((role) =>
            profileText.includes(role)
        );

        const profileKeywordMatch = item.keywords.some(
            (keyword) => profileText.includes(keyword)
        );

        const liveEvidence = item.keywords.some(
            (keyword) => jobText.includes(keyword)
        );

        const credibility = 70;
        const freshness = liveEvidence ? 85 : 45;

        const relevance = Math.min(
            100,
            (fieldMatch ? 50 : 0) +
            (roleMatch ? 25 : 0) +
            (profileKeywordMatch ? 25 : 0)
        );

        const agreement = liveEvidence ? 80 : 40;

        const score = Math.round(
            credibility * 0.35 +
            freshness * 0.25 +
            relevance * 0.25 +
            agreement * 0.15
        );

        let reason =
            "Related to your study branch or career interests.";

        if (liveEvidence) {
            reason =
                "Related to keywords found in live job-service results.";
        } else if (fieldMatch) {
            reason =
                "Related to your study branch; live job evidence has not confirmed this recommendation.";
        }

        return {
            ...item,
            score,
            credibility,
            freshness,
            relevance,
            agreement,
            alreadyKnown,
            liveEvidence,
            reason
        };
    })
        .filter((item) => item.relevance > 0)
        .sort((a, b) => b.score - a.score);
}

function createEvidenceLine(label, value) {
    const line = document.createElement("p");
    line.style.margin = "5px 0";
    line.style.fontSize = "0.9rem";
    line.textContent = `${label}: ${value}`;
    return line;
}

function renderSkillRecommendations() {
    const container = $("skillRecommendations");
    const summary = $("skillSummary");

    if (!container) return;

    container.replaceChildren();

    if (!currentProfile) {
        if (summary) {
            summary.textContent =
                "Complete your profile to receive skill recommendations.";
        }

        return;
    }

    const recommendations = buildSkillRecommendations();

    if (summary) {
        summary.textContent =
            "Prototype ranking uses credibility, freshness, profile relevance and source agreement. Scores rank available evidence; they are not probabilities. " +
            (usingDemoJobs
                ? "Sample opportunities are shown, so live job evidence is limited."
                : "Recommendations use a curated skill reference and available job-service evidence.");
    }

    if (!recommendations.length) {
        const message = document.createElement("p");
        message.textContent =
            "No skill recommendations yet. Add skills or interests to your profile.";

        container.appendChild(message);
        return;
    }

    recommendations.slice(0, 8).forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "job-card";

        const heading = document.createElement("h3");
        heading.textContent =
            `${index + 1}. ${item.skill}` +
            (item.alreadyKnown ? " — Already in your profile" : "");

        const score = document.createElement("p");
        score.style.fontWeight = "700";
        score.textContent = `Evidence score: ${item.score}/100`;

        const track = document.createElement("div");
        track.style.width = "100%";
        track.style.height = "8px";
        track.style.borderRadius = "6px";
        track.style.background = "#293550";
        track.style.overflow = "hidden";

        const fill = document.createElement("div");
        fill.style.width = `${item.score}%`;
        fill.style.height = "100%";
        fill.style.background = "#8b7cff";

        track.appendChild(fill);

        card.append(
            heading,
            score,
            track,
            createEvidenceLine("Why suggested", item.reason),
            createEvidenceLine("Credibility", `${item.credibility}/100`),
            createEvidenceLine("Freshness", `${item.freshness}/100`),
            createEvidenceLine("Profile relevance", `${item.relevance}/100`),
            createEvidenceLine("Source agreement", `${item.agreement}/100`)
        );

        container.appendChild(card);
    });
}

/* =====================================================
   BACKEND SKILL INTELLIGENCE
   ===================================================== */

async function fetchSkillIntelligence() {
    if (!currentProfile) return;

    const container = $("skillRecommendations");
    const summary = $("skillSummary");

    if (!container) return;

    const params = new URLSearchParams({
        skills: (currentProfile.skills || []).join(","),
        interests: (currentProfile.interests || []).join(","),
        branch: currentProfile.branch || ""
    });

    try {
        const response = await fetch(
            `${SKILL_INTELLIGENCE_URL}?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(
                `Skill service returned status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data.recommendations)) {
            throw new Error("Unexpected skill service response.");
        }

        if (!data.recommendations.length) {
            renderSkillRecommendations();
            return;
        }

        container.replaceChildren();

        if (summary) {
            summary.textContent =
                `${data.model || "JobGuide Skill Intelligence"}. ` +
                "Scores are rankings based on available evidence, not probabilities. " +
                (data.warning || "");
        }

        data.recommendations.slice(0, 8).forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "job-card";

            const heading = document.createElement("h3");
            heading.textContent =
                `${index + 1}. ${item.skill || "Suggested skill"}`;

            const score = document.createElement("p");
            score.textContent =
                `Evidence score: ${item.score ?? "N/A"}/100`;

            const reason = document.createElement("p");
            reason.textContent =
                `Why suggested: ${item.reason || "Based on available evidence."}`;

            const sources = document.createElement("p");
            sources.textContent =
                "Evidence sources: " +
                (
                    Array.isArray(item.sources) && item.sources.length
                        ? item.sources.join(" + ")
                        : "Source details not provided"
                );

            card.append(heading, score, reason, sources);
            container.appendChild(card);
        });
    } catch (error) {
        console.warn("Skill intelligence service unavailable:", error);

        renderSkillRecommendations();

        if (summary) {
            summary.textContent =
                "The backend skill service could not be reached. Showing local prototype recommendations instead.";
        }
    }
}

/* =====================================================
   SHOW JOB RESULTS
   ===================================================== */

function showResultsSections() {
    const welcome = $("welcomeSlide");
    const profilePanel = $("profile");
    const skillsPanel = $("skillIntelligence");
    const opportunities = $("opportunities");

    if (welcome) welcome.classList.remove("active");
    if (profilePanel) profilePanel.classList.remove("active");
    if (skillsPanel) skillsPanel.classList.add("active");
    if (opportunities) opportunities.classList.add("active");
}

/* =====================================================
   LIVE JOB SEARCH
   ===================================================== */

async function fetchLiveJobs() {
    if (!currentProfile) {
        setStatus("Please complete your profile first.", "error");
        return;
    }

    if (isSearching) return;

    isSearching = true;

    const refreshButton = $("refreshButton");

    if (refreshButton) {
        refreshButton.disabled = true;
    }

    const searchTerms = [
        ...(currentProfile.interests || []),
        ...(currentProfile.skills || []).slice(0, 3)
    ];

    const query = searchTerms.length
        ? `${searchTerms.join(" ")} jobs in India`
        : `${currentProfile.branch || "software developer"} jobs in India`;

    const params = new URLSearchParams({
        query,
        location: currentProfile.location || "India"
    });

    setStatus("Searching for live opportunities...");

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(
                `Job service returned status ${response.status}.`
            );
        }

        const data = await response.json();

        const rawJobs = Array.isArray(data)
            ? data
            : Array.isArray(data.data?.jobs)
                ? data.data.jobs
                : Array.isArray(data.jobs)
                    ? data.jobs
                    : Array.isArray(data.data?.results)
                        ? data.data.results
                        : Array.isArray(data.data)
                            ? data.data
                            : Array.isArray(data.results)
                                ? data.results
                                : Array.isArray(data.opportunities)
                                    ? data.opportunities
                                    : [];

        const validJobs = rawJobs.filter((job) => {
            const applyLink =
                job.job_apply_link ||
                job.apply_link ||
                job.url ||
                "";

            const hasValidLink =
                !applyLink || /^https?:\/\//i.test(applyLink);

            return !job.job_is_expired && hasValidLink;
        });

        if (validJobs.length === 0) {
            currentJobs = DEMO_JOBS.map(normalizeJob);
            usingDemoJobs = true;
            showingSavedOnly = false;

            updateSavedCount();
            renderJobs();
            renderSkillRecommendations();
            await fetchSkillIntelligence();

            setStatus(
                "The live service returned no usable jobs for this search. Sample opportunities are shown instead; they are not verified vacancies.",
                "error"
            );

            return;
        }

        currentJobs = validJobs.map(normalizeJob);
        usingDemoJobs = false;
        showingSavedOnly = false;

        updateSavedCount();
        renderJobs();
        renderSkillRecommendations();
        await fetchSkillIntelligence();

        setStatus(
            `Loaded ${currentJobs.length} opportunities from the live job service.`,
            "success"
        );
    } catch (error) {
        console.error("Live job search error:", error);

        currentJobs = DEMO_JOBS.map(normalizeJob);
        usingDemoJobs = true;
        showingSavedOnly = false;

        updateSavedCount();
        renderJobs();
        renderSkillRecommendations();

        setStatus(
            "Could not load live jobs. Sample opportunities are shown instead. Check that your backend is running.",
            "error"
        );
    } finally {
        isSearching = false;

        if (refreshButton) {
            refreshButton.disabled = false;
        }
    }
}

/* =====================================================
   SAVE / UNSAVE OPPORTUNITIES
   ===================================================== */

function handleSaveButtonClick(event) {
    const button = event.target.closest("[data-save-id]");

    if (!button) return;

    const id = button.dataset.saveId;
    const saved = readSavedJobs();

    const existingIndex = saved.findIndex(
        (job) => job.id === id
    );

    if (existingIndex >= 0) {
        saved.splice(existingIndex, 1);
    } else {
        const job = currentJobs.find(
            (item) => item.id === id
        );

        if (job) {
            saved.push({
                id: job.id,
                job_title: job.job_title,
                employer_name: job.employer_name,
                job_city: job.job_city,
                job_employment_type: job.job_employment_type,
                job_description: job.job_description,
                job_apply_link: job.job_apply_link,
                job_is_demo: job.job_is_demo
            });
        }
    }

    saveSavedJobs(saved);
    renderJobs();
}

/* =====================================================
   PROFILE FORM SUBMISSION
   ===================================================== */

if (profileForm) {
    restoreSavedProfile();

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!profileForm.reportValidity()) return;

        currentProfile = readProfile();

        if (!currentProfile) return;

        try {
            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(currentProfile)
            );
        } catch (error) {
            console.warn("Could not save profile.", error);
        }

        if (resultFilter) {
            resultFilter.value = currentProfile.type;
        }

        showingSavedOnly = false;

        showResultsSections();
        updateSavedCount();

        const subtitle = $("resultsSubtitle");

        if (subtitle) {
            subtitle.textContent =
                `Opportunities for ${currentProfile.name || "you"} based on your skills and interests.`;
        }

        renderSkillRecommendations();
        setStatus("Your profile is saved. Searching for opportunities...");

        const opportunities = $("opportunities");

        if (opportunities) {
            opportunities.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        await fetchLiveJobs();
    });
}

/* =====================================================
   FILTERS AND BUTTONS
   ===================================================== */

if (resultFilter) {
    resultFilter.addEventListener("change", renderJobs);
}

if (keywordFilter) {
    keywordFilter.addEventListener("input", renderJobs);
}

if ($("refreshButton")) {
    $("refreshButton").addEventListener("click", fetchLiveJobs);
}

if ($("savedButton")) {
    $("savedButton").addEventListener("click", () => {
        showingSavedOnly = !showingSavedOnly;
        updateSavedCount();
        renderJobs();
    });
}

if (jobList) {
    jobList.addEventListener("click", handleSaveButtonClick);
}

/* =====================================================
   INITIAL SCREEN
   ===================================================== */

updateSavedCount();
renderJobs();
renderSkillRecommendations();
