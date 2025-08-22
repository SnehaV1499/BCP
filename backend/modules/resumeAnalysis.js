const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

const upload = multer({ dest: "uploads/" });

const KEYWORD_MAP = {
  bcom: ["bachelor of commerce"],
  mca: ["master of computer application", "masters in computer applications"],
  bca: ["bachelor of computer application"],
  btech: ["bachelor of technology", "b.tech"],
  be: ["bachelor of engineering"],
  mba: ["master of business administration"],
  ai: ["artificial intelligence"],
  ml: ["machine learning"],
  ds: ["data science"],
};

function smartKeywordMatch(requiredKeywords, resumeText) {
  const text = resumeText.toLowerCase();

  return requiredKeywords.every((kw) => {
    kw = kw.trim().toLowerCase();
    const variants = [kw, ...(KEYWORD_MAP[kw] || [])];
    return variants.some((variant) => text.includes(variant));
  });
}

function extractDetails(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const allText = text.toLowerCase();

  const name = lines[0] || "Not found";
  const possiblePlaces = ["bangalore", "mumbai", "delhi", "chennai", "hyderabad", "pune"];
  const place = possiblePlaces.find((p) => allText.includes(p)) || "Not found";

  const educationMatch = text.match(/(bachelor|master)[^,\n]*/i);
  const education = educationMatch ? educationMatch[0].trim() : "Not found";

  const skillsMatch = text.match(/skills\s*[:\-]?\s*(.*)/i);
  const skills = skillsMatch
    ? skillsMatch[1].split(/[,•\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const certMatch = text.match(/certifications?\s*[:\-]?\s*(.*)/i);
  const certifications = certMatch
    ? certMatch[1].split(/[,•\n]/).map((c) => c.trim()).filter(Boolean)
    : [];

  return { name, place, education, skills, certifications };
}

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const {
      keywords,
      education: minEducation,
      percentage: minPercentage,
      skills: minSkills,
      experience: minExperience,
    } = req.body;

    const resumePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let resumeText = "";

    if (ext === ".pdf") {
      const buffer = fs.readFileSync(resumePath);
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (ext === ".docx") {
      const buffer = fs.readFileSync(resumePath);
      const data = await mammoth.extractRawText({ buffer });
      resumeText = data.value;
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file format" });
    }

    fs.unlinkSync(resumePath); // Clean up uploaded file

    const requiredKeywords = keywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const extracted = extractDetails(resumeText);

    // === EXPERIENCE MATCH LOGIC ===
    const dateRangeRegex = /([A-Za-z]{3,9})\s+(\d{4})\s*(–|-|to)\s*([A-Za-z]{3,9}|Present)?\s*(\d{4})?/gi;

    const monthMap = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sep: 8, sept: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11,
    };

    function parseDate(monthStr, yearStr) {
      const month = monthMap[monthStr.toLowerCase()] ?? 0;
      const year = parseInt(yearStr);
      return new Date(year, month);
    }

    let totalExperienceMonths = 0;
    let dateRangesFound = 0;
    let match;

    // ✅ Count experience from date ranges
    while ((match = dateRangeRegex.exec(resumeText)) !== null) {
      const startMonthStr = match[1];
      const startYearStr = match[2];
      const endMonthStr = match[4];
      const endYearStr = match[5];

      const startDate = parseDate(startMonthStr, startYearStr);
      const endDate = (!endMonthStr || endMonthStr.toLowerCase() === "present")
        ? new Date()
        : parseDate(endMonthStr, endYearStr);

      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      if (months > 0) {
        totalExperienceMonths += months;
        dateRangesFound++;
      }
    }

    // ✅ Only use "2 years 1 month" text if no date ranges found
    if (dateRangesFound === 0) {
      const expTextRegex = /(\d+)\s+years?(\s+(\d+)\s+months?)?/gi;
      while ((match = expTextRegex.exec(resumeText)) !== null) {
        const years = parseInt(match[1]);
        const months = match[3] ? parseInt(match[3]) : 0;
        totalExperienceMonths += years * 12 + months;
      }
    }

    const requiredExpInput = parseInt(minExperience);
    const requiredMonths = requiredExpInput * 12;
    const experienceMatch = totalExperienceMonths >= requiredMonths;

    // === FINAL RESULT CHECKS ===
    const result = {
      keywordMatch: smartKeywordMatch(requiredKeywords, resumeText),
      educationMatch:
        resumeText.toLowerCase().includes(minEducation.toLowerCase()) ||
        (KEYWORD_MAP[minEducation.toLowerCase()] || []).some((e) =>
          resumeText.toLowerCase().includes(e)
        ),
      percentageMatch:
        /\d{2,3}/.test(resumeText) &&
        parseInt(resumeText.match(/\d{2,3}/)[0]) >= parseInt(minPercentage),
      skillsMatch: extracted.skills.length >= parseInt(minSkills),
      experienceMatch,
    };

    const allPassed = Object.values(result).every((v) => v === true);
    const status = allPassed ? "Selected" : "Rejected";

    res.json({
      success: true,
      status,
      result,
      extracted,
    });
  } catch (err) {
    console.error("Resume analysis failed:", err.message);
    res.status(500).json({ success: false, message: "Server error during resume analysis" });
  }
});

module.exports = router;
