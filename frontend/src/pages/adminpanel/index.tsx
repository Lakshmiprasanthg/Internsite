import React from 'react'
import { 
  Briefcase, 
  Mail, 
  Send,
  Users,
  BarChart,
  Settings
} from 'lucide-react';
import Link from 'next/link';
const index = () => {
    const stats = [
        { label: 'Total Applications', value: '2,345', change: '+12%', changeType: 'positive' },
        { label: 'Active Jobs', value: '45', change: '+3%', changeType: 'positive' },
        { label: 'Active Internships', value: '89', change: '+24%', changeType: 'positive' },
        { label: 'Conversion Rate', value: '5.25%', change: '-1.3%', changeType: 'negative' },
      ];
    
      const menuItems = [
        {
          title: 'View Applications',
          description: 'View and manage all applications from candidates',
          icon: Mail,
          link: '/applications',
          color: 'bg-blue-600',
        },
        {
          title: 'Post Job',
          description: 'Create and publish new job opportunities',
          icon: Briefcase,
          link: '/postJob',
          color: 'bg-green-600',
        },
        {
          title: 'Post Internship',
          description: 'Create and manage internship positions',
          icon: Send,
          link: '/postInternship',
          color: 'bg-purple-600',
        },
        {
          title: 'Manage Users',
          description: 'View and manage user accounts',
          icon: Users,
          link: '/users',
          color: 'bg-orange-600',
        },
        {
          title: 'Analytics',
          description: 'View detailed reports and statistics',
          icon: BarChart,
          link: '/analytics',
          color: 'bg-red-600',
        },
        {
          title: 'Settings',
          description: 'Configure system preferences',
          icon: Settings,
          link: '/settings',
          color: 'bg-gray-600',
        },
      ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your jobs, internships, and applications efficiently
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
          >
            <div className="p-8">
              <div className="flex items-start space-x-4">
                <div className={`${item.color} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
  )
}

export default index