import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader } from '@/components/ui';
import { BarChartIcon } from '@radix-ui/react-icons';

export function MyGradesPage() {
  return (
    <DashboardLayout title="My Grades">
      <Card>
        <CardHeader 
          title="Academic Grades" 
          description="View your grades and academic performance"
        />
        <div className="text-center py-12">
          <BarChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your grades will be visible here once they are recorded by your teachers.
            Check back later for your academic performance details.
          </p>
        </div>
      </Card>
    </DashboardLayout>
  );
}
