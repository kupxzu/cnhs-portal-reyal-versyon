import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Menu,
  X,
  ChevronUp,
  ChevronRight,
  BookOpen,
  ClipboardList,
  FileText,
  BarChart2,
  Calendar,
  UserCircle,
  Bell,
  GraduationCap,
  Users,
  Layers,
  Award,
  Megaphone,
  MapPin,
  Shield,
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'home',          label: 'HOME',          targetId: 'home' },
  { key: 'announcements', label: 'ANNOUNCEMENTS', targetId: 'announcements' },
  { key: 'portal',        label: 'PORTAL',        targetId: 'portal' },
  { key: 'strands',       label: 'STRANDS',       targetId: 'strands' },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    category: 'Enrollment',
    title: 'S.Y. 2026–2027 Online Enrollment Now Open',
    excerpt:
      'Online enrollment for incoming Grade 11 and continuing Grade 12 students is now open. Complete your requirements and submit documents through the portal before the deadline.',
    date: 'June 10, 2026',
    isNew: true,
  },
  {
    id: 2,
    category: 'Academic',
    title: '4th Quarter Report Cards Ready for Pickup',
    excerpt:
      "Report cards for the 4th quarter are available at the Registrar's Office. Students may also view and download their grades online via the student portal.",
    date: 'June 5, 2026',
    isNew: true,
  },
  {
    id: 3,
    category: 'Event',
    title: 'CNHS Recognition Day — June 28, 2026',
    excerpt:
      'The Annual Recognition Ceremony for outstanding students will be held at the school gymnasium. All awardees must report by 7:00 AM in prescribed school uniform.',
    date: 'May 30, 2026',
    isNew: false,
  },
  {
    id: 4,
    category: 'Reminder',
    title: 'Clearance Submission Deadline Extended to June 20',
    excerpt:
      'The deadline for submitting school clearance requirements has been extended. Please coordinate with your respective class advisers immediately.',
    date: 'May 25, 2026',
    isNew: false,
  },
];

const CALENDAR_EVENTS = [
  { date: 'Jun 20', label: 'Clearance Submission Deadline',     type: 'reminder'   },
  { date: 'Jun 28', label: 'Recognition Day Ceremony',          type: 'event'      },
  { date: 'Jul 7',  label: 'First Day of Classes, S.Y. 2026–27', type: 'academic'  },
  { date: 'Jul 14', label: 'Enrollment Deadline (Grade 12)',     type: 'enrollment' },
  { date: 'Aug 26', label: 'National Heroes Day (No Classes)',   type: 'holiday'    },
];

const STRANDS = [
  { key: 'stem',   code: 'STEM',   full: 'Science, Technology, Engineering & Mathematics', bg: '#1e3a8a', accent: '#93c5fd', students: 312 },
  { key: 'abm',    code: 'ABM',    full: 'Accountancy, Business & Management',              bg: '#14532d', accent: '#86efac', students: 248 },
  { key: 'humss',  code: 'HUMSS',  full: 'Humanities & Social Sciences',                   bg: '#4c1d95', accent: '#c4b5fd', students: 195 },
  { key: 'gas',    code: 'GAS',    full: 'General Academic Strand',                        bg: '#78350f', accent: '#fcd34d', students: 178 },
  { key: 'tvl',    code: 'TVL',    full: 'Technical-Vocational-Livelihood',                bg: '#134e4a', accent: '#5eead4', students: 220 },
  { key: 'sports', code: 'Sports', full: 'Sports Track',                                   bg: '#7f1d1d', accent: '#fca5a5', students: 94  },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryBadgeClass(category: string): string {
  switch (category) {
    case 'Enrollment': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    case 'Academic':   return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
    case 'Event':      return 'bg-purple-500/15 text-purple-700 border-purple-500/30';
    case 'Reminder':   return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
    default:           return 'bg-gray-200 text-gray-600 border-gray-300';
  }
}

function calendarDotClass(type: string): string {
  switch (type) {
    case 'enrollment': return 'bg-emerald-500';
    case 'academic':   return 'bg-blue-500';
    case 'event':      return 'bg-purple-500';
    case 'holiday':    return 'bg-red-400';
    case 'reminder':   return 'bg-amber-500';
    default:           return 'bg-gray-400';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const scrollRef = useRef<boolean>(false);

  const stats = [
    { value: '1,247', label: 'Enrolled Students', Icon: Users },
    { value: '48',    label: 'Class Sections',    Icon: Layers },
    { value: '6',     label: 'SHS Strands',       Icon: Award },
    { value: '2025–26', label: 'School Year',     Icon: GraduationCap },
  ];

  const features = [
    { key: 'grades',        title: 'View Grades',        description: 'Check quarterly and final grades per subject for each grading period.',          Icon: BarChart2   },
    { key: 'enrollment',    title: 'Enrollment Status',  description: 'Track your enrollment status and document submission requirements.',              Icon: ClipboardList },
    { key: 'records',       title: 'Request Records',    description: 'Request Form 137, Good Moral certificates, and other official documents.',        Icon: FileText    },
    { key: 'schedule',      title: 'Class Schedule',     description: 'View your weekly class schedule, room assignments, and subject teachers.',         Icon: Calendar    },
    { key: 'profile',       title: 'Student Profile',    description: 'Manage and update your personal information and academic profile.',                Icon: UserCircle  },
    { key: 'announcements', title: 'Announcements',      description: 'Stay updated with official school notices, events, and important reminders.',      Icon: Bell        },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    scrollRef.current = true;
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      const found = [...NAV_LINKS].reverse().find(({ targetId }) => {
        const el = document.getElementById(targetId);
        return el && el.getBoundingClientRect().top <= 150;
      });
      if (found) setActiveSection(found.key);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f3fa] text-[#00003c] overflow-x-hidden">

      {/* Watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] max-w-175 opacity-[0.025] pointer-events-none select-none z-0"
      />

      {/* ─── NAVBAR ─── */}
<nav className="sticky top-0 z-50 border-b border-[#00003c]/10 bg-white/92 backdrop-blur-md shadow-sm">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">

    {/* Brand */}
    <button onClick={() => scrollToSection('home')} className="flex items-center gap-3.5">
      <div className="h-11 w-11 rounded-full overflow-hidden border border-[#00003c]/15 shadow-sm shrink-0">
        <img src="/logo.png" alt="CNHS" className="h-full w-full object-cover" />
      </div>
      <div className="leading-none text-left">
        {/* Added hidden sm:block to hide on mobile */}
        <p className="hidden sm:block text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#00003c]/50 mb-0.5">
          Cagayan National High School
        </p>
        <p className="text-sm font-black tracking-[0.08em] uppercase text-[#00003c]">
          Senior High Portal
        </p>
      </div>
    </button>

    {/* Desktop nav */}
    <div className="hidden md:flex items-center gap-7 text-[13px] uppercase tracking-[0.18em] font-extrabold">
      {NAV_LINKS.map((item) => (
        <button
          key={item.key}
          onClick={() => scrollToSection(item.targetId)}
          className={`pb-0.5 border-b-2 transition-colors duration-200 ${
            activeSection === item.key
              ? 'border-[#00003c] text-[#00003c]'
              : 'border-transparent text-[#00003c]/45 hover:text-[#00003c]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>

    {/* Right */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 rounded-xl bg-[#00003c] px-5 py-2.5 text-[#ffe088] font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px"
      >
        <LogIn size={14} />
        <span className="hidden sm:inline">Student Login</span>
        <span className="sm:hidden">Login</span>
      </button>
      <button
        className="md:hidden rounded-xl border border-[#00003c]/20 bg-white p-2"
        onClick={() => setIsMobileMenuOpen(p => !p)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen
          ? <X size={18} className="text-[#00003c]" />
          : <Menu size={18} className="text-[#00003c]" />}
      </button>
    </div>
  </div>

  {/* Mobile drawer */}
  <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-72 border-t border-[#00003c]/10' : 'max-h-0'}`}>
    <div className="px-4 py-3 bg-white/95 space-y-1.5">
      {NAV_LINKS.map((item) => (
        <button
          key={item.key}
          onClick={() => scrollToSection(item.targetId)}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.16em] font-extrabold transition-colors ${
            activeSection === item.key
              ? 'bg-[#00003c] text-[#ffe088]'
              : 'text-[#00003c]/70 bg-[#f7f8fc] hover:bg-[#eef0f8]'
          }`}
        >
          {item.label}
        </button>
      ))}
      <button
        onClick={() => navigate('/login')}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00003c] py-3 text-[#ffe088] text-[11px] uppercase tracking-[0.14em] font-black mt-1"
      >
        <LogIn size={13} /> Student Login
      </button>
    </div>
  </div>
</nav>
      <main className="relative z-10">

        {/* ─── HERO ─── */}
        <section id="home" className="bg-[#00003c] text-white relative overflow-hidden">
          {/* Ambient glow circles */}
          <div className="absolute top-0 right-0 w-175 h-175 rounded-full bg-[#ffe088]/4 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-125 h-125 rounded-full bg-[#ffe088]/3 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 relative">
            <div className="grid lg:grid-cols-[1fr_400px] gap-14 items-center">

              {/* Left — Branding */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ffe088]/15 border border-[#ffe088]/30 px-4 py-1.5 text-[#ffe088] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffe088] inline-block" />
                  S.Y. 2025–2026 · Department of Education
                </div>

                <div className="flex items-start mb-7">
                  {/* Logo — fully visible on the left, fades to transparent toward the right */}
                  <div
                    className="shrink-0 w-44 h-44 sm:w-50 sm:h-50 relative z-0"
                    style={{
                      maskImage: 'linear-gradient(to right, black 38%, transparent 86%)',
                      WebkitMaskImage: 'linear-gradient(to right, black 38%, transparent 86%)',
                    }}
                  >
                    <img
                      src="/logo.png"
                      alt="CNHS Seal"
                      className="w-full h-full rounded-full object-cover border-2 border-[#ffe088]/35"
                    />
                  </div>
                  {/* Title overlaps the faded area naturally */}
                  <h1 className="relative z-10 -ml-10 sm:-ml-12 text-4xl sm:text-5xl xl:text-6xl font-black uppercase leading-none tracking-[0.02em] pt-1">
                    Cagayan<br />
                    <span className="text-[#ffe088]">National</span><br />
                    High School
                  </h1>
                </div>

                <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mb-9">
                  Welcome to the official{' '}
                  <strong className="text-white font-semibold">Senior High School Information Portal</strong>.
                  Access your grades, enrollment status, class schedule, and official documents — all in one place.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2.5 rounded-xl bg-[#ffe088] text-[#00003c] px-7 py-3.5 font-black uppercase tracking-widest text-sm hover:brightness-105 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
                  >
                    <LogIn size={16} />
                    Login to Portal
                  </button>
                  <button
                    onClick={() => scrollToSection('announcements')}
                    className="flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 font-semibold text-sm text-white/75 hover:bg-white/8 transition-all duration-200"
                  >
                    View Announcements
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Right — Stats + secure notice */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-white/8 border border-white/12 p-7">
                  <p className="text-[#ffe088] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-5">
                    School at a Glance
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map(({ value, label, Icon }, i) => (
                      <div key={i} className="rounded-xl bg-white/8 border border-white/10 p-4">
                        <div className="text-[#ffe088]/75 mb-2.5"><Icon size={18} /></div>
                        <p className="text-2xl font-black text-white leading-none">{value}</p>
                        <p className="text-[10px] text-white/45 font-semibold uppercase tracking-widest mt-1.5 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#ffe088]/10 border border-[#ffe088]/20 p-5 flex gap-3.5 items-start">
                  <div className="h-9 w-9 rounded-xl bg-[#ffe088]/15 border border-[#ffe088]/25 flex items-center justify-center shrink-0">
                    <Shield size={15} className="text-[#ffe088]" />
                  </div>
                  <div>
                    <p className="text-[#ffe088] text-[11px] font-extrabold uppercase tracking-widest mb-1">Secure Access</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      Accounts are managed by school administrators. Contact the Registrar's Office for login assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ANNOUNCEMENTS + SIDEBAR ─── */}
        <section id="announcements" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_310px] gap-10">

            {/* Announcements */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#00003c]/40 mb-2">Latest Updates</p>
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-[#00003c]">Announcements</h2>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#00003c]/40 uppercase tracking-[0.14em] hover:text-[#00003c] transition-colors"
                >
                  View All <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-4">
                {ANNOUNCEMENTS.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => navigate('/login')}
                    className="group rounded-xl bg-white border border-[#00003c]/8 shadow-[0_2px_16px_-6px_rgba(0,0,60,0.1)] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_rgba(0,0,60,0.15)] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${categoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                          {item.isNew && (
                            <span className="inline-flex items-center rounded-full bg-red-500/12 border border-red-400/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-red-600">
                              New
                            </span>
                          )}
                          <span className="text-[11px] text-[#00003c]/35 ml-auto shrink-0">{item.date}</span>
                        </div>
                        <h3 className="text-sm sm:text-[15px] font-black text-[#00003c] leading-snug mb-2">{item.title}</h3>
                        <p className="text-sm text-[#00003c]/55 leading-relaxed line-clamp-2">{item.excerpt}</p>
                      </div>
                      <ChevronRight size={15} className="text-[#00003c]/25 shrink-0 mt-1 group-hover:text-[#00003c]/50 transition-colors" />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Upcoming events */}
              <div className="rounded-xl bg-white border border-[#00003c]/8 shadow-[0_2px_16px_-6px_rgba(0,0,60,0.1)] p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-[#00003c] flex items-center justify-center shrink-0">
                    <Calendar size={14} className="text-[#ffe088]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#00003c]">Upcoming Events</p>
                    <p className="text-[10px] text-[#00003c]/40">June – August 2026</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {CALENDAR_EVENTS.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-12 text-center rounded-lg bg-[#f0f3fa] py-1.5 px-1">
                        <p className="text-[9px] font-extrabold text-[#00003c]/40 uppercase leading-none">{ev.date.split(' ')[0]}</p>
                        <p className="text-lg font-black text-[#00003c] leading-tight">{ev.date.split(' ')[1]}</p>
                      </div>
                      <div className="flex items-start gap-2 flex-1 pt-1">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${calendarDotClass(ev.type)}`} />
                        <p className="text-xs text-[#00003c]/65 leading-snug">{ev.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* School info */}
              <div className="rounded-xl bg-[#00003c] text-white p-6">
                <p className="text-[#ffe088] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-5">School Info</p>
                <div className="space-y-3.5 text-xs text-white/60">
                  <div className="flex items-start gap-3">
                    <MapPin size={13} className="text-[#ffe088]/70 shrink-0 mt-0.5" />
                    <p>Tuguegarao City, Cagayan, Philippines</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen size={13} className="text-[#ffe088]/70 shrink-0 mt-0.5" />
                    <p>Senior High School — Grade 11 &amp; 12</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Megaphone size={13} className="text-[#ffe088]/70 shrink-0 mt-0.5" />
                    <p>Registrar's Office: Mon – Fri, 8:00 AM – 5:00 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield size={13} className="text-[#ffe088]/70 shrink-0 mt-0.5" />
                    <p>DepEd Region II · SDO Cagayan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PORTAL FEATURES ─── */}
        <section id="portal" className="bg-[#00003c] relative overflow-hidden py-16 sm:py-24">
          <div className="absolute top-0 right-0 w-125 h-125 rounded-full bg-[#ffe088]/3 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-100 h-100 rounded-full bg-[#ffe088]/2 translate-y-1/2 pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
            <div className="text-center mb-14">
              <p className="text-[#ffe088] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">What's inside</p>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.04em] text-white">Portal Features</h2>
              <p className="mt-4 text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
                A full suite of academic tools built for students, faculty, and administrators of CNHS Senior High School.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ key, title, description, Icon }) => (
                <div
                  key={key}
                  className="rounded-xl bg-white/6 border border-white/10 p-7 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-12 w-12 rounded-xl bg-[#ffe088]/12 border border-[#ffe088]/20 text-[#ffe088] flex items-center justify-center mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.08em] text-white mb-2.5">{title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#ffe088] text-[#00003c] px-8 py-4 font-black uppercase tracking-widest text-sm hover:brightness-105 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              >
                <LogIn size={16} />
                Access Your Portal
              </button>
            </div>
          </div>
        </section>

        {/* ─── STRANDS ─── */}
        <section id="strands" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="mb-10">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#00003c]/40 mb-2">Academic Programs</p>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.04em] text-[#00003c] mb-3">SHS Strands Offered</h2>
            <p className="text-[#00003c]/50 text-sm max-w-lg leading-relaxed">
              CNHS Senior High School offers six strands across three academic tracks for S.Y. 2025–2026.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STRANDS.map(({ key, code, full, bg, accent, students }) => (
              <div
                key={key}
                className="rounded-xl overflow-hidden border border-[#00003c]/10 shadow-[0_4px_20px_-8px_rgba(0,0,60,0.1)] hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(0,0,60,0.18)] transition-all duration-200"
              >
                <div className="p-7" style={{ backgroundColor: bg }}>
                  <p className="text-3xl font-black tracking-[0.04em] mb-1.5" style={{ color: accent }}>{code}</p>
                  <p className="text-xs leading-snug font-medium" style={{ color: `${accent}bb` }}>{full}</p>
                </div>
                <div className="bg-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00003c]/45 text-[11px] font-bold uppercase tracking-widest">
                    <Users size={12} />
                    <span>{students.toLocaleString()} enrolled</span>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-[#00003c]/50 hover:text-[#00003c] transition-colors"
                  >
                    View <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 bg-[#00003c] text-white border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid md:grid-cols-[1fr_160px_160px] gap-10 pb-10 border-b border-white/10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0">
              <img src="/logo.png" alt="CNHS" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#ffe088]">CNHS Senior High</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Cagayan National High School</p>
                </div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed max-w-xs">
                DepEd-compliant academic portal for Senior High School records, enrollment, and school services.
              </p>
            </div>

            {/* Navigate */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ffe088] mb-4">Navigate</p>
              <div className="space-y-2.5 text-xs text-white/50">
                {NAV_LINKS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.targetId)}
                    className="block hover:text-[#ffe088] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Access */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ffe088] mb-4">Access</p>
              <div className="space-y-2.5 text-xs text-white/50">
                {['Student Login' , 'Privacy Policy'].map((label) => (
                  <button
                    key={label}
                    onClick={() => navigate('/login')}
                    className="block hover:text-[#ffe088] transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-white/25">
            <p>© {new Date().getFullYear()} Cagayan National High School. All rights reserved.</p>
            <p>DepEd Region II · SDO Cagayan</p>
          </div>
        </div>
      </footer>

      {/* ─── SCROLL TO TOP ─── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-7 right-7 z-50 h-12 w-12 rounded-full flex items-center justify-center bg-[#00003c] text-[#ffe088] border border-[#ffe088]/40 shadow-lg transition-all duration-300 hover:brightness-110 hover:scale-105 ${
          showScrollTop ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
        }`}
        title="Back to top"
      >
        <ChevronUp size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
