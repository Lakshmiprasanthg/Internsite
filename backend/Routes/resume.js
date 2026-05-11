const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Razorpay = require("razorpay");
const Resume = require("../Model/Resume");
const ResumeOtp = require("../Model/ResumeOtp");

const RESUME_FEE = 50;
const ATS_ACTION_VERBS = [
  "Developed",
  "Implemented",
  "Optimized",
  "Designed",
  "Led",
  "Built",
  "Improved",
  "Streamlined",
];

const ATS_STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "into",
  "using",
  "used",
  "work",
  "worked",
  "helped",
  "team",
  "project",
  "projects",
  "role",
  "resume",
  "professional",
  "experience",
  "responsible",
  "on",
  "in",
  "to",
  "of",
  "a",
  "an",
  "as",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "or",
  "at",
  "we",
  "our",
  "their",
  "it",
  "its",
  "can",
  "may",
  "will",
  "should",
  "could",
  "would",
]);

const ROLE_SKILL_HINTS = {
  frontend: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS"],
  backend: ["Node.js", "Express", "MongoDB", "REST API", "Authentication", "SQL"],
  fullstack: ["React", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript"],
  ui: ["HTML", "CSS", "Responsive Design", "Accessibility", "Figma"],
  design: ["Figma", "Wireframing", "Prototyping", "User Research", "Accessibility"],
  data: ["SQL", "Python", "Analytics", "Visualization", "Dashboards"],
  marketing: ["SEO", "Content Strategy", "Campaigns", "Analytics", "Copywriting"],
  product: ["Roadmaps", "Stakeholder Management", "Analytics", "Prioritization", "Research"],
};

const DEFAULT_FEATURE_FLAGS = {
  generateSummary: true,
  improveBullets: true,
  generateBullets: false,
  suggestSkills: true,
  atsScoring: true,
};

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const parseYearRange = (value) => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return { startYear: "", endYear: "" };
  }

  const yearRangeMatch = normalized.match(/^(.+?)\s*[-–]\s*(.+)$/);

  if (yearRangeMatch) {
    return {
      startYear: normalizeText(yearRangeMatch[1]),
      endYear: normalizeText(yearRangeMatch[2]),
    };
  }

  return {
    startYear: normalized,
    endYear: normalized,
  };
};

const parseDescriptionLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value || "")
    .split(/\n|\r\n/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
};

const formatDescriptionLines = (value, format) => {
  const lines = parseDescriptionLines(value);

  if (format === "plain") {
    return lines;
  }

  const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

  return lines.map((line, index) => {
    if (format === "numbered") {
      return `${index + 1}. ${line}`;
    }

    if (format === "roman") {
      return `${romanNumerals[index] || index + 1}. ${line}`;
    }

    if (format === "arrows") {
      return `-> ${line}`;
    }

    return `• ${line}`;
  });
};

const normalizeEducationEntry = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    const parts = entry.split("|").map((part) => normalizeText(part));
    const hasDepartment = parts.length >= 6 && !/^\d{4}(\s*[-–]\s*\d{4})?$/.test(parts[2] || "");
    const yearField = hasDepartment ? parts[3] || "" : parts[2] || "";
    const { startYear, endYear } = parseYearRange(yearField);

    return {
      degree: parts[1] || parts[0] || "",
      school: parts[0] || "",
      department: hasDepartment ? parts[2] || "" : "",
      startYear,
      endYear,
      gpa: hasDepartment ? parts[4]?.replace(/^GPA\s*/i, "") || "" : parts[3]?.replace(/^GPA\s*/i, "") || "",
      description: hasDepartment ? parts.slice(5).join(" | ") : parts.slice(4).join(" | "),
      descriptionFormat: "bullets",
    };
  }

  return {
    degree: normalizeText(entry.level || entry.degree || entry.title),
    school: normalizeText(entry.school || entry.institution),
    department: normalizeText(entry.department || entry.branch || entry.major),
    startYear: normalizeText(entry.startYear),
    endYear: normalizeText(entry.endYear),
    gpa: normalizeText(entry.gpa || entry.percentage),
    description: normalizeText(entry.description),
    descriptionFormat: normalizeText(entry.descriptionFormat || "bullets"),
  };
};

const normalizeExperienceEntry = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    const parts = entry.split("|").map((part) => normalizeText(part));
    return {
      role: parts[1] || parts[0] || "",
      company: parts[0] || "",
      startYear: parts[2] || "",
      endYear: parts[3] || "",
      currentlyWorking: /present/i.test(parts[3] || "") || /present/i.test(parts[2] || ""),
      description: parts.slice(4).join(" | "),
      descriptionFormat: "bullets",
    };
  }

  return {
    role: normalizeText(entry.jobTitle || entry.role || entry.title),
    company: normalizeText(entry.company),
    startYear: normalizeText(entry.startYear),
    endYear: normalizeText(entry.currentlyWorking ? "Present" : entry.endYear),
    currentlyWorking: Boolean(entry.currentlyWorking),
    description: normalizeText(entry.description),
    descriptionFormat: normalizeText(entry.descriptionFormat || "bullets"),
  };
};

const normalizeProjectEntry = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    const parts = entry.split("|").map((part) => normalizeText(part));
    return {
      projectName: parts[0] || "",
      startDate: parts[1] || "",
      endDate: parts[1] || "",
      projectLink: parts[2] || "",
      description: parts.slice(3).join(" | "),
      descriptionFormat: "bullets",
    };
  }

  return {
    projectName: normalizeText(entry.projectName || entry.title),
    startDate: normalizeText(entry.startDate),
    endDate: normalizeText(entry.endDate),
    projectLink: normalizeText(entry.projectLink || entry.link),
    description: normalizeText(entry.description),
    descriptionFormat: normalizeText(entry.descriptionFormat || "bullets"),
  };
};

const splitToItems = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => normalizeText(item.replace(/^[\-•*]+/, "")))
      .filter(Boolean);
  }

  return [];
};

const uniqueItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const extractKeywords = (text) => {
  const tokens = normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9.+#-]+/)
    .map((token) => token.replace(/[^a-z0-9.+#-]/g, ""))
    .filter((token) => token.length > 2 && !ATS_STOPWORDS.has(token));

  return uniqueItems(tokens);
};

const ensureWordCount = (text, minWords = 12, maxWords = 20) => {
  const words = normalizeText(text).split(" ").filter(Boolean);
  const padding = ["measurable", "impact", "quality", "delivery", "results", "teams"];

  while (words.length < minWords) {
    words.push(padding[words.length % padding.length]);
  }

  return words.slice(0, maxWords).join(" ");
};

const buildBullet = (line, role, keywords, index) => {
  const source = normalizeText(line)
    .replace(/^[\-•*]+/, "")
    .replace(/[.]+$/g, "");

  const shortSource = source.split(" ").slice(0, 8).join(" ") || role || "key initiative";
  const keyword = keywords[index % Math.max(keywords.length, 1)] || role || "ATS relevance";
  const verb = ATS_ACTION_VERBS[index % ATS_ACTION_VERBS.length];
  return ensureWordCount(`${verb} ${shortSource} using ${keyword} to improve delivery and measurable quality.`, 12, 20);
};

const buildSummary = ({ role, skills, experienceCount }) => {
  const roleLabel = normalizeText(role) || "professional";
  const topSkills = skills.slice(0, 4).join(", ");
  const experienceLabel = experienceCount > 0 ? `${experienceCount} experience points` : "strong project and academic foundations";

  return `${roleLabel} candidate with ${experienceLabel}. Skilled in ${topSkills || "ATS friendly resume writing and role aligned communication"}. Focused on measurable impact, clarity, and keyword relevance.`;
};

const buildMatchScore = (targetKeywords, resumeText) => {
  if (targetKeywords.length === 0) {
    return 0;
  }

  const normalizedResume = normalizeText(resumeText).toLowerCase();
  const matches = targetKeywords.filter((keyword) => normalizedResume.includes(keyword.toLowerCase()));
  return Math.min(100, Math.round((matches.length / targetKeywords.length) * 100));
};

const buildAtsOptimization = ({ role, userResumeData, jobDescription, featureFlags = {} }) => {
  const flags = { ...DEFAULT_FEATURE_FLAGS, ...featureFlags };
  const source = userResumeData || {};
  const personalInfo = source.personalInfo || {};
  const qualifications = splitToItems(source.qualifications);
  const experience = splitToItems(source.experience);
  const skills = splitToItems(source.skills);
  const projects = splitToItems(source.projects);
  const targetRole = normalizeText(role) || normalizeText(source.title) || "Professional";
  const jobKeywords = extractKeywords(`${targetRole} ${jobDescription || ""}`);
  const resumeKeywords = extractKeywords(
    [
      source.title,
      personalInfo.summary,
      qualifications.join(" "),
      experience.join(" "),
      skills.join(" "),
      projects.join(" "),
    ].join(" ")
  );

  const roleKey = targetRole.toLowerCase();
  const roleHints = Object.entries(ROLE_SKILL_HINTS).find(([key]) => roleKey.includes(key));
  const suggestedSkills = roleHints ? roleHints[1] : [];

  const optimizedSkills = uniqueItems(
    [...skills, ...suggestedSkills, ...jobKeywords.filter((keyword) => keyword.length > 2)]
      .map((item) => normalizeText(item))
      .filter(Boolean)
  );

  const optimizedExperience = experience.length
    ? [
        {
          company: normalizeText(source.experienceCompany || personalInfo.company || ""),
          role: targetRole,
          startDate: normalizeText(source.startDate || ""),
          endDate: normalizeText(source.endDate || ""),
          bullets: flags.improveBullets
            ? experience.map((line, index) => buildBullet(line, targetRole, jobKeywords, index))
            : experience,
        },
      ]
    : flags.generateBullets
      ? [
          {
            company: "",
            role: targetRole,
            startDate: "",
            endDate: "",
            bullets: [buildBullet(targetRole, targetRole, jobKeywords.length ? jobKeywords : optimizedSkills, 0)],
          },
        ]
      : [];

  const optimizedProjects = projects.map((project) => ({
    title: project,
    techStack: optimizedSkills.slice(0, 5),
    bullets: [buildBullet(project, targetRole, jobKeywords.length ? jobKeywords : optimizedSkills, 0)],
  }));

  const optimizedEducation = qualifications.map((item) => ({
    institution: item,
    degree: targetRole,
    year: "",
  }));

  const missingKeywords = uniqueItems(
    jobKeywords.filter((keyword) => !resumeKeywords.includes(keyword.toLowerCase()))
  );

  const score = buildMatchScore(jobKeywords, `${resumeKeywords.join(" ")} ${experience.join(" ")} ${skills.join(" ")}`);

  return {
    summary: flags.generateSummary
      ? buildSummary({ role: targetRole, skills: optimizedSkills, experienceCount: experience.length })
      : normalizeText(personalInfo.summary),
    skills: optimizedSkills,
    experience: optimizedExperience,
    projects: optimizedProjects,
    education: optimizedEducation,
    atsAnalysis: {
      matchScore: score,
      missingKeywords,
      improvements: [
        ...(missingKeywords.slice(0, 5).map((keyword) => `Add ${keyword} in a natural, role relevant context.`)),
        ...(experience.length === 0 ? ["Add specific work experience or project bullets to improve ATS matching."] : []),
        ...(skills.length === 0 ? ["List core tools, frameworks, and domain keywords for stronger ATS coverage."] : []),
      ],
    },
  };
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const resumeDirectory = path.join(__dirname, "..", "uploads", "resumes");

const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const payload = {
    sender: {
      name: "Internsite",
      email: "internsite341@gmail.com",
    },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to send email");
  }
};

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY credentials are not configured");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const parts = [
            item.institution,
            item.school,
            item.company,
            item.title,
            item.role,
            item.degree,
            item.department,
            item.major,
            item.jobTitle,
            item.startDate,
            item.endDate,
            item.gpa,
            item.percentage,
            item.projectName,
            item.projectLink,
            item.description,
          ]
            .map((part) => normalizeText(part))
            .filter(Boolean);

          return parts.join(" | ");
        }

        return String(item);
      })
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .flatMap((line) => line.split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeSkillLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => normalizeText(line))
      .filter(Boolean);
  }

  return [];
};

const buildResumePdf = ({ resume, filePath }) => {
  ensureDirectory(path.dirname(filePath));

  const educationEntries = Array.isArray(resume?.qualifications)
    ? resume.qualifications.map(normalizeEducationEntry).filter(Boolean)
    : [];
  const experienceEntries = Array.isArray(resume?.experience)
    ? resume.experience.map(normalizeExperienceEntry).filter(Boolean)
    : [];
  const projectEntries = Array.isArray(resume?.projects)
    ? resume.projects.map(normalizeProjectEntry).filter(Boolean)
    : [];
  const visibility = {
    personal: resume?.visibility?.personal !== false,
    summary: resume?.visibility?.summary !== false,
    qualifications: resume?.visibility?.qualifications !== false,
    experience: resume?.visibility?.experience !== false,
    projects: resume?.visibility?.projects !== false,
    skills: resume?.visibility?.skills !== false,
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);

    const renderEntryDescription = (value, format) => {
      formatDescriptionLines(value, format).forEach((line) => {
        doc.text(line, { indent: 14, continued: false });
      });
    };

    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#1d4ed8").text(resume?.title || "Professional Resume", {
      align: "center",
    });
    if (visibility.personal) {
      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(11).fillColor("#111827").text(`Name: ${resume?.personalInfo?.name || "N/A"}`);
      doc.text(`Email: ${resume?.user?.email || "N/A"}`);
      doc.text(`Phone: ${resume?.personalInfo?.phone || "N/A"}`);
      doc.text(`Location: ${resume?.personalInfo?.location || "N/A"}`);
    }

    if (visibility.qualifications && educationEntries.length > 0) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("Qualifications");
      educationEntries.forEach((entry) => {
        doc.moveDown(0.5);
        const degreeText = entry.degree || "Degree";
        const yearText = entry.startYear || entry.endYear ? `${entry.startYear || ""}${entry.startYear && entry.endYear ? " - " : ""}${entry.endYear || ""}` : "";

        doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(degreeText, { continued: true });
        doc.font("Helvetica").fontSize(11).fillColor("#374151").text(yearText ? `    ${yearText}` : "", { align: "right" });
        doc.moveDown(0.1);
        doc.font("Helvetica").fontSize(11).fillColor("#374151").text(entry.school || "College name");
        if (entry.department) {
          doc.text(entry.department);
        }
        if (entry.gpa) {
          doc.text(`CGPA ${entry.gpa}`);
        }

        const descriptionLines = formatDescriptionLines(entry.description, entry.descriptionFormat);
        if (descriptionLines.length > 0) {
          doc.moveDown(0.25);
          doc.font("Helvetica").fontSize(11).fillColor("#374151");
          renderEntryDescription(entry.description, entry.descriptionFormat);
        }
      });
    }

    if (visibility.experience && experienceEntries.length > 0) {
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("Experience");
      experienceEntries.forEach((entry) => {
        doc.moveDown(0.5);
        const yearText = entry.startYear || entry.endYear ? `${entry.startYear || ""}${entry.startYear && (entry.endYear || entry.currentlyWorking) ? " - " : ""}${entry.currentlyWorking ? "Present" : entry.endYear || ""}` : "";

        doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(entry.role || "Role", { continued: true });
        doc.font("Helvetica").fontSize(11).fillColor("#374151").text(yearText ? `    ${yearText}` : "", { align: "right" });
        doc.moveDown(0.1);
        doc.font("Helvetica").fontSize(11).fillColor("#374151").text(entry.company || "Company name");

        const descriptionLines = formatDescriptionLines(entry.description, entry.descriptionFormat);
        if (descriptionLines.length > 0) {
          doc.moveDown(0.25);
          doc.font("Helvetica").fontSize(11).fillColor("#374151");
          renderEntryDescription(entry.description, entry.descriptionFormat);
        }
      });
    }

    if (visibility.projects && projectEntries.length > 0) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("Projects");
      projectEntries.forEach((entry) => {
        doc.moveDown(0.5);
        const dateText = entry.startDate || entry.endDate
          ? `${entry.startDate || ""}${entry.startDate && entry.endDate ? " - " : ""}${entry.endDate || ""}`
          : "";

        doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(entry.projectName || "Project", { continued: true });
        doc.font("Helvetica").fontSize(11).fillColor("#374151").text(dateText ? `    ${dateText}` : "", { align: "right" });
        if (entry.projectLink) {
          doc.moveDown(0.1);
          doc.font("Helvetica").fontSize(11).fillColor("#374151").text(entry.projectLink);
        }

        const descriptionLines = formatDescriptionLines(entry.description, entry.descriptionFormat);
        if (descriptionLines.length > 0) {
          doc.moveDown(0.25);
          doc.font("Helvetica").fontSize(11).fillColor("#374151");
          renderEntryDescription(entry.description, entry.descriptionFormat);
        }
      });
    }

    if (visibility.skills) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("Skills");
      doc.font("Helvetica").fontSize(11).fillColor("#374151");
      normalizeSkillLines(resume?.skills).forEach((item) => {
        const colonIndex = item.indexOf(":");
        if (colonIndex > -1) {
          const label = item.slice(0, colonIndex).trim();
          const text = item.slice(colonIndex + 1).trim();
          doc.text(`• ${label}: ${text}`);
          return;
        }

        doc.text(`• ${item}`);
      });
    }

    if (visibility.summary && resume?.personalInfo?.summary) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("Summary");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(resume.personalInfo.summary);
    }

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const isDebugMode = process.env.NODE_ENV !== "production" || process.env.ALLOW_OTP_DEBUG === "true";
  let otp = "";

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    otp = generateOTP();
    await ResumeOtp.deleteMany({ email: email.toLowerCase() });
    await ResumeOtp.create({ email: email.toLowerCase(), otp, verified: false });

    if (process.env.BREVO_API_KEY) {
      await sendBrevoEmail({
        to: email,
        subject: "Your Resume Payment Verification Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px;">
              <h2 style="color: #333;">Resume Payment Verification</h2>
              <p style="color: #666;">Use the following code to verify your resume purchase.</p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h1 style="color: #0066cc; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666;">This code expires in 10 minutes.</p>
            </div>
          </div>
        `,
      });
    } else if (!isDebugMode) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    return res.status(200).json({
      success: true,
      message: isDebugMode ? "OTP generated for local testing" : "OTP sent successfully",
      ...(isDebugMode ? { debugOtp: otp } : {}),
    });
  } catch (error) {
    console.error("Resume OTP send error:", error.message);

    if (isDebugMode && otp) {
      return res.status(200).json({
        success: true,
        message: "OTP generated for local testing",
        debugOtp: otp,
      });
    }

    return res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const record = await ResumeOtp.findOne({ email: email.toLowerCase(), otp });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Resume OTP verify error:", error.message);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

router.post("/create-order", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const otpRecord = await ResumeOtp.findOne({ email: email.toLowerCase(), verified: true });

    if (!otpRecord) {
      return res.status(403).json({ error: "OTP verification required before payment" });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: RESUME_FEE * 100,
      currency: "INR",
      receipt: `resume_${Date.now()}`,
      payment_capture: 1,
    });

    return res.status(200).json({
      success: true,
      order,
      amount: RESUME_FEE,
    });
  } catch (error) {
    console.error("Resume order error:", error.message);
    return res.status(500).json({ error: `Failed to create payment order: ${error.message}` });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { orderId, paymentId, signature, resume, user } = req.body;

  if (!orderId || !paymentId || !signature || !resume || !user) {
    return res.status(400).json({ error: "Missing payment verification data" });
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Payment signature verification failed" });
    }

    const fileName = `resume-${Date.now()}-${String(user.email || "user").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
    const filePath = path.join(resumeDirectory, fileName);

    const resumeRecord = await Resume.create({
      user,
      title: resume.title || "Professional Resume",
      personalInfo: resume.personalInfo || {},
      qualifications: normalizeList(resume.qualifications),
      experience: normalizeList(resume.experience),
      projects: normalizeList(resume.projects),
      skills: normalizeSkillLines(resume.skills),
      photo: resume.photo || "",
      visibility: resume.visibility || {},
      payment: {
        orderId,
        paymentId,
        amount: RESUME_FEE,
        currency: "INR",
        status: "paid",
      },
    });

    await buildResumePdf({ resume: { ...resume, user }, filePath });

    resumeRecord.pdfUrl = `/uploads/resumes/${fileName}`;
    await resumeRecord.save();

    await ResumeOtp.deleteMany({ email: String(user.email || "").toLowerCase() });

    return res.status(200).json({
      success: true,
      message: "Payment verified and resume created",
      data: resumeRecord,
    });
  } catch (error) {
    console.error("Resume payment verification error:", error.message);
    return res.status(500).json({ error: `Failed to verify payment: ${error.message}` });
  }
});

router.post("/optimize", async (req, res) => {
  try {
    const { role, userResumeData, jobDescription, featureFlags } = req.body || {};

    if (!userResumeData || typeof userResumeData !== "object") {
      return res.status(400).json({ error: "User resume data is required" });
    }

    const optimizedResume = buildAtsOptimization({
      role,
      userResumeData,
      jobDescription,
      featureFlags,
    });

    return res.status(200).json(optimizedResume);
  } catch (error) {
    console.error("Resume optimization error:", error.message);
    return res.status(500).json({ error: "Failed to optimize resume" });
  }
});

router.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const resumes = await Resume.find({ "user.email": email.toLowerCase() }).sort({ createdAt: -1 });
    return res.status(200).json(resumes);
  } catch (error) {
    console.error("Fetch resume error:", error.message);
    return res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

module.exports = router;