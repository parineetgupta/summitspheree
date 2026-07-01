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
  Mountain
} from "lucide-react";

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Completed Treks', href: '/admin/completed-treks', icon: Map },
  { name: 'Future Treks', href: '/admin/future-treks', icon: Calendar },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Achievements', href: '/admin/achievements', icon: Award },
  { name: 'Settings', href: '/admin/settings', icon: Edit },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#050505] border-r border-white/10 flex flex-col shrink-0 relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
            <Mountain className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-white">SummitSphere</span>
        </Link>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
  );
}
