import { useState } from 'react';
import { HamburgerMenuIcon, GearIcon, Cross2Icon } from '@radix-ui/react-icons';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = 'Dashboard', onMenuClick }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States para sa editable inputs
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [schoolInfo, setSchoolInfo] = useState({
    location: 'Tuguegarao City, Cagayan, Philippines',
    level: 'Senior High School – Grade 11 & 12',
    officeHours: "Registrar's Office: Mon – Fri, 8:00 AM – 5:00 PM",
    region: 'DepEd Region II · SDO Cagayan',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <>
      <header 
        className="fixed top-0 right-0 left-0 lg:left-(--sidebar-width) bg-white/90 backdrop-blur-md border-b border-blue-100 flex items-center justify-between px-4 sm:px-6 z-20"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-blue-50 rounded-lg"
            aria-label="Open menu"
          >
            <HamburgerMenuIcon className="w-5 h-5 text-blue-800" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Steady (No Blinking) Premium Global Settings Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Global Settings"
          >
            <GearIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Global Settings</span>
          </button>
        </div>
      </header>

      {/* --- GLOBAL SETTINGS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          
          {/* Maluwag at Magandang Modal Container na may smooth Entry Animation */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 opacity-100 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Custom Modern Header (Kapareho sa layout ng picture) */}
            <div className="p-6 pb-2 relative">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>

              {/* Glowing Gradient Banner sa loob ng Header */}
              <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-4 rounded-xl flex items-center gap-3 shadow-lg shadow-blue-900/20 border border-blue-700/30">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                  <GearIcon className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Global Settings</h3>
                  <p className="text-xs text-blue-200/80">Configure system-wide academic and institutional records</p>
                </div>
              </div>
            </div>

            {/* Maluwag na Form Body */}
            <form onSubmit={handleSave} className="p-6 pt-2 space-y-6">
              
              {/* --- SCHOOL YEAR SECTION --- */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                  School Year
                </label>
                <div className="relative">
                  <select
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium pl-1">Select active school year</p>
              </div>

              <div className="border-t border-slate-100 my-4" />

              {/* --- SCHOOL INFORMATION SECTION --- */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  School Information
                </h4>
                
                {/* Location / Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">Location / Address</label>
                  <input 
                    type="text" 
                    value={schoolInfo.location}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 pl-1">Location / City, Cagayan, Philippines</p>
                </div>

                {/* School Level */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">School Level</label>
                  <input 
                    type="text" 
                    value={schoolInfo.level}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, level: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 pl-1">Senior high School – Grade 11 & 12</p>
                </div>

                {/* Office Hours */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">Office Hours</label>
                  <input 
                    type="text" 
                    value={schoolInfo.officeHours}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, officeHours: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 pl-1">Registrar's Office: Mon – Fri, 8:00 AM – 5:00 PM</p>
                </div>

                {/* DepEd Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">DepEd Details</label>
                  <input 
                    type="text" 
                    value={schoolInfo.region}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* --- ACTION BUTTONS --- */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
} 