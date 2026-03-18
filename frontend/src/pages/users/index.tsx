import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBase";
import { CheckCircle2, Clock3, Mail, Search, User, XCircle } from "lucide-react";

type Application = {
  _id: string;
  status: "accepted" | "pending" | "rejected";
  user?: {
    name?: string;
    email?: string;
    photo?: string;
  };
};

type UserSummary = {
  key: string;
  name: string;
  email: string;
  photo?: string;
  totalApplications: number;
  accepted: number;
  pending: number;
  rejected: number;
};

const UsersPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/application`);
        setApplications(response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const users = useMemo(() => {
    const map = new Map<string, UserSummary>();

    applications.forEach((application) => {
      const email = application.user?.email || "no-email";
      const name = application.user?.name || "Unknown User";
      const key = `${email}-${name}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          email: application.user?.email || "Not provided",
          photo: application.user?.photo,
          totalApplications: 0,
          accepted: 0,
          pending: 0,
          rejected: 0,
        });
      }

      const current = map.get(key)!;
      current.totalApplications += 1;

      if (application.status === "accepted") {
        current.accepted += 1;
      } else if (application.status === "rejected") {
        current.rejected += 1;
      } else {
        current.pending += 1;
      }
    });

    return Array.from(map.values());
  }, [applications]);

  const filteredUsers = users.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-sm text-gray-500 mt-1">
              Users are summarized from application records.
            </p>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-10 text-gray-500">No user records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Accepted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rejected
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((item) => (
                    <tr key={item.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={18} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={12} /> {item.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {item.totalApplications}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-700">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={14} /> {item.accepted}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-700">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={14} /> {item.pending}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-red-700">
                        <span className="inline-flex items-center gap-1">
                          <XCircle size={14} /> {item.rejected}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
