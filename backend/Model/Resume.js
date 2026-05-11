const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      default: "Professional Resume",
    },
    personalInfo: {
      type: Object,
      default: {},
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experience: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    visibility: {
      type: Object,
      default: {},
    },
    photo: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    payment: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);