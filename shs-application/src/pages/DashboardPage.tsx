import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Skeleton } from '@/components/ui';
import { adminApi } from '@/lib/api';
import { 
  PersonIcon, 
  ReaderIcon, 
  IdCardIcon, 
  StackIcon,
  ArrowRightIcon,
} from '@radix-ui/react-icons';
import type { User, UserRole } from '@/types';

function getCollection<T>(payload: unknown, key?: string): T[] {
  const data = payload as Record<string, unknown> | undefined;
  if (Array.isArray(payload)) return payload as T[];

  const fromKey = key ? data?.[key] as Record<string, unknown> | undefined : undefined;
  const fromKeyList = fromKey?.data;

  if (Array.isArray(fromKeyList)) return fromKeyList as T[];
  if (Array.isArray(data?.data)) return data?.data as T[];
  if (key && Array.isArray(data?.[key])) return data?.[key] as T[];
  return [];
}

function getCollectionTotal(payload: unknown, key?: string): number {
  const data = payload as Record<string, unknown> | undefined;
  const fromKey = key ? data?.[key] as Record<string, unknown> | undefined : undefined;

  const fromKeyTotal = Number(fromKey?.total);
  if (!Number.isNaN(fromKeyTotal) && fromKeyTotal > 0) return fromKeyTotal;

  const directTotal = Number(data?.total);
  if (!Number.isNaN(directTotal) && directTotal > 0) return directTotal;

  return getCollection(payload, key).length;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  color: 'indigo' | 'green' | 'orange' | 'blue';
  isLoading?: boolean;
}

function StatCard({ title, value, icon, href, color, isLoading = false }: StatCardProps) {
  const colorStyles = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
      {href && (
        <div className="flex items-center gap-1 text-indigo-600 text-sm mt-4">
          <span>View all</span>
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      )}
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

// Admin Dashboard
function AdminDashboard() {
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['dashboard', 'admin', 'students'],
    queryFn: async () => (await adminApi.getStudents({ page: 1 })).data,
  });

  const { data: tracksData, isLoading: tracksLoading } = useQuery({
    queryKey: ['dashboard', 'admin', 'tracks'],
    queryFn: async () => (await adminApi.getTracks()).data,
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['dashboard', 'admin', 'student-tracks'],
    queryFn: async () => (await adminApi.getStudentTracks()).data,
  });

  const { data: trackStrandsData, isLoading: trackStrandsLoading } = useQuery({
    queryKey: ['dashboard', 'admin', 'track-strands'],
    queryFn: async () => (await adminApi.getTrackStrands()).data,
  });

  const { data: buildingsData } = useQuery({
    queryKey: ['dashboard', 'admin', 'buildings'],
    queryFn: async () => (await adminApi.getBuildings()).data,
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['dashboard', 'admin', 'sections'],
    queryFn: async () => (await adminApi.getSections()).data,
  });

  const { data: roomsData } = useQuery({
    queryKey: ['dashboard', 'admin', 'rooms'],
    queryFn: async () => (await adminApi.getRooms()).data,
  });

  const totalStudents = getCollectionTotal(studentsData, 'students');
  const totalTracks = getCollectionTotal(tracksData, 'tracks');
  const totalEnrollments = getCollectionTotal(enrollmentsData, 'student_tracks');
  const totalTrackStrands = getCollectionTotal(trackStrandsData, 'track_strands');

  const totalBuildings = getCollectionTotal(buildingsData, 'buildings');
  const totalSections = getCollectionTotal(sectionsData, 'sections');
  const totalRooms = getCollectionTotal(roomsData, 'rooms');

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<PersonIcon className="w-6 h-6" />}
          color="indigo"
          href="/students"
          isLoading={studentsLoading}
        />
        <StatCard
          title="Active Tracks"
          value={totalTracks}
          icon={<ReaderIcon className="w-6 h-6" />}
          color="green"
          href="/tracks"
          isLoading={tracksLoading}
        />
        <StatCard
          title="Enrollments"
          value={totalEnrollments}
          icon={<IdCardIcon className="w-6 h-6" />}
          color="orange"
          href="/enrollments"
          isLoading={enrollmentsLoading}
        />
        <StatCard
          title="Track-Strands"
          value={totalTrackStrands}
          icon={<StackIcon className="w-6 h-6" />}
          color="blue"
          href="/track-strands"
          isLoading={trackStrandsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Quick Actions" 
            description="Common administrative tasks"
          />
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/students"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <PersonIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">Add Student</p>
            </Link>
            <Link 
              to="/enrollments"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <IdCardIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">New Enrollment</p>
            </Link>
            <Link 
              to="/tracks"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <ReaderIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">Manage Tracks</p>
            </Link>
            <Link 
              to="/tsbsrs"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <StackIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">Manage TSBSR</p>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="System Overview" 
            description="Current system status"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">School Year</span>
              <span className="text-sm font-medium">2026-2027</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Enrollment Status</span>
              <span className="text-sm font-medium text-green-600">Open</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Buildings</span>
              <span className="text-sm font-medium">{totalBuildings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Sections</span>
              <span className="text-sm font-medium">{totalSections}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Rooms</span>
              <span className="text-sm font-medium">{totalRooms}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Registrar Dashboard
function RegistrarDashboard() {
  return (
    <DashboardLayout title="Registrar Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<PersonIcon className="w-6 h-6" />}
          color="indigo"
          href="/students"
        />
        <StatCard
          title="Pending Enrollments"
          value="45"
          icon={<IdCardIcon className="w-6 h-6" />}
          color="orange"
          href="/enrollments"
        />
        <StatCard
          title="Active Enrollments"
          value="987"
          icon={<IdCardIcon className="w-6 h-6" />}
          color="green"
          href="/enrollments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Quick Actions" 
            description="Common registrar tasks"
          />
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/students/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <PersonIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">Add Student</p>
            </Link>
            <Link 
              to="/enrollments/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <IdCardIcon className="w-6 h-6 mx-auto text-indigo-600" />
              <p className="text-sm font-medium mt-2">New Enrollment</p>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="Recent Activity" 
            description="Latest enrollment activities"
          />
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-4">
              No recent activity to display.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Teacher Dashboard
function TeacherDashboard() {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Students"
          value="156"
          icon={<PersonIcon className="w-6 h-6" />}
          color="indigo"
          href="/students"
        />
        <StatCard
          title="Track-Strands"
          value="30"
          icon={<StackIcon className="w-6 h-6" />}
          color="blue"
          href="/track-strands"
        />
      </div>

      <Card>
        <CardHeader 
          title="Student List" 
          description="View and search students"
        />
        <p className="text-sm text-gray-500 text-center py-8">
          Use the Students menu to view and search student records.
        </p>
      </Card>
    </DashboardLayout>
  );
}

// Student Dashboard
function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader 
              title="Welcome Back!" 
              description="Here's your academic overview"
            />
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">Current School Year</p>
                <p className="text-lg font-semibold text-indigo-900">2026-2027</p>
              </div>
              <Link 
                to="/my-enrollments"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">My Enrollments</p>
                    <p className="text-sm text-gray-500">View your track and strand assignments</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
              <Link 
                to="/profile"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">My Profile</p>
                    <p className="text-sm text-gray-500">Update your personal information</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Profile" />
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">
                  {(user as { username?: string })?.username?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <p className="font-semibold">{(user as { username?: string })?.username || 'Student'}</p>
              <p className="text-sm text-gray-500">{(user as { email?: string })?.email}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {(user as { id_number?: string })?.id_number}</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Main Dashboard Component - routes to appropriate dashboard
export function DashboardPage() {
  const { user, userType, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType === 'admin') {
    return <AdminDashboard />;
  }

  if (userType === 'user') {
    const role = (user as User)?.role as UserRole;
    if (role === 'registrar') {
      return <RegistrarDashboard />;
    }
    if (role === 'teacher') {
      return <TeacherDashboard />;
    }
  }

  if (userType === 'student') {
    return <StudentDashboard />;
  }

  return <Navigate to="/login" replace />;
}
