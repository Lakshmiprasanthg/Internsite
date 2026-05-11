import { selectuser } from "@/Feature/Userslice";
import { API_BASE_URL } from "@/lib/apiBase";
import axios from "axios";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  Upload,
  User,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

type ResumeFormState = {
  title: string;
  personalInfo: {
    name: string;
    phone: string;
    location: string;
    summary: string;
  };
  qualifications: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string;
  photo: string;
  visibility: SectionVisibility;
};

type EducationEntry = {
  school: string;
  level: string;
  department: string;
  startYear: string;
  endYear: string;
  gpa: string;
  descriptionFormat: DescriptionFormat;
  description: string;
};

type ExperienceEntry = {
  company: string;
  jobTitle: string;
  startYear: string;
  endYear: string;
  currentlyWorking: boolean;
  descriptionFormat: DescriptionFormat;
  description: string;
};

type ProjectEntry = {
  projectName: string;
  startDate: string;
  endDate: string;
  projectLink: string;
  descriptionFormat: DescriptionFormat;
  description: string;
};

type SectionVisibility = {
  personal: boolean;
  summary: boolean;
  qualifications: boolean;
  experience: boolean;
  projects: boolean;
  skills: boolean;
};

type DescriptionFormat = "plain" | "bullets" | "numbered" | "roman" | "arrows";

type ResumeOtpState = {
  otp: string;
  sent: boolean;
  verified: boolean;
};

type EditorSection = "personal" | "summary" | "qualifications" | "experience" | "projects" | "skills";

type AtsOptimizationResult = {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  projects: Array<{
    title: string;
    techStack: string[];
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  atsAnalysis: {
    matchScore: number;
    missingKeywords: string[];
    improvements: string[];
  };
};

type AtsFeatureFlags = {
  generateSummary: boolean;
  improveBullets: boolean;
  generateBullets: boolean;
  suggestSkills: boolean;
  atsScoring: boolean;
};

const defaultFeatureFlags: AtsFeatureFlags = {
  generateSummary: true,
  improveBullets: true,
  generateBullets: false,
  suggestSkills: true,
  atsScoring: true,
};

const descriptionFormatOptions: Array<{ label: string; value: DescriptionFormat }> = [
  { label: "Plain text", value: "plain" },
  { label: "Bullets", value: "bullets" },
  { label: "Numbered list", value: "numbered" },
  { label: "Roman numerals", value: "roman" },
  { label: "Arrow list", value: "arrows" },
];

const educationLevelOptions = [
  "Select level",
  "High School",
  "Diploma",
  "Bachelor of Technology",
  "Bachelor of Engineering",
  "Bachelor of Science",
  "Bachelor of Commerce",
  "Bachelor of Arts",
  "Master of Technology",
  "Master of Science",
  "Master of Business Administration",
  "Other",
];

const experienceTitleOptions = [
  "Select title",
  "Intern",
  "Trainee",
  "Associate",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Project Coordinator",
  "Other",
];

const yearOptions = Array.from({ length: 16 }, (_, index) => String(new Date().getFullYear() - index));

const createEducationEntry = (): EducationEntry => ({
  school: "",
  level: "Select level",
  department: "",
  startYear: "",
  endYear: "",
  gpa: "",
  descriptionFormat: "bullets",
  description: "",
});

const createExperienceEntry = (): ExperienceEntry => ({
  company: "",
  jobTitle: "Select title",
  startYear: "",
  endYear: "",
  currentlyWorking: false,
  descriptionFormat: "bullets",
  description: "",
});

const createProjectEntry = (): ProjectEntry => ({
  projectName: "",
  startDate: "",
  endDate: "",
  projectLink: "",
  descriptionFormat: "bullets",
  description: "",
});

const defaultVisibility: SectionVisibility = {
  personal: true,
  summary: true,
  qualifications: true,
  experience: true,
  projects: true,
  skills: true,
};

const formatEducationEntry = (entry: EducationEntry) =>
  [
    entry.school,
    entry.level && entry.level !== "Select level" ? entry.level : "",
    entry.department,
    entry.startYear && entry.endYear ? `${entry.startYear} - ${entry.endYear}` : "",
    entry.gpa ? `GPA ${entry.gpa}` : "",
    entry.description,
  ]
    .filter(Boolean)
    .join(" | ");

const formatExperienceEntry = (entry: ExperienceEntry) =>
  [
    entry.company,
    entry.jobTitle && entry.jobTitle !== "Select title" ? entry.jobTitle : "",
    entry.startYear && entry.endYear ? `${entry.startYear} - ${entry.endYear}` : "",
    entry.currentlyWorking ? "Present" : "",
    entry.description,
  ]
    .filter(Boolean)
    .join(" | ");

const formatProjectEntry = (entry: ProjectEntry) =>
  [
    entry.projectName,
    entry.startDate && entry.endDate ? `${entry.startDate} - ${entry.endDate}` : "",
    entry.projectLink,
    entry.description,
  ]
    .filter(Boolean)
    .join(" | ");

const parseDescriptionLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const romanNumeral = (index: number) => {
  const numerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return numerals[index] || `${index + 1}`;
};

const formatDescriptionLines = (value: string, format: DescriptionFormat) => {
  const lines = parseDescriptionLines(value);

  if (format === "plain") {
    return lines;
  }

  return lines.map((line, index) => {
    if (format === "numbered") {
      return `${index + 1}. ${line}`;
    }

    if (format === "roman") {
      return `${romanNumeral(index)}. ${line}`;
    }

    if (format === "arrows") {
      return `-> ${line}`;
    }

    return `• ${line}`;
  });
};

const parseSkillLines = (value: string) =>
  value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIndex = line.indexOf(":");

      if (colonIndex === -1) {
        return { label: "", text: line };
      }

      return {
        label: line.slice(0, colonIndex).trim(),
        text: line.slice(colonIndex + 1).trim(),
      };
    });

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function ResumeBuilderPage() {
  const user = useSelector(selectuser);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSection>("personal");
  const [atsLoading, setAtsLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState<AtsOptimizationResult | null>(null);
  const [form, setForm] = useState<ResumeFormState>({
    title: "Professional Resume",
    personalInfo: {
      name: user?.name || "",
      phone: "",
      location: "",
      summary: "",
    },
    qualifications: [createEducationEntry()],
    experience: [createExperienceEntry()],
    projects: [createProjectEntry()],
    skills: "",
    photo: user?.photo || "",
    visibility: defaultVisibility,
  });
  const [otpState, setOtpState] = useState<ResumeOtpState>({
    otp: "",
    sent: false,
    verified: false,
  });

  const resumePayload = useMemo(
    () => ({
      title: form.title,
      personalInfo: form.personalInfo,
      qualifications: form.qualifications.map(formatEducationEntry),
      experience: form.experience.map(formatExperienceEntry),
      projects: form.projects.map(formatProjectEntry),
      skills: form.skills,
      photo: form.photo,
      visibility: form.visibility,
    }),
    [form]
  );

  useEffect(() => {
    if (user?.name || user?.photo) {
      setForm((previous) => ({
        ...previous,
        personalInfo: {
          ...previous.personalInfo,
          name: user?.name || previous.personalInfo.name,
        },
        photo: user?.photo || previous.photo,
      }));
    }
  }, [user?.name, user?.photo]);

  const parsedPreview = useMemo(
    () => ({
      qualifications: form.qualifications.filter((item) => Object.values(item).some((value) => String(value || "").trim())),
      experience: form.experience.filter((item) => Object.values(item).some((value) => String(value || "").trim())),
      projects: form.projects.filter((item) => Object.values(item).some((value) => String(value || "").trim())),
      skills: form.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }),
    [form.experience, form.projects, form.qualifications, form.skills]
  );

    const hasAtsResult = Boolean(atsResult);

  const updatePersonalInfo = (key: keyof ResumeFormState["personalInfo"], value: string) => {
    setForm((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [key]: value,
      },
    }));
  };

  const updateEducationEntry = (index: number, key: keyof EducationEntry, value: string) => {
    setForm((previous) => ({
      ...previous,
      qualifications: previous.qualifications.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      ),
    }));
  };

  const addEducationEntry = () => {
    setForm((previous) => ({
      ...previous,
      qualifications: [...previous.qualifications, createEducationEntry()],
    }));
  };

  const removeEducationEntry = (index: number) => {
    setForm((previous) => ({
      ...previous,
      qualifications: previous.qualifications.length > 1
        ? previous.qualifications.filter((_, entryIndex) => entryIndex !== index)
        : previous.qualifications,
    }));
  };

  const updateExperienceEntry = (index: number, key: keyof ExperienceEntry, value: string | boolean) => {
    setForm((previous) => ({
      ...previous,
      experience: previous.experience.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      ),
    }));
  };

  const addExperienceEntry = () => {
    setForm((previous) => ({
      ...previous,
      experience: [...previous.experience, createExperienceEntry()],
    }));
  };

  const removeExperienceEntry = (index: number) => {
    setForm((previous) => ({
      ...previous,
      experience: previous.experience.length > 1
        ? previous.experience.filter((_, entryIndex) => entryIndex !== index)
        : previous.experience,
    }));
  };

  const updateProjectEntry = (index: number, key: keyof ProjectEntry, value: string) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      ),
    }));
  };

  const addProjectEntry = () => {
    setForm((previous) => ({
      ...previous,
      projects: [...previous.projects, createProjectEntry()],
    }));
  };

  const removeProjectEntry = (index: number) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.length > 1
        ? previous.projects.filter((_, entryIndex) => entryIndex !== index)
        : previous.projects,
    }));
  };

  const toggleSectionVisibility = (key: keyof SectionVisibility) => {
    setForm((previous) => ({
      ...previous,
      visibility: {
        ...previous.visibility,
        [key]: !previous.visibility[key],
      },
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setForm((previous) => ({
        ...previous,
        photo: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const optimizeResume = async () => {
    setAtsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/resume/optimize`, {
        role: targetRole || form.title,
        userResumeData: resumePayload,
        jobDescription,
        featureFlags: defaultFeatureFlags,
      });

      setAtsResult(response.data);
      toast.success("ATS JSON generated successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to optimize resume.");
    } finally {
      setAtsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!user?.email) {
      toast.error("Please login first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/resume/send-otp`, {
        email: user.email,
      });

      if (response.data?.debugOtp) {
        setOtpState((previous) => ({ ...previous, otp: response.data.debugOtp }));
      }

      setOtpState((previous) => ({ ...previous, sent: true }));
      toast.success("OTP sent to your email.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!user?.email || !otpState.otp) {
      toast.error("Enter the OTP first.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/resume/verify-otp`, {
        email: user.email,
        otp: otpState.otp,
      });

      setOtpState((previous) => ({
        ...previous,
        verified: true,
      }));
      toast.success("OTP verified successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    if (!user?.email || !otpState.verified) {
      toast.error("Verify OTP before payment.");
      return;
    }

    if (!razorpayKeyId) {
      toast.error("Razorpay key is not configured yet.");
      return;
    }

    const razorpayReady = await loadRazorpay();
    if (!razorpayReady || !(window as any).Razorpay) {
      toast.error("Razorpay failed to load.");
      return;
    }

    setPaymentLoading(true);
    try {
      const orderResponse = await axios.post(`${API_BASE_URL}/api/resume/create-order`, {
        email: user.email,
      });

      const order = orderResponse.data.order;
      const razorpayOptions = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "Internsite Resume Builder",
        description: "Premium resume creation",
        order_id: order.id,
        handler: async (response: any) => {
          const paymentResponse = await axios.post(`${API_BASE_URL}/api/resume/verify-payment`, {
            orderId: order.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            resume: form,
            user,
          });

          toast.success(paymentResponse.data.message || "Resume created successfully.");
        },
        prefill: {
          name: user.name || form.personalInfo.name,
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Payment initiation failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Resume Builder</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">ATS Resume Optimization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use structured inputs for education and experience. OTP and Razorpay stay unchanged.
          </p>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { key: "personal", label: "Personal" },
                  { key: "summary", label: "Summary" },
                  { key: "qualifications", label: "Education" },
                  { key: "experience", label: "Experience" },
                  { key: "projects", label: "Projects" },
                  { key: "skills", label: "Skills" },
                ].map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key as EditorSection)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      activeSection === section.key
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-800">Section Visibility</p>
                <p className="mt-1 text-xs text-gray-500">Toggle any section on or off based on user needs.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { key: "personal", label: "Personal" },
                    { key: "summary", label: "Summary" },
                    { key: "qualifications", label: "Education" },
                    { key: "experience", label: "Experience" },
                    { key: "projects", label: "Projects" },
                    { key: "skills", label: "Skills" },
                  ].map((section) => (
                    <label key={`visibility-${section.key}`} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.visibility[section.key as keyof SectionVisibility]}
                        onChange={() => toggleSectionVisibility(section.key as keyof SectionVisibility)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span>{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">Resume Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                {activeSection === "personal" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                      <input
                        value={form.personalInfo.name}
                        onChange={(event) => updatePersonalInfo("name", event.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Phone</label>
                        <input
                          value={form.personalInfo.phone}
                          onChange={(event) => updatePersonalInfo("phone", event.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Location</label>
                        <input
                          value={form.personalInfo.location}
                          onChange={(event) => updatePersonalInfo("location", event.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Photo</label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-gray-600 transition hover:border-blue-400 hover:text-blue-600">
                        <Upload className="h-4 w-4" />
                        <span>{form.photo ? "Replace profile photo" : "Upload profile photo"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </>
                )}

                {activeSection === "summary" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Professional Summary</label>
                    <textarea
                      value={form.personalInfo.summary}
                      onChange={(event) => updatePersonalInfo("summary", event.target.value)}
                      rows={8}
                      placeholder="Write a concise summary that highlights your strengths and target role."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {activeSection === "qualifications" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Education / Qualifications</label>
                        <p className="mt-1 text-xs text-gray-500">Add one entry at a time using dropdowns and short fields.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addEducationEntry}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Add education
                      </button>
                    </div>

                    {form.qualifications.map((entry, index) => (
                      <div key={`education-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900">Education {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeEducationEntry(index)}
                            className="text-xs font-semibold text-gray-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">School / College</label>
                            <input
                              value={entry.school}
                              onChange={(event) => updateEducationEntry(index, "school", event.target.value)}
                              placeholder="IIT Delhi"
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Level</label>
                              <select
                                value={entry.level}
                                onChange={(event) => updateEducationEntry(index, "level", event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                {educationLevelOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Department / Branch / Major</label>
                              <input
                                value={entry.department}
                                onChange={(event) => updateEducationEntry(index, "department", event.target.value)}
                                placeholder="Computer Science"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">GPA / Percentage</label>
                              <input
                                value={entry.gpa}
                                onChange={(event) => updateEducationEntry(index, "gpa", event.target.value)}
                                placeholder="7.43"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Start Year</label>
                              <select
                                value={entry.startYear}
                                onChange={(event) => updateEducationEntry(index, "startYear", event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="">Select year</option>
                                {yearOptions.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">End Year</label>
                              <select
                                value={entry.endYear}
                                onChange={(event) => updateEducationEntry(index, "endYear", event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="">Select year</option>
                                {yearOptions.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                            <select
                              value={entry.descriptionFormat}
                              onChange={(event) => updateEducationEntry(index, "descriptionFormat", event.target.value)}
                              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              {descriptionFormatOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={entry.description}
                              onChange={(event) => updateEducationEntry(index, "description", event.target.value)}
                              rows={4}
                              placeholder="Write one point per line."
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "experience" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Work Experience</label>
                        <p className="mt-1 text-xs text-gray-500">Use dropdowns for job titles and year fields for faster input.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addExperienceEntry}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Add experience
                      </button>
                    </div>

                    {form.experience.map((entry, index) => (
                      <div key={`experience-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900">Experience {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeExperienceEntry(index)}
                            className="text-xs font-semibold text-gray-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Company</label>
                            <input
                              value={entry.company}
                              onChange={(event) => updateExperienceEntry(index, "company", event.target.value)}
                              placeholder="Tech Dreamers Inc."
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Job Title</label>
                              <select
                                value={entry.jobTitle}
                                onChange={(event) => updateExperienceEntry(index, "jobTitle", event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                {experienceTitleOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Currently Working Here</label>
                              <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={entry.currentlyWorking}
                                  onChange={(event) => updateExperienceEntry(index, "currentlyWorking", event.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Mark as current role</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Start Year</label>
                              <select
                                value={entry.startYear}
                                onChange={(event) => updateExperienceEntry(index, "startYear", event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="">Select year</option>
                                {yearOptions.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">
                                End Year
                              </label>
                              <select
                                value={entry.currentlyWorking ? "Present" : entry.endYear}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  updateExperienceEntry(index, "currentlyWorking", value === "Present");
                                  updateExperienceEntry(index, "endYear", value === "Present" ? "Present" : value);
                                }}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="">Select year</option>
                                {yearOptions.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                                <option value="Present">Present</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                            <select
                              value={entry.descriptionFormat}
                              onChange={(event) => updateExperienceEntry(index, "descriptionFormat", event.target.value)}
                              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              {descriptionFormatOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={entry.description}
                              onChange={(event) => updateExperienceEntry(index, "description", event.target.value)}
                              rows={4}
                              placeholder="Write one point per line."
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "projects" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Projects</label>
                        <p className="mt-1 text-xs text-gray-500">Add projects with duration, link, and description.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addProjectEntry}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Add project
                      </button>
                    </div>

                    {form.projects.map((entry, index) => (
                      <div key={`project-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900">Project {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeProjectEntry(index)}
                            className="text-xs font-semibold text-gray-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Project Name</label>
                            <input
                              value={entry.projectName}
                              onChange={(event) => updateProjectEntry(index, "projectName", event.target.value)}
                              placeholder="Awesome App"
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
                              <input
                                value={entry.startDate}
                                onChange={(event) => updateProjectEntry(index, "startDate", event.target.value)}
                                placeholder="Fall 2024"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
                              <input
                                value={entry.endDate}
                                onChange={(event) => updateProjectEntry(index, "endDate", event.target.value)}
                                placeholder="Fall 2024"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Project Link</label>
                            <input
                              value={entry.projectLink}
                              onChange={(event) => updateProjectEntry(index, "projectLink", event.target.value)}
                              placeholder="https://yourproject.com"
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                            <select
                              value={entry.descriptionFormat}
                              onChange={(event) => updateProjectEntry(index, "descriptionFormat", event.target.value)}
                              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              {descriptionFormatOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={entry.description}
                              onChange={(event) => updateProjectEntry(index, "description", event.target.value)}
                              rows={4}
                              placeholder="Write one point per line."
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "skills" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Skills</label>
                    <textarea
                      value={form.skills}
                      onChange={(event) => setForm((previous) => ({ ...previous, skills: event.target.value }))}
                      rows={6}
                      placeholder={"Full-Stack Development: MongoDB, Express.js, React.js, Node.js, REST APIs\nFrontend: HTML, CSS, JavaScript, React.js"}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
                  <p className="mt-1 text-sm text-gray-600">A clean preview of the data you enter.</p>
                </div>
              </div>

              <div className="space-y-5 rounded-2xl bg-gray-50 p-5">
                {form.visibility.personal ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                      {form.photo || user?.photo ? (
                        <img src={form.photo || user?.photo} alt={form.personalInfo.name || user?.name || "Resume preview"} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-gray-900">{form.personalInfo.name || "Your Name"}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>{user?.email || "email@example.com"}</span>
                        <span>{form.personalInfo.phone || "Phone"}</span>
                        <span>{form.personalInfo.location || "Location"}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {form.visibility.summary ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Summary</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {form.personalInfo.summary || "Your professional summary will appear here."}
                    </p>
                  </div>
                ) : null}

                {form.visibility.qualifications ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Education</p>
                    <div className="mt-2 space-y-3">
                      {parsedPreview.qualifications.length > 0 ? (
                        parsedPreview.qualifications.map((item, index) => (
                          <div key={`edu-preview-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.level !== "Select level" ? item.level : "Degree"}
                                </p>
                                <p className="mt-1 text-sm text-gray-700">{item.department || "Department / Branch / Major"}</p>
                                <p className="mt-1 text-sm text-gray-700">{item.school || "College name"}</p>
                              </div>
                              <div className="text-right text-sm text-gray-700">
                                <p>{item.startYear || item.endYear ? `${item.startYear || ""}${item.startYear && item.endYear ? " - " : ""}${item.endYear || ""}` : "Year"}</p>
                                <p className="mt-1">{item.gpa ? `CGPA ${item.gpa}` : "CGPA"}</p>
                              </div>
                            </div>

                            {parseDescriptionLines(item.description).length > 0 ? (
                              <div className="mt-3 space-y-1 text-sm text-gray-700">
                                {formatDescriptionLines(item.description, item.descriptionFormat).map((line, lineIndex) => (
                                  <p key={`${line}-${lineIndex}`}>{line}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Add qualifications to preview this section.</p>
                      )}
                    </div>
                  </div>
                ) : null}

                {form.visibility.experience ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Experience</p>
                    <div className="mt-2 space-y-3">
                      {parsedPreview.experience.length > 0 ? (
                        parsedPreview.experience.map((item, index) => (
                          <div key={`exp-preview-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.jobTitle !== "Select title" ? item.jobTitle : "Job title"}
                                </p>
                                <p className="mt-1 text-sm text-gray-700">{item.company || "Company name"}</p>
                              </div>
                              <div className="text-right text-sm text-gray-700">
                                <p>
                                  {item.startYear || item.endYear || item.currentlyWorking
                                    ? `${item.startYear || ""}${item.startYear && (item.endYear || item.currentlyWorking) ? " - " : ""}${item.currentlyWorking ? "Present" : item.endYear || ""}`
                                    : "Year"}
                                </p>
                              </div>
                            </div>

                            {parseDescriptionLines(item.description).length > 0 ? (
                              <div className="mt-3 space-y-1 text-sm text-gray-700">
                                {formatDescriptionLines(item.description, item.descriptionFormat).map((line, lineIndex) => (
                                  <p key={`${line}-${lineIndex}`}>{line}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Add experience details to preview this section.</p>
                      )}
                    </div>
                  </div>
                ) : null}

                {form.visibility.projects ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Projects</p>
                    <div className="mt-2 space-y-3">
                      {parsedPreview.projects.length > 0 ? (
                        parsedPreview.projects.map((item, index) => (
                          <div key={`project-preview-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.projectName || "Project name"}</p>
                                {item.projectLink ? (
                                  <a href={item.projectLink} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm text-blue-600 hover:text-blue-700">
                                    {item.projectLink}
                                  </a>
                                ) : (
                                  <p className="mt-1 text-sm text-gray-700">Project link</p>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-700">
                                <p>{item.startDate || item.endDate ? `${item.startDate || ""}${item.startDate && item.endDate ? " - " : ""}${item.endDate || ""}` : "Date"}</p>
                              </div>
                            </div>

                            {parseDescriptionLines(item.description).length > 0 ? (
                              <div className="mt-3 space-y-1 text-sm text-gray-700">
                                {formatDescriptionLines(item.description, item.descriptionFormat).map((line, lineIndex) => (
                                  <p key={`${line}-${lineIndex}`}>{line}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Add projects to preview this section.</p>
                      )}
                    </div>
                  </div>
                ) : null}

                {form.visibility.skills ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Skills</p>
                    <div className="mt-2">
                      {parseSkillLines(form.skills).length > 0 ? (
                        <ul className="space-y-1 text-sm text-gray-800">
                          {parseSkillLines(form.skills).map((skill) => (
                            <li key={`${skill.label}-${skill.text}`} className="flex items-start gap-2">
                              <span className="mt-1 text-gray-700">•</span>
                              <span>
                                {skill.label ? <strong className="font-semibold text-gray-900">{skill.label}: </strong> : null}
                                <span>{skill.text}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">Add skills to preview this section.</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ATS Optimization</h2>
                  <p className="mt-1 text-sm text-gray-600">Generate structured JSON using the schema you provided.</p>
                </div>
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Target Role</label>
                  <input
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Frontend Developer"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Job Description, optional</label>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows={7}
                    placeholder="Paste the job description here for keyword matching and ATS scoring."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  onClick={optimizeResume}
                  disabled={atsLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {atsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Generate ATS JSON
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {hasAtsResult ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">ATS Match Score</p>
                        <p className="text-xs text-gray-600">Based on the keywords found in the target role and job description.</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {atsResult?.atsAnalysis.matchScore ?? 0}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.max(0, atsResult?.atsAnalysis.matchScore ?? 0))}%` }}
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Missing Keywords</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {atsResult?.atsAnalysis.missingKeywords.length ? (
                            atsResult.atsAnalysis.missingKeywords.map((keyword) => (
                              <span key={keyword} className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No missing keywords detected.</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Improvement Notes</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {atsResult?.atsAnalysis.improvements.length ? (
                            atsResult.atsAnalysis.improvements.map((item) => <li key={item}>{item}</li>)
                          ) : (
                            <li>Your resume already covers the selected keywords well.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-gray-600">
                    Add a target role and optional job description, then generate the ATS JSON output.
                  </p>
                )}
              </div>

              {atsResult ? (
                <pre className="mt-4 max-h-[28rem] overflow-auto rounded-2xl bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
{JSON.stringify(atsResult, null, 2)}
                </pre>
              ) : null}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900">Premium Access</h2>
              <p className="mt-1 text-sm text-gray-600">OTP verification and Razorpay checkout remain the same.</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${otpState.sent ? "text-green-600" : "text-gray-300"}`} />
                  <span className={otpState.sent ? "text-gray-800" : "text-gray-500"}>OTP sent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${otpState.verified ? "text-green-600" : "text-gray-300"}`} />
                  <span className={otpState.verified ? "text-gray-800" : "text-gray-500"}>OTP verified</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send OTP
                </button>

                <input
                  value={otpState.otp}
                  onChange={(event) => setOtpState((previous) => ({ ...previous, otp: event.target.value }))}
                  placeholder="Enter OTP"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={verifyOtp}
                  disabled={loading || !otpState.otp}
                  className="w-full rounded-xl border border-gray-900 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-60"
                >
                  Verify OTP
                </button>

                <button
                  onClick={startPayment}
                  disabled={!otpState.verified || paymentLoading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {paymentLoading ? "Opening Razorpay..." : "Proceed to Payment - ₹50"}
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                You can review the optimized JSON first, then unlock the paid resume generation when ready.
              </div>

              <div className="mt-4">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Open profile to view the attached resume
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}