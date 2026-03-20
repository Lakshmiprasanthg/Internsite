import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBase";
import { useTranslation } from "react-i18next";

export default function SvgSlider() {
  const { t } = useTranslation();
  const categories = [
    t("home.categoryBigBrands", { defaultValue: "Big Brands" }),
    t("home.categoryWorkFromHome", { defaultValue: "Work From Home" }),
    t("home.categoryPartTime", { defaultValue: "Part-time" }),
    t("home.categoryMBA", { defaultValue: "MBA" }),
    t("home.categoryEngineering", { defaultValue: "Engineering" }),
    t("home.categoryMedia", { defaultValue: "Media" }),
    t("home.categoryDesign", { defaultValue: "Design" }),
    t("home.categoryDataScience", { defaultValue: "Data Science" }),
  ];
  // const internships = [
  //   {
  //     _id: "1",
  //     title: "Software Engineering Intern",
  //     company: "Google",
  //     location: "Remote",
  //     stipend: "$1,500/month",
  //     duration: "3 months",
  //     category: "Engineering",
  //   },
  //   {
  //     _id: "2",
  //     title: "Marketing Intern",
  //     company: "Meta",
  //     location: "New York",
  //     stipend: "$1,200/month",
  //     duration: "6 months",
  //     category: "Media",
  //   },
  //   {
  //     _id: "3",
  //     title: "Graphic Design Intern",
  //     company: "Adobe",
  //     location: "San Francisco",
  //     stipend: "$1,000/month",
  //     duration: "4 months",
  //     category: "Design",
  //   },
  // ];

  // const jobs = [
  //   {
  //     _id: "101",
  //     title: "Frontend Developer",
  //     company: "Amazon",
  //     location: "Seattle",
  //     CTC: "$100K/year",
  //     Experience: "2+ years",
  //     category: "Engineering",
  //   },
  //   {
  //     _id: "102",
  //     title: "Data Analyst",
  //     company: "Microsoft",
  //     location: "Remote",
  //     CTC: "$90K/year",
  //     Experience: "1+ years",
  //     category: "Data Science",
  //   },
  //   {
  //     _id: "103",
  //     title: "UX Designer",
  //     company: "Apple",
  //     location: "California",
  //     CTC: "$110K/year",
  //     Experience: "3+ years",
  //     category: "Design",
  //   },
  // ];
  const slides = [
    {
      pattern: "pattern-1",
      title: t("home.slideCareer", { defaultValue: "Start Your Career Journey" }),
      bgColor: "bg-indigo-600",
    },
    {
      pattern: "pattern-2",
      title: t("home.slideLearn", { defaultValue: "Learn From The Best" }),
      bgColor: "bg-blue-600",
    },
    {
      pattern: "pattern-3",
      title: t("home.slideGrow", { defaultValue: "Grow Your Skills" }),
      bgColor: "bg-purple-600",
    },
    {
      pattern: "pattern-4",
      title: t("home.slideConnect", { defaultValue: "Connect With Top Companies" }),
      bgColor: "bg-teal-600",
    },
  ];

  const stats = [
    { number: "300K+", label: t("home.statCompaniesHiring", { defaultValue: "companies hiring" }) },
    { number: "10K+", label: t("home.statOpeningsDaily", { defaultValue: "new openings everyday" }) },
    { number: "21Mn+", label: t("home.statActiveStudents", { defaultValue: "active students" }) },
    { number: "600K+", label: t("home.statLearners", { defaultValue: "learners" }) },
  ];
  const [internships, setinternship] = useState<any>([]);
  const [jobs, setjob] = useState<any>([]);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [internshipres, jobres] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/internship`),
          axios.get(`${API_BASE_URL}/api/job`),
        ]);
        setinternship(internshipres.data);
        setjob(jobres.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const filteredInternships = internships.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );
  const filteredJobs = jobs.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* hero section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t("home.hero")}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-3">
            {t("home.heroDesc")}
          </p>
          <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
            <span className="text-2xl">🔥</span>
            <span className="text-lg">{t("home.trending")}</span>
          </div>
        </div>
        
        {/* Swiper section */}
        <div className="mb-20">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[400px] ${slide.bgColor}`}>
                {/* SVG Pattern Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {slide.pattern === "pattern-1" && (
                      <pattern
                        id="pattern-1"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="10" cy="10" r="3" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-2" && (
                      <pattern
                        id="pattern-2"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect
                          x="15"
                          y="15"
                          width="10"
                          height="10"
                          fill="white"
                        />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-3" && (
                      <pattern
                        id="pattern-3"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-4" && (
                      <pattern
                        id="pattern-4"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="white" />
                      </pattern>
                    )}
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill={`url(#${slide.pattern})`}
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-white">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Category section */}
      <div className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {t("home.internships")} <span className="text-blue-600">InternSite</span>
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("home.categories")}
            </span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* INternship grid   */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredInternships.map((internship: any, index: any) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-2 border border-gray-100"
          >
            <div className="flex items-center gap-2 text-green-600 mb-4 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
              <ArrowUpRight size={18} />
              <span className="font-semibold text-sm">
                {t("detail.activelyHiring", { defaultValue: "Actively Hiring" })}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {internship.title}
            </h3>
            <p className="text-gray-600 font-medium mb-5">{internship.company}</p>
            <div className="space-y-3.5 text-gray-600 mb-6">
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <MapPin size={18} className="text-blue-600" />
                <span className="text-sm">{internship.location}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <Banknote size={18} className="text-green-600" />
                <span className="text-sm font-medium">{internship.stipend}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <Calendar size={18} className="text-purple-600" />
                <span className="text-sm">{internship.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                {t("home.internships")}
              </span>
              <Link
                href={`/detailiternship/${internship._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group-hover:gap-2 transition-all"
              >
                {t("home.viewDetails")}
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* Jobs grid   */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          <span className="text-indigo-600">{t("home.jobs")}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job: any, index: any) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className="flex items-center gap-2 text-green-600 mb-4 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                <ArrowUpRight size={18} />
                <span className="font-semibold text-sm">
                  {t("detail.activelyHiring", { defaultValue: "Actively Hiring" })}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium mb-5">{job.company}</p>
              <div className="space-y-3.5 text-gray-600 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                  <Banknote size={18} className="text-green-600" />
                  <span className="text-sm font-medium">{job.CTC}</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                  <Calendar size={18} className="text-purple-600" />
                  <span className="text-sm">{job.Experience}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                  {t("home.jobs")}
                </span>
                <Link
                  href={`/detailjob/${job._id}`}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold group-hover:gap-2 transition-all"
                >
                  {t("home.viewDetails")}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stat Section  */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          {t("home.impactNumbers", { defaultValue: "Our Impact in Numbers" })}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-5xl font-extrabold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-blue-100 text-lg font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
