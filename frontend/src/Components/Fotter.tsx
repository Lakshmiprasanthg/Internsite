import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import logo from "../Assets/67_human_logo.jpg";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const internshipItems = [
    t("footer.internshipsByLocation", { defaultValue: "By Location" }),
    t("footer.internshipsByCategory", { defaultValue: "By Category" }),
    t("footer.internshipsEngineering", { defaultValue: "Engineering" }),
    t("footer.internshipsDesign", { defaultValue: "Design" }),
    t("footer.internshipsMarketing", { defaultValue: "Marketing" }),
    t("footer.internshipsDataScience", { defaultValue: "Data Science" }),
  ];

  const jobItems = [
    t("footer.jobsFullTime", { defaultValue: "Full Time" }),
    t("footer.jobsPartTime", { defaultValue: "Part Time" }),
    t("footer.jobsRemote", { defaultValue: "Remote" }),
    t("footer.jobsStartups", { defaultValue: "Startups" }),
    t("footer.jobsMncs", { defaultValue: "MNCs" }),
    t("footer.jobsGovernment", { defaultValue: "Government" }),
  ];

  const employerItems = [
    t("footer.employersPostInternship", { defaultValue: "Post Internship" }),
    t("footer.employersPostJob", { defaultValue: "Post Job" }),
    t("footer.employersAccessDatabase", { defaultValue: "Access Database" }),
    t("footer.employersPricing", { defaultValue: "Pricing" }),
    t("footer.employersContactUs", { defaultValue: "Contact Us" }),
  ];

  const resourceItems = [
    t("footer.resourcesBlog", { defaultValue: "Blog" }),
    t("footer.resourcesCareerAdvice", { defaultValue: "Career Advice" }),
    t("footer.resourcesInterviewTips", { defaultValue: "Interview Tips" }),
    t("footer.resourcesResumeBuilder", { defaultValue: "Resume Builder" }),
    t("footer.resourcesSuccessStories", { defaultValue: "Success Stories" }),
  ];

  const companyItems = [
    t("footer.companyAboutUs", { defaultValue: "About Us" }),
    t("footer.companyTeam", { defaultValue: "Team" }),
    t("footer.companyCareers", { defaultValue: "Careers" }),
    t("footer.companyPressKit", { defaultValue: "Press Kit" }),
    t("footer.companyContact", { defaultValue: "Contact" }),
  ];

  const legalItems = [
    t("footer.legalPrivacy", { defaultValue: "Privacy Policy" }),
    t("footer.legalTerms", { defaultValue: "Terms of Service" }),
    t("footer.legalCookie", { defaultValue: "Cookie Policy" }),
    t("footer.legalSitemap", { defaultValue: "Sitemap" }),
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Top Section - Brand & Newsletter */}
        <div className="mb-12 pb-12 border-b border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logo.src} 
                  alt={t("footer.logoAlt", { defaultValue: "InternSite Logo" })}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold">InternSite</span>
              </div>
              <p className="text-gray-400 max-w-md">
                {t("footer.tagline", {
                  defaultValue:
                    "Connecting talented students with amazing opportunities. Your gateway to internships and jobs at top companies.",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.subscribe", { defaultValue: "Subscribe to our newsletter" })}</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("auth.email")}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                  {t("footer.subscribeButton", { defaultValue: "Subscribe" })}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <FooterSection 
            title={t("navbar.internships")}
            items={internshipItems}
          />
          <FooterSection 
            title={t("navbar.jobs")}
            items={jobItems}
          />
          <FooterSection 
            title={t("footer.forEmployers", { defaultValue: "For Employers" })}
            items={employerItems}
            links 
          />
          <FooterSection 
            title={t("footer.resources", { defaultValue: "Resources" })}
            items={resourceItems}
            links 
          />
          <FooterSection 
            title={t("footer.company", { defaultValue: "Company" })}
            items={companyItems}
            links 
          />
          <FooterSection 
            title={t("footer.legal", { defaultValue: "Legal" })}
            items={legalItems}
            links 
          />
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* App Download */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 px-5 py-3 rounded-xl transition-colors duration-200 border border-gray-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">{t("footer.getItOn", { defaultValue: "GET IT ON" })}</div>
                  <div className="text-sm font-semibold">{t("footer.googlePlay", { defaultValue: "Google Play" })}</div>
                </div>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{t("footer.followUs", { defaultValue: "Follow us:" })}</span>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400">
              {t("footer.copyright", { defaultValue: "© 2026 InternSite. All rights reserved." })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, items, links }: any) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      <div className="flex flex-col items-start space-y-3">
        {items.map((item: any, index: any) =>
          links ? (
            <Link 
              key={index} 
              href="/" 
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
            >
              {item}
            </Link>
          ) : (
            <p 
              key={index} 
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer text-sm"
            >
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}