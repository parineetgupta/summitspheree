"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Calendar, 
  Image as ImageIcon, 
  Award,
  Edit,
  Mountain,
  X
} from "lucide-react";

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Completed Treks', href: '/admin/completed-treks', icon: Map },
  { name: 'Future Treks', href: '/admin/future-treks', icon: Calendar },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Achievements', href: '/admin/achievements', icon: Award },
  { name: 'Settings', href: '/admin/settings', icon: Edit },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 left-0 transform lg:transform-none lg:relative w-64 bg-[#050505] border-r border-white/10 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
              <Mountain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-white">SummitSphere</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-inner shadow-white/5' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/30'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
