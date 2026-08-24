'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl">⚽</div>
            <div>
              <div className="font-bold text-2xl tracking-tighter text-white">SHEKO</div>
              <div className="text-[10px] text-emerald-400 -mt-1 font-mono">SPORTS</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-emerald-400 transition-colors">الرئيسية</Link>
            <Link href="/matches" className="hover:text-emerald-400 transition-colors">المباريات</Link>
            <Link href="/standings" className="hover:text-emerald-400 transition-colors">الترتيب</Link>
            <Link href="/transfers" className="hover:text-emerald-400 transition-colors">الانتقالات</Link>
            <Link href="/news" className="hover:text-emerald-400 transition-colors">الأخبار</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <div className="bg-zinc-900 border border-zinc-700 rounded-full flex items-center px-4 py-1.5 w-72 focus-within:w-80 transition-all">
                <Search className="w-4 h-4 text-zinc-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="ابحث عن لاعب، فريق، بطولة..." 
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-zinc-500"
                  onFocus={(e) => {
                    // Could open search modal in real app
                    console.log('Search focused');
                  }}
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-900 transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* Profile */}
            <div className="w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
              <User className="w-4 h-4" />
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 py-4 px-4 text-sm">
          <div className="flex flex-col gap-4">
            <Link href="/" className="py-2 px-4 hover:bg-zinc-900 rounded-xl">الرئيسية</Link>
            <Link href="/matches" className="py-2 px-4 hover:bg-zinc-900 rounded-xl">المباريات المباشرة</Link>
            <Link href="/standings" className="py-2 px-4 hover:bg-zinc-900 rounded-xl">الترتيب</Link>
            <Link href="/transfers" className="py-2 px-4 hover:bg-zinc-900 rounded-xl">مركز الانتقالات</Link>
            <Link href="/news" className="py-2 px-4 hover:bg-zinc-900 rounded-xl">الأخبار</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
