import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBase";
import { BarChart3, Briefcase, ClipboardCheck, GraduationCap, Users } from "lucide-react";

type Application = {
  status?: "accepted" | "pending" | "rejected";
  category?: string;
};

type Internship = {
  category?: string;
};

type Job = {
  category?: string;
};

const AnalyticsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationRes, internshipRes, jobRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/application`),
          axios.get(`${API_BASE_URL}/api/internship`),
          axios.get(`${API_BASE_URL}/api/job`),
        ]);

        setApplications(applicationRes.data || []);
        setInternships(internshipRes.data || []);
        setJobs(jobRes.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const accepted = applications.filter((item) => item.status === "accepted").length;
  const rejected = applications.filter((item) => item.status === "rejected").length;
  const pending = applications.filter((item) => item.status === "pending").length;

  const acceptanceRate =
    applications.length > 0 ? Math.round((accepted / applications.length) * 100) : 0;

  const topCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    [...internships, ...jobs].forEach((item) => {
      const key = (item.category || "Uncategorized").trim();
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [internships, jobs]);

  const maxCategoryCount = topCategories[0]?.[1] || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview of applications, jobs, and internships.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-gray-500">
            Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{applications.length}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                  <ClipboardCheck size={14} /> Total submissions
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{jobs.length}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Briefcase size={14} /> Live opportunities
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Active Internships</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{internships.length}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-purple-600 text-xs font-medium">
                  <GraduationCap size={14} /> Student-focused roles
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Acceptance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{acceptanceRate}%</p>
                <div className="mt-3 inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <Users size={14} /> Accepted applicants
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" />
                  Application Status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Accepted</span>
                    <span className="font-semibold text-green-700">{accepted}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${applications.length ? (accepted / applications.length) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-amber-700">{pending}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${applications.length ? (pending / applications.length) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-semibold text-red-700">{rejected}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${applications.length ? (rejected / applications.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
                <div className="space-y-3">
                  {topCategories.length === 0 ? (
                    <p className="text-sm text-gray-500">No category data yet.</p>
                  ) : (
                    topCategories.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">{name}</span>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
