import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Keyboard as SkateRoom, LogOut, CalendarDays } from 'lucide-react';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Skate Room', icon: SkateRoom, path: '/skate-room' },
    { name: 'Sessions', icon: CalendarDays, path: '/sessions' }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (location.pathname === '/') return null; // Don't show navigation on login page

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        style={{ marginTop: '80px' }} // Added margin to move below the header
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900/90 backdrop-blur-xl border-r border-white/5 p-6 z-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={() => handleNavigate('/')}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navigation