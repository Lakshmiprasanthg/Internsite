import axios from "axios";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/lib/apiBase";
import { useTranslation } from "react-i18next";
// const Applications = [
//   {
//     _id: "1",
//     company: "Tech Corp",
//     category: "Software",
//     user: { name: "John Doe", email: "john@example.com" },
//     createAt: "2024-03-10T12:00:00Z",
//     status: "approved",
//   },
//   {
//     _id: "2",
//     company: "Health Solutions",
//     category: "Healthcare",
//     user: { name: "Jane Smith", email: "jane@example.com" },
//     createAt: "2024-03-08T10:30:00Z",
//     status: "pending",
//   },
//   {
//     _id: "3",
//     company: "EduLearn",
//     category: "Education",
//     user: { name: "Alice Johnson", email: "alice@example.com" },
//     createAt: "2024-03-05T09:15:00Z",
//     status: "rejected",
//   },
// ];
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
const index = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setsearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [data, setdata] = useState<any>([]);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/application`);
        setdata(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);
  // console.log(data);
  const filteredapplications = data.filter((application: any) => {
    const searchmatch =
      String(application.company || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(application.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(application.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    if (filter === "all") return searchmatch;
    return searchmatch && normalizeStatus(application.status) === filter;
  });

  const formatDate = (dateValue: string | undefined) => {
    if (!dateValue) {
      return t("common.notAvailable", { defaultValue: "N/A" });
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return t("common.notAvailable", { defaultValue: "N/A" });
    }

    return parsed.toLocaleDateString(i18n.language || "en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const handleacceptandreject = async (id: any, action: any) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/application/${id}`,
        { action }
      );
      const updateappliacrtion = data.map((app: any) =>
        app._id === id ? res.data.data : app
      );
      setdata(updateappliacrtion);
      toast.success(t("common.success"));
    } catch (error) {
      console.log(error);
      toast.error(t("common.error"));
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{t("adminPanel.viewApplications")}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("applications.filter")}
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
                    placeholder={t("common.search")}
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
                  {t("applications.filterAll")}
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t("applications.filterPending")}
                </button>
                <button
                  onClick={() => setFilter("accepted")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t("applications.filterSelected")}
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t("applications.filterRejected")}
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
                    {t("applications.company")} & {t("applications.category")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("applications.position", { defaultValue: "Applicant" })}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("applications.appliedDate")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("applications.status")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("analytics.actions", { defaultValue: "Actions" })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredapplications.map((application: any) => (
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
                            {application.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(application.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {normalizeStatus(application.status) === "accepted"
                          ? t("applications.selected")
                          : normalizeStatus(application.status) === "rejected"
                          ? t("applications.notSelected")
                          : t("applications.filterPending")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/detailapplication/${application._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t("home.viewDetails")}
                        </Link>
                        <button
                          onClick={() => {
                            handleacceptandreject(application._id, "accepted");
                            /* Handle approve */
                          }}
                          disabled={normalizeStatus(application.status) === "accepted"}
                          className={`text-green-600 hover:text-green-900 ${
                            normalizeStatus(application.status) === "accepted"
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            handleacceptandreject(application._id, "rejected");
                            /* Handle reject */
                          }}
                          disabled={normalizeStatus(application.status) === "rejected"}
                          className={`text-red-600 hover:text-red-900 ${
                            normalizeStatus(application.status) === "rejected"
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
