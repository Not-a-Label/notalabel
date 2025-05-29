'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, FaMusic, FaChartLine, FaUsers, FaMicrophone,
  FaGraduationCap, FaStore, FaMobileAlt, FaBrain,
  FaUserCircle, FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaRocket, FaHandshake, FaBroadcastTower, FaBookOpen
} from 'react-icons/fa';

export default function DashboardNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FaHome },
    { href: '/dashboard/music', label: 'My Music', icon: FaMusic },
    { href: '/dashboard/analytics', label: 'Analytics', icon: FaChartLine },
    { href: '/dashboard/collaboration', label: 'Collaborate', icon: FaUsers },
    { href: '/dashboard/live', label: 'Live Performance', icon: FaMicrophone },
    { href: '/dashboard/education', label: 'Learn', icon: FaGraduationCap },
    { href: '/dashboard/marketplace', label: 'Marketplace', icon: FaStore },
    { href: '/dashboard/mobile', label: 'Mobile Studio', icon: FaMobileAlt },
    { href: '/dashboard/ai-production', label: 'AI Production', icon: FaBrain },
  ];

  const userNavItems = [
    { href: '/dashboard/profile', label: 'Profile', icon: FaUserCircle },
    { href: '/dashboard/settings', label: 'Settings', icon: FaCog },
  ];

  const publicFeatures = [
    { href: '/discover', label: 'Discover Artists', icon: FaRocket },
    { href: '/collaborate', label: 'Find Collaborators', icon: FaHandshake },
    { href: '/live', label: 'Live Shows', icon: FaBroadcastTower },
    { href: '/learn', label: 'Music Education', icon: FaBookOpen },
  ];

  const isActive = (href: string) => pathname === href;
  const activeClass = "bg-purple-100 text-purple-700 font-medium";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-col w-64 bg-white shadow-lg h-screen sticky top-0">
        <div className="p-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <FaMusic className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold">Not a Label</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Features */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Features
            </h3>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive(item.href) ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Public Features */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Explore
            </h3>
            <div className="space-y-1">
              {publicFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive(item.href) ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="space-y-1">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive(item.href) ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-red-600 hover:bg-red-50 w-full text-left"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pro Upgrade Banner */}
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
            <h4 className="font-semibold mb-2">Upgrade to Pro</h4>
            <p className="text-sm mb-3 opacity-90">
              Unlock all features and grow your music career
            </p>
            <Link
              href="/pricing"
              className="block w-full bg-white text-purple-600 text-center py-2 rounded font-medium hover:bg-gray-100 transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="flex items-center justify-between p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <FaMusic className="text-white text-sm" />
              </div>
              <span className="text-lg font-bold">Not a Label</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="fixed left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-20 pb-6">
                {/* Main Features */}
                <div className="px-4 mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Main Features
                  </h3>
                  <div className="space-y-1">
                    {mainNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive(item.href) ? activeClass : inactiveClass
                          }`}
                        >
                          <Icon className="text-lg" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Public Features */}
                <div className="px-4 mb-6 border-t pt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Explore
                  </h3>
                  <div className="space-y-1">
                    {publicFeatures.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive(item.href) ? activeClass : inactiveClass
                          }`}
                        >
                          <Icon className="text-lg" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* User Section */}
                <div className="px-4 mb-6 border-t pt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Account
                  </h3>
                  <div className="space-y-1">
                    {userNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive(item.href) ? activeClass : inactiveClass
                          }`}
                        >
                          <Icon className="text-lg" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Pro Upgrade Banner */}
                <div className="px-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
                    <h4 className="font-semibold mb-2">Upgrade to Pro</h4>
                    <p className="text-sm mb-3 opacity-90">
                      Unlock all features
                    </p>
                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full bg-white text-purple-600 text-center py-2 rounded font-medium"
                    >
                      View Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}