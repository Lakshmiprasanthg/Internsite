import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Mail,
  Tag,
  User,
  X,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { selectuser } from "@/Feature/Userslice";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "@/lib/apiBase";

type ApplicationItem = {
  _id: string;
  company?: string;
  category?: string;
  createdAt?: string;
  status?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

const normalizeStatus = (status: any) => {
  const normalized = String(status || "pending").toLowerCase();
  return normalized === "approved" ? "accepted" : normalized;
};

const getStatusColor = (status: any) => {
  switch (normalizeStatus(status)) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getStatusLabel = (status: any) => {
  const normalized = normalizeStatus(status);

  if (normalized === "accepted") {
    return "Selected";
  }

  if (normalized === "rejected") {
    return "Rejected";
  }

  return "Pending";
};

const getStatusMessage = (application: ApplicationItem) => {
  const status = normalizeStatus(application.status);
  const company = application.company || "this company";

  if (status === "accepted") {
    return {
      title: "Selected",
      message: `Congratulations. You are selected for ${company}. Keep your profile and communication ready for next steps.`,
      className: "bg-green-50 border-green-200 text-green-900",
    };
  }

  if (status === "rejected") {
    return {
      title: "Not Selected",
      message:
        "Try to improve your skills and you can be selected next time. Keep applying consistently.",
      className: "bg-orange-50 border-orange-200 text-orange-900",
    };
  }

  return {
    title: "Under Review",
    message:
      "Your profile is still under review. Keep learning and prepare for upcoming opportunities.",
    className: "bg-blue-50 border-blue-200 text-blue-900",
  };
};

const index = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const user = useSelector(selectuser);
  const [data, setdata] = useState<ApplicationItem[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/application`);
        setdata(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchdata();
  }, []);

  const userapplication = useMemo(() => {
    const userEmail = String(user?.email || "").toLowerCase();
    const userName = String(user?.name || "").toLowerCase();

    return data.filter((app) => {
      const applicationEmail = String(app.user?.email || "").toLowerCase();
      const applicationName = String(app.user?.name || "").toLowerCase();

      if (userEmail && applicationEmail) {
        return applicationEmail === userEmail;
      }

      return userName && applicationName === userName;
    });
  }, [data, user]);

  const statusSummary = useMemo(() => {
    return userapplication.reduce(
      (acc, application) => {
        const status = normalizeStatus(application.status);
        acc.total += 1;

        if (status === "accepted") {
          acc.accepted += 1;
        } else if (status === "rejected") {
          acc.rejected += 1;
        } else {
          acc.pending += 1;
        }

        return acc;
      },
      { total: 0, accepted: 0, pending: 0, rejected: 0 }
    );
  }, [userapplication]);

  const filteredapplications = userapplication.filter((application) => {
    const searchmatch =
      String(application.company || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(application.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (filter === "all") return searchmatch;
    return searchmatch && normalizeStatus(application.status) === filter;
  });

  const modalMessage = selectedApplication
    ? getStatusMessage(selectedApplication)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job and internship applications
            </p>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setsearchTerm(e.target.value)}
                    placeholder="Search by company or category..."
                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="absolute top-3 left-3 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("accepted")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Selected
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company & Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applicant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applied Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredapplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredapplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag className="h-4 w-4 mr-1" />
                              {application.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.user?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.createdAt || 0).toISOString().split("T")[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsModalOpen(true);
                          }}
                          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-6 text-sm">
              <span className="inline-flex items-center gap-1 text-green-700">
                <CheckCircle2 size={14} /> {statusSummary.accepted} Selected
              </span>
              <span className="inline-flex items-center gap-1 text-yellow-700">
                <Clock3 size={14} /> {statusSummary.pending} Pending
              </span>
              <span className="inline-flex items-center gap-1 text-red-700">
                <XCircle size={14} /> {statusSummary.rejected} Rejected
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedApplication && modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Application Update</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`rounded-lg border p-4 ${modalMessage.className}`}>
              <p className="text-sm font-semibold mb-1">{modalMessage.title}</p>
              <p className="text-sm">{modalMessage.message}</p>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                Application: <span className="font-medium text-gray-900">{selectedApplication.company}</span>
              </p>
              <p>
                Category: <span className="font-medium text-gray-900">{selectedApplication.category || "N/A"}</span>
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default index;
