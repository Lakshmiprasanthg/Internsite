import { selectuser } from "@/Feature/Userslice";
import { API_BASE_URL } from "@/lib/apiBase";
import axios from "axios";
import {
  ExternalLink,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

type ApplicationRecord = {
  _id: string;
  company?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type ResumeRecord = {
  _id: string;
  title?: string;
  pdfUrl?: string;
  createdAt?: string;
  payment?: {
    status?: string;
  };
};

const normalizeStatus = (status: string | undefined) => {
  const normalized = String(status || "pending").toLowerCase();
  return normalized === "approved" ? "accepted" : normalized;
};

const index = () => {
  const { t } = useTranslation();
  // const [user, setuser] = useState<User | null>({
  //   name: "Rahul",
  //   email: "xyz@gmail.com",
  //   photo:
  //     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
  // });
  const user = useSelector(selectuser);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);

  useEffect(() => {
    const fetchUserApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/application`);
        setApplications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserApplications();
  }, []);

  useEffect(() => {
    const fetchUserResumes = async () => {
      if (!user?.email) {
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/resume/user/${encodeURIComponent(user.email)}`
        );
        setResumes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserResumes();
  }, [user?.email]);

  const userApplications = useMemo(() => {
    const userEmail = String(user?.email || "").toLowerCase();
    const userName = String(user?.name || "").toLowerCase();

    return applications.filter((application) => {
      const applicationEmail = String(application.user?.email || "").toLowerCase();
      const applicationName = String(application.user?.name || "").toLowerCase();

      if (userEmail && applicationEmail) {
        return userEmail === applicationEmail;
      }

      return userName && userName === applicationName;
    });
  }, [applications, user?.email, user?.name]);

  const summary = useMemo(() => {
    return userApplications.reduce(
      (acc, application) => {
        const status = normalizeStatus(application.status);

        if (status === "accepted") {
          acc.accepted += 1;
        } else if (status === "rejected") {
          acc.rejected += 1;
        } else {
          acc.pending += 1;
        }

        return acc;
      },
      { accepted: 0, rejected: 0, pending: 0 }
    );
  }, [userApplications]);

  const latestResume = resumes[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">
                    {summary.pending}
                  </span>
                  <p className="text-blue-600 text-sm mt-1">
                    {t("profile.applicationStats.pending")}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">
                    {summary.accepted}
                  </span>
                  <p className="text-green-600 text-sm mt-1">
                    {t("profile.applicationStats.accepted")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t("profile.myApplications")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Create Resume (Premium)
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Resume Attachment */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Resume Attachment</p>
                    <p className="text-sm text-gray-600">
                      {latestResume
                        ? `Latest resume: ${latestResume.title || "Professional Resume"}`
                        : "No premium resume attached yet."}
                    </p>
                  </div>
                  {latestResume?.pdfUrl ? (
                    <a
                      href={`${API_BASE_URL}${latestResume.pdfUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Resume
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
