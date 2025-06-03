'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { 
  HomeIcon, 
  ChartBarIcon, 
  MusicalNoteIcon, 
  SparklesIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/utils/auth';

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Music', href: '/dashboard/music', icon: MusicalNoteIcon },
    { name: 'AI', href: '/dashboard/ai', icon: SparklesIcon },
    { name: 'Community', href: '/dashboard/community', icon: UsersIcon },
    { name: 'Revenue', href: '/dashboard/revenue', icon: CurrencyDollarIcon },
    { name: 'Events', href: '/dashboard/events', icon: CalendarIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Desktop Navigation - Fixed overlap issue */}
      <nav className="hidden lg:block bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Fixed width to prevent overlap */}
            <div className="flex-shrink-0 w-48">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo-nal.png"
                  alt="Not a Label"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-white whitespace-nowrap">Not a Label</span>
              </Link>
            </div>

            {/* Navigation Links - Centered with proper spacing */}
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Sign Out - Right aligned */}
            <div className="flex-shrink-0 w-48 flex justify-end">
              <button
                onClick={() => signOut()}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Unchanged */}
      <nav className="lg:hidden bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo-nal.png"
                alt="Not a Label"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-white">Not a Label</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="mt-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${isActive 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Sign Out */}
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}