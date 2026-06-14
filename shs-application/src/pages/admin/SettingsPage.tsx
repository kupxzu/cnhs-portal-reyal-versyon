import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader
            title="Account Information"
            description="Your administrator account details"
          />
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{(user as { username?: string })?.username || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="System Settings"
            description="Configure system-wide settings"
          />
          <div className="space-y-4">
            <Input
              label="Current School Year"
              defaultValue="2026-2027"
              disabled
              helperText="Contact system administrator to change"
            />
            <Input
              label="Enrollment Status"
              defaultValue="Open"
              disabled
              helperText="Controls whether new enrollments are accepted"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Danger Zone"
            description="Irreversible actions"
          />
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-800">Clear All Data</p>
              <p className="text-sm text-red-600 mt-1">
                This will permanently delete all data. This action cannot be undone.
              </p>
              <Button variant="danger" className="mt-3" disabled>
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
