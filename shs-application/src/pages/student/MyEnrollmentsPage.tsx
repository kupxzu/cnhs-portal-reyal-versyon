import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Select, Modal, Badge, Input, Skeleton } from '@/components/ui';
import { PlusIcon, CheckCircledIcon, PersonIcon } from '@radix-ui/react-icons';
import { studentApi } from '@/lib/api';
import type { StudentTrack, Tsbsr } from '@/types';
import toast from 'react-hot-toast';

export function MyEnrollmentsPage() {
  const queryClient = useQueryClient();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedTsbsrId, setSelectedTsbsrId] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<'11' | '12'>('11');

  // Registration form state for new students
  const [registrationForm, setRegistrationForm] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone_number: '',
    nationality: 'Filipino',
    lrn: '',
    previous_school: '',
    previous_school_address: '',
    father_name: '',
    father_phone: '',
    mother_name: '',
    mother_phone: '',
    guardian_name: '',
    guardian_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  // Fetch current enrollments
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const res = await studentApi.getMyEnrollments();
      return res.data;
    },
  });

  const enrollments: StudentTrack[] = enrollmentsData?.enrollment_history || 
    enrollmentsData?.data || 
    (Array.isArray(enrollmentsData) ? enrollmentsData : []);

  // Determine student type and enrollment status
  const currentSchoolYear = '2026-2027';
  const hasCurrentEnrollment = enrollments.some(
    (e) => e.school_year === currentSchoolYear && e.status === 'enrolled'
  );
  
  // Check if student completed Grade 11 (old student for Grade 12)
  const completedGrade11 = enrollments.some(
    (e) => e.tsbsr?.track_strand?.grade_level === '11' && 
           (e.status === 'enrolled' || e.status === 'graduated')
  );

  // Check if student has any previous enrollment at all
  const isNewStudent = enrollments.length === 0;
  const isReturningStudent = completedGrade11 && !hasCurrentEnrollment;

  // Fetch available TSBSRs for enrollment
  const { data: tsbsrsData, isLoading: tsbsrsLoading } = useQuery({
    queryKey: ['available-tsbsrs'],
    queryFn: async () => {
      const res = await studentApi.getAvailableTsbsrs();
      return res.data;
    },
    enabled: isEnrollModalOpen || isRegistrationModalOpen,
  });

  const availableTsbsrs: (Tsbsr & { available_slots?: number })[] = 
    tsbsrsData?.tsbsrs || tsbsrsData?.data || (Array.isArray(tsbsrsData) ? tsbsrsData : []);

  // Filter TSBSRs by grade level
  const filteredTsbsrs = availableTsbsrs.filter(
    (tsbsr) => tsbsr.track_strand?.grade_level === selectedGradeLevel
  );

  // Enroll mutation (for old students)
  const enrollMutation = useMutation({
    mutationFn: (data: { tsbsr_id: number; school_year: string }) => 
      studentApi.enroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      toast.success('Enrollment request submitted successfully!');
      closeEnrollModal();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Failed to submit enrollment request';
      toast.error(message);
    },
  });

  // Registration mutation (for new students - includes personal info)
  const registrationMutation = useMutation({
    mutationFn: async (data: { tsbsr_id: number; school_year: string; info: typeof registrationForm }) => {
      // First update personal info
      await studentApi.updateMyInfo(data.info);
      // Then enroll
      return studentApi.enroll({ tsbsr_id: data.tsbsr_id, school_year: data.school_year });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
      toast.success('Registration and enrollment successful!');
      closeRegistrationModal();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Failed to complete registration';
      toast.error(message);
    },
  });

  const openEnrollModal = () => {
    setSelectedTsbsrId('');
    setSelectedGradeLevel('12'); // Old students enrolling for Grade 12
    setIsEnrollModalOpen(true);
  };

  const closeEnrollModal = () => {
    setIsEnrollModalOpen(false);
    setSelectedTsbsrId('');
  };

  const openRegistrationModal = () => {
    setSelectedTsbsrId('');
    setSelectedGradeLevel('11'); // New students start with Grade 11
    setIsRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setSelectedTsbsrId('');
    setRegistrationForm({
      last_name: '',
      first_name: '',
      middle_name: '',
      date_of_birth: '',
      gender: '',
      address: '',
      phone_number: '',
      nationality: 'Filipino',
      lrn: '',
      previous_school: '',
      previous_school_address: '',
      father_name: '',
      father_phone: '',
      mother_name: '',
      mother_phone: '',
      guardian_name: '',
      guardian_phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    });
  };

  const handleEnroll = () => {
    if (!selectedTsbsrId) {
      toast.error('Please select a track-strand section');
      return;
    }
    enrollMutation.mutate({
      tsbsr_id: parseInt(selectedTsbsrId),
      school_year: currentSchoolYear,
    });
  };

  const handleRegistration = () => {
    if (!selectedTsbsrId) {
      toast.error('Please select a track-strand section');
      return;
    }
    if (!registrationForm.last_name || !registrationForm.first_name || !registrationForm.date_of_birth) {
      toast.error('Please fill in all required fields');
      return;
    }
    registrationMutation.mutate({
      tsbsr_id: parseInt(selectedTsbsrId),
      school_year: currentSchoolYear,
      info: registrationForm,
    });
  };

  const updateFormField = (field: string, value: string) => {
    setRegistrationForm(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge variant="success">Enrolled</Badge>;
      case 'dropped':
        return <Badge variant="danger">Dropped</Badge>;
      case 'graduated':
        return <Badge variant="info">Graduated</Badge>;
      case 'transferred':
        return <Badge variant="warning">Transferred</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTsbsrDisplay = (tsbsr: Tsbsr) => {
    const track = tsbsr.track_strand?.track?.name || 'Unknown Track';
    const strand = tsbsr.track_strand?.strand?.name || 'Unknown Strand';
    const building = tsbsr.building_section?.building?.name || '';
    const section = tsbsr.building_section?.section?.name || '';
    const room = tsbsr.room?.room_number || '';
    
    return `${track} - ${strand} | ${building} - ${section} | Room ${room}`;
  };

  return (
    <DashboardLayout title="My Enrollments">
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enrollment History</h2>
            <p className="text-sm text-gray-500">View your current and past enrollments</p>
          </div>
        </div>

        {/* New Student Registration Card */}
        {isNewStudent && !hasCurrentEnrollment && (
          <Card>
            <div className="text-center py-8">
              <PersonIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome, New Student!
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't enrolled yet. Complete your registration form to enroll for Grade 11.
              </p>
              <Button onClick={openRegistrationModal}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Start Enrollment Registration
              </Button>
            </div>
          </Card>
        )}

        {/* Old Student Re-enrollment Card */}
        {isReturningStudent && (
          <Card>
            <div className="text-center py-8">
              <CheckCircledIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome Back!
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You've completed Grade 11. Request your enrollment for Grade 12 to continue your Senior High School journey.
              </p>
              <Button onClick={openEnrollModal}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Request Enrollment for Grade 12
              </Button>
            </div>
          </Card>
        )}

        {/* Current Enrollment Card */}
        {hasCurrentEnrollment && (
          <Card>
            <CardHeader 
              title="Current Enrollment" 
              description={`School Year ${currentSchoolYear}`}
            />
            {enrollments
              .filter((e) => e.school_year === currentSchoolYear && e.status === 'enrolled')
              .map((enrollment) => (
                <div key={enrollment.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircledIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">
                          {enrollment.tsbsr?.track_strand?.track?.name} - {enrollment.tsbsr?.track_strand?.strand?.name}
                        </p>
                        <p className="text-sm text-green-700">
                          Grade {enrollment.tsbsr?.track_strand?.grade_level}
                        </p>
                        <div className="mt-2 text-sm text-green-600">
                          <p>
                            <span className="font-medium">Building:</span> {enrollment.tsbsr?.building_section?.building?.name}
                          </p>
                          <p>
                            <span className="font-medium">Section:</span> {enrollment.tsbsr?.building_section?.section?.name}
                          </p>
                          <p>
                            <span className="font-medium">Room:</span> {enrollment.tsbsr?.room?.room_number}
                          </p>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(enrollment.status)}
                  </div>
                </div>
              ))}
          </Card>
        )}

        {/* Enrollment History */}
        {enrollments.length > 0 && (
          <Card>
            <CardHeader 
              title="Enrollment History" 
              description="All your past and current enrollments"
            />
            {enrollmentsLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Track & Strand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enrollment.school_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.tsbsr?.track_strand?.track?.name} - {enrollment.tsbsr?.track_strand?.strand?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Grade {enrollment.tsbsr?.track_strand?.grade_level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.tsbsr?.building_section?.building?.name} - {enrollment.tsbsr?.building_section?.section?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.tsbsr?.room?.room_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(enrollment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Old Student Enrollment Modal (Simple) */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={closeEnrollModal}
        title="Request Enrollment for Grade 12"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>School Year:</strong> {currentSchoolYear}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Grade Level:</strong> 12
            </p>
          </div>

          <Select
            label="Select Track-Strand Section"
            value={selectedTsbsrId}
            onChange={(e) => setSelectedTsbsrId(e.target.value)}
            placeholder={tsbsrsLoading ? 'Loading...' : '-- Select a section --'}
            options={
              tsbsrsLoading || filteredTsbsrs.length === 0
                ? []
                : filteredTsbsrs.map((tsbsr) => ({
                    value: tsbsr.id,
                    label: `${formatTsbsrDisplay(tsbsr)} (${tsbsr.available_slots} slots)`,
                  }))
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeEnrollModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnroll} 
              disabled={!selectedTsbsrId || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? 'Submitting...' : 'Submit Enrollment Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Student Registration Modal (Full Form) */}
      <Modal
        isOpen={isRegistrationModalOpen}
        onClose={closeRegistrationModal}
        title="Enrollment Registration Form"
        size="2xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* School Selection */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>School Year:</strong> {currentSchoolYear} | <strong>Grade Level:</strong> 11
            </p>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <PersonIcon className="w-4 h-4" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Last Name"
                value={registrationForm.last_name}
                onChange={(e) => updateFormField('last_name', e.target.value)}
                required
              />
              <Input
                label="First Name"
                value={registrationForm.first_name}
                onChange={(e) => updateFormField('first_name', e.target.value)}
                required
              />
              <Input
                label="Middle Name"
                value={registrationForm.middle_name}
                onChange={(e) => updateFormField('middle_name', e.target.value)}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={registrationForm.date_of_birth}
                onChange={(e) => updateFormField('date_of_birth', e.target.value)}
                required
              />
              <Select
                label="Gender"
                value={registrationForm.gender}
                onChange={(e) => updateFormField('gender', e.target.value)}
                placeholder="Select gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Nationality"
                value={registrationForm.nationality}
                onChange={(e) => updateFormField('nationality', e.target.value)}
              />
              <Input
                label="LRN (Learner Reference Number)"
                value={registrationForm.lrn}
                onChange={(e) => updateFormField('lrn', e.target.value)}
              />
              <Input
                label="Phone Number"
                value={registrationForm.phone_number}
                onChange={(e) => updateFormField('phone_number', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Complete Address"
                value={registrationForm.address}
                onChange={(e) => updateFormField('address', e.target.value)}
              />
            </div>
          </div>

          {/* Previous School */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Previous School</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="School Name"
                value={registrationForm.previous_school}
                onChange={(e) => updateFormField('previous_school', e.target.value)}
              />
              <Input
                label="School Address"
                value={registrationForm.previous_school_address}
                onChange={(e) => updateFormField('previous_school_address', e.target.value)}
              />
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Parent/Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Father's Name"
                value={registrationForm.father_name}
                onChange={(e) => updateFormField('father_name', e.target.value)}
              />
              <Input
                label="Father's Phone"
                value={registrationForm.father_phone}
                onChange={(e) => updateFormField('father_phone', e.target.value)}
              />
              <Input
                label="Mother's Name"
                value={registrationForm.mother_name}
                onChange={(e) => updateFormField('mother_name', e.target.value)}
              />
              <Input
                label="Mother's Phone"
                value={registrationForm.mother_phone}
                onChange={(e) => updateFormField('mother_phone', e.target.value)}
              />
              <Input
                label="Guardian's Name (if applicable)"
                value={registrationForm.guardian_name}
                onChange={(e) => updateFormField('guardian_name', e.target.value)}
              />
              <Input
                label="Guardian's Phone"
                value={registrationForm.guardian_phone}
                onChange={(e) => updateFormField('guardian_phone', e.target.value)}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Name"
                value={registrationForm.emergency_contact_name}
                onChange={(e) => updateFormField('emergency_contact_name', e.target.value)}
              />
              <Input
                label="Contact Phone"
                value={registrationForm.emergency_contact_phone}
                onChange={(e) => updateFormField('emergency_contact_phone', e.target.value)}
              />
              <Input
                label="Relationship"
                value={registrationForm.emergency_contact_relationship}
                onChange={(e) => updateFormField('emergency_contact_relationship', e.target.value)}
              />
            </div>
          </div>

          {/* Track Selection */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Track & Strand Selection</h4>
            <Select
              label="Select Track-Strand Section for Grade 11"
              value={selectedTsbsrId}
              onChange={(e) => setSelectedTsbsrId(e.target.value)}
              placeholder={tsbsrsLoading ? 'Loading...' : '-- Select a section --'}
              options={
                tsbsrsLoading || filteredTsbsrs.length === 0
                  ? []
                  : filteredTsbsrs.map((tsbsr) => ({
                      value: tsbsr.id,
                      label: `${formatTsbsrDisplay(tsbsr)} (${tsbsr.available_slots} slots)`,
                    }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={closeRegistrationModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleRegistration} 
              disabled={!selectedTsbsrId || registrationMutation.isPending}
            >
              {registrationMutation.isPending ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
