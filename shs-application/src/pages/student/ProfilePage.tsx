import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, Skeleton } from '@/components/ui';
import { PersonIcon, EnvelopeClosedIcon, IdCardIcon, HomeIcon, MobileIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { studentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Student, StudentInfo } from '@/types';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Fetch student info
  const { data: infoData, isLoading } = useQuery({
    queryKey: ['my-info'],
    queryFn: async () => {
      const res = await studentApi.getMyInfo();
      return res.data;
    },
  });

  const studentInfo: StudentInfo | null = infoData?.info || infoData?.student?.info || null;
  const studentData: Student | null = infoData?.student || infoData || null;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { phone_number?: string; address?: string }) => 
      studentApi.updateMyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const startEditing = () => {
    setPhoneNumber(studentInfo?.phone_number || '');
    setAddress(studentInfo?.address || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setPhoneNumber('');
    setAddress('');
  };

  const handleSave = () => {
    updateMutation.mutate({
      phone_number: phoneNumber || undefined,
      address: address || undefined,
    });
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFullName = () => {
    if (!studentInfo) return (user as Student)?.username || 'Student';
    const parts = [
      studentInfo.first_name,
      studentInfo.middle_name,
      studentInfo.last_name,
      studentInfo.extension_name,
    ].filter(Boolean);
    return parts.join(' ') || (user as Student)?.username || 'Student';
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 w-full space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <PersonIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{getFullName()}</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-gray-500">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <IdCardIcon className="w-4 h-4" />
                  <span>{(user as Student)?.id_number || studentData?.id_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <EnvelopeClosedIcon className="w-4 h-4" />
                  <span>{(user as Student)?.email || studentData?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            {!isEditing && studentInfo && (
              <Button variant="secondary" onClick={startEditing}>
                <Pencil1Icon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader 
            title="Personal Information" 
            description="Your basic personal details"
          />
          {studentInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <InfoItem label="First Name" value={studentInfo.first_name} />
              <InfoItem label="Middle Name" value={studentInfo.middle_name} />
              <InfoItem label="Last Name" value={studentInfo.last_name} />
              <InfoItem label="Extension Name" value={studentInfo.extension_name} />
              <InfoItem label="Date of Birth" value={formatDate(studentInfo.date_of_birth)} />
              <InfoItem label="Gender" value={studentInfo.gender} />
              <InfoItem label="Civil Status" value={studentInfo.civil_status} />
              <InfoItem label="Nationality" value={studentInfo.nationality} />
              <InfoItem label="Religion" value={studentInfo.religion} />
              <InfoItem label="LRN" value={studentInfo.lrn} />
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No personal information on file. Please contact the registrar.
            </div>
          )}
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader 
            title="Contact Information" 
            description={isEditing ? 'Update your contact details' : 'Your contact details'}
          />
          <div className="p-4">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
                <Input
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Phone Number" 
                  value={studentInfo?.phone_number} 
                  icon={<MobileIcon className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Address" 
                  value={studentInfo?.address} 
                  icon={<HomeIcon className="w-4 h-4" />}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Emergency Contact */}
        {studentInfo && (
          <Card>
            <CardHeader 
              title="Emergency Contact" 
              description="Who to contact in case of emergency"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <InfoItem label="Contact Name" value={studentInfo.emergency_contact_name} />
              <InfoItem label="Relationship" value={studentInfo.emergency_contact_relationship} />
              <InfoItem label="Phone" value={studentInfo.emergency_contact_phone} />
            </div>
          </Card>
        )}

        {/* Guardian Information */}
        {studentInfo && (studentInfo.guardian_name || studentInfo.father_name || studentInfo.mother_name) && (
          <Card>
            <CardHeader 
              title="Family Information" 
              description="Parent/Guardian details"
            />
            <div className="space-y-6 p-4">
              {/* Father */}
              {studentInfo.father_name && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Father</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <InfoItem label="Name" value={studentInfo.father_name} />
                    <InfoItem label="Occupation" value={studentInfo.father_occupation} />
                    <InfoItem label="Phone" value={studentInfo.father_phone} />
                  </div>
                </div>
              )}

              {/* Mother */}
              {studentInfo.mother_name && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Mother</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <InfoItem label="Name" value={studentInfo.mother_name} />
                    <InfoItem label="Occupation" value={studentInfo.mother_occupation} />
                    <InfoItem label="Phone" value={studentInfo.mother_phone} />
                  </div>
                </div>
              )}

              {/* Guardian */}
              {studentInfo.guardian_name && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Guardian</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <InfoItem label="Name" value={studentInfo.guardian_name} />
                    <InfoItem label="Relationship" value={studentInfo.guardian_relationship} />
                    <InfoItem label="Phone" value={studentInfo.guardian_phone} />
                    <InfoItem label="Address" value={studentInfo.guardian_address} />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Previous School */}
        {studentInfo?.previous_school && (
          <Card>
            <CardHeader 
              title="Previous School" 
              description="Educational background"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <InfoItem label="School Name" value={studentInfo.previous_school} />
              <InfoItem label="Address" value={studentInfo.previous_school_address} />
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

// Helper component for displaying info items
function InfoItem({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | null | undefined; 
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
    </div>
  );
}
