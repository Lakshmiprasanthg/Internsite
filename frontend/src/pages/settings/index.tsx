import React, { useEffect, useState } from "react";
import { Save, Server, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "internsite_admin_settings";

type AdminSettings = {
  adminEmail: string;
  defaultLanding: "/applications" | "/users" | "/analytics";
  notificationsEnabled: boolean;
  compactTables: boolean;
};

const defaultSettings: AdminSettings = {
  adminEmail: "",
  defaultLanding: "/applications",
  notificationsEnabled: true,
  compactTables: false,
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success(t("settings.saved", { defaultValue: "Settings saved" }));
    } catch (error) {
      console.error(error);
      toast.error(t("settings.saveError", { defaultValue: "Could not save settings" }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("adminPanel.settings")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("settings.configure", { defaultValue: "Configure admin panel preferences." })}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-blue-600" />
              {t("settings.panelPreferences", { defaultValue: "Panel Preferences" })}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("settings.browserSaved", {
                defaultValue:
                  "These settings are saved in your browser for this admin session.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.adminContactEmail", { defaultValue: "Admin contact email" })}
              </label>
              <input
                value={settings.adminEmail}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, adminEmail: event.target.value }))
                }
                placeholder={t("settings.adminEmailPlaceholder", { defaultValue: "admin@company.com" })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.defaultLanding", { defaultValue: "Default admin landing page" })}
              </label>
              <select
                value={settings.defaultLanding}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultLanding: event.target.value as AdminSettings["defaultLanding"],
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="/applications">{t("adminPanel.viewApplications")}</option>
                <option value="/users">{t("adminPanel.manageUsers")}</option>
                <option value="/analytics">{t("adminPanel.analytics")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationsEnabled: event.target.checked,
                  }))
                }
              />
              {t("settings.enableNotifications", { defaultValue: "Enable admin notifications" })}
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.compactTables}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    compactTables: event.target.checked,
                  }))
                }
              />
              {t("settings.compactRows", { defaultValue: "Use compact table rows" })}
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {isSaving
              ? t("settings.saving", { defaultValue: "Saving..." })
              : t("settings.saveSettings", { defaultValue: "Save Settings" })}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Server size={18} className="text-indigo-600" />
            {t("settings.deploymentReminder", { defaultValue: "Deployment Reminder" })}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t("settings.deploymentText", {
              defaultValue:
                "Server-level values such as CORS origins, admin credentials, and Firebase keys must be updated in Render/Vercel environment variables, not from this page.",
            })}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700">
            <ShieldCheck size={14} />
            {t("settings.keepSecrets", { defaultValue: "Keep secrets in env vars only" })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
