import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select, Badge } from '@/components/ui';
import { ArrowLeftIcon, CheckIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Student, Tsbsr, TrackStrand, BuildingSection } from '@/types';
import toast from 'react-hot-toast';

export function AddEnrollmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTsbsr, setSelectedTsbsr] = useState<Tsbsr | null>(null);
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [status, setStatus] = useState('enrolled');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [tsbsrSearchTerm, setTsbsrSearchTerm] = useState('');

  const { data: studentsData } = useQuery({
    queryKey: ['students-list-all'],
    queryFn: async () => {
      const res = await adminApi.getStudents({ page: 1 });
      return res.data;
    },
  });

  const students: Student[] = studentsData?.students?.data || studentsData?.data || (Array.isArray(studentsData) ? studentsData : []);

  const { data: tsbsrsData } = useQuery({
    queryKey: ['tsbsrs-list-all'],
    queryFn: async () => {
      const res = await adminApi.getTsbsrs();
      return res.data;
    },
  });

  const tsbsrs: Tsbsr[] = tsbsrsData?.tsbsrs || tsbsrsData?.data || (Array.isArray(tsbsrsData) ? tsbsrsData : []);

  const { data: existingEnrollments } = useQuery({
    queryKey: ['student-tracks-check', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const res = await adminApi.getStudentTracks({ student_id: selectedStudent.id });
      return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.student_tracks || []);
    },
    enabled: !!selectedStudent,
  });

  const enrollMutation = useMutation({
    mutationFn: (data: { student_id: number; tsbsr_id: number; school_year: string; status: string }) =>
      adminApi.createStudentTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tracks'] });
      toast.success('Student enrolled successfully!');
      // Reset form
      setSelectedStudent(null);
      setSelectedTsbsr(null);
      setSchoolYear('2026-2027');
      setStatus('enrolled');
      setStudentSearchTerm('');
      setTsbsrSearchTerm('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to enroll student';
      toast.error(message);
    },
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedTsbsr) {
      toast.error('Please select both student and class');
      return;
    }

    // Check if already enrolled in this TSBSR for this school year
    const alreadyEnrolled = existingEnrollments?.some(
      (e: any) => e.tsbsr_id === selectedTsbsr.id && e.school_year === schoolYear
    );

    if (alreadyEnrolled) {
      toast.error('Student is already enrolled in this class for this school year');
      return;
    }

    enrollMutation.mutate({
      student_id: selectedStudent.id,
      tsbsr_id: selectedTsbsr.id,
      school_year: schoolYear,
      status: status,
    });
  };

  const getTsbsrLabel = (tsbsr: Tsbsr) => {
    const ts = tsbsr.track_strand as TrackStrand;
    const bs = tsbsr.building_section as BuildingSection;
    return `${ts?.track?.name || ''}-${ts?.strand?.name || ''} G${ts?.grade_level || ''} | ${bs?.building?.name || ''}-${bs?.section?.name || ''} | Room ${tsbsr.room?.room_number || ''}`;
  };

  const getFilteredStudents = () => {
    return students.filter((s: Student) =>
      studentSearchTerm === '' ||
      s.username.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.id_number.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  };

  const getFilteredTsbsrs = () => {
    return tsbsrs.filter((t: Tsbsr) =>
      tsbsrSearchTerm === '' ||
      getTsbsrLabel(t).toLowerCase().includes(tsbsrSearchTerm.toLowerCase())
    );
  };

  const filteredStudents = getFilteredStudents();
  const filteredTsbsrs = getFilteredTsbsrs();

  return (
    <DashboardLayout title="Enroll Student" breadcrumbs={[
      { label: 'Enrollments' },
      { label: 'Add Enrollment' }
    ]}>
      <div className="max-w-4xl">
        <Button
          variant="secondary"
          onClick={() => navigate('/enrollments')}
          className="mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Enrollments
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Enroll Student"
                description="Select a student and assign them to a class"
              />

              <form onSubmit={handleEnroll} className="space-y-6 p-6">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Student Selection
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by student name or ID number..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    {studentSearchTerm && (
                      <div className="absolute z-10 w-full border border-gray-200 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.slice(0, 10).map((student: Student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentSearchTerm('');
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{student.username}</div>
                              <div className="text-sm text-gray-600">{student.id_number}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">No students found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedStudent && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">{selectedStudent.username}</h4>
                          <p className="text-sm text-green-700">ID: {selectedStudent.id_number}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Current enrollments: {existingEnrollments?.length || 0}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(null)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Class Assignment
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by track, strand, building, section, or room..."
                      value={tsbsrSearchTerm}
                      onChange={(e) => setTsbsrSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    {tsbsrSearchTerm && (
                      <div className="absolute z-10 w-full border border-gray-200 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredTsbsrs.length > 0 ? (
                          filteredTsbsrs.slice(0, 10).map((tsbsr: Tsbsr) => (
                            <button
                              key={tsbsr.id}
                              type="button"
                              onClick={() => {
                                setSelectedTsbsr(tsbsr);
                                setTsbsrSearchTerm('');
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900 text-sm">{getTsbsrLabel(tsbsr)}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Enrolled: {tsbsr.enrollment_count || 0}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">No classes found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTsbsr && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">{getTsbsrLabel(selectedTsbsr)}</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Enrolled: {selectedTsbsr.enrollment_count || 0}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedTsbsr(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* School Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    School Year
                  </label>
                  <Input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    placeholder="e.g., 2026-2027"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Enrollment Status
                  </label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: 'enrolled', label: 'Enrolled' },
                      { value: 'dropped', label: 'Dropped' },
                      { value: 'graduated', label: 'Graduated' },
                      { value: 'transferred', label: 'Transferred' },
                    ]}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/enrollments')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedStudent || !selectedTsbsr || enrollMutation.isPending}
                    isLoading={enrollMutation.isPending}
                  >
                    Enroll Student
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader title="Enrollment Summary" />

              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Student</h3>
                  {selectedStudent ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Username</p>
                        <p className="font-medium text-gray-900">{selectedStudent.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Number</p>
                        <p className="font-medium text-gray-900">{selectedStudent.id_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Current Enrollments</p>
                        <p className="font-medium text-gray-900">{existingEnrollments?.length || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No student selected</p>
                  )}
                </div>

                {/* Class Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Class</h3>
                  {selectedTsbsr ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Track & Strand</p>
                        <p className="font-medium text-gray-900">
                          {(selectedTsbsr.track_strand as any)?.track?.name}-{(selectedTsbsr.track_strand as any)?.strand?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Grade Level</p>
                        <p className="font-medium text-gray-900">Grade {(selectedTsbsr.track_strand as any)?.grade_level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Building & Section</p>
                        <p className="font-medium text-gray-900">
                          {(selectedTsbsr.building_section as any)?.building?.name}-{(selectedTsbsr.building_section as any)?.section?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Room</p>
                        <p className="font-medium text-gray-900">Room {selectedTsbsr.room?.room_number}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">Enrolled Students</p>
                        <p className="font-medium text-gray-900">{selectedTsbsr.enrollment_count || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No class selected</p>
                  )}
                </div>

                {/* Enrollment Details */}
                {selectedStudent && selectedTsbsr && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3">Enrollment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-indigo-700">School Year:</span>
                        <span className="font-medium text-indigo-900">{schoolYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Status:</span>
                        <Badge variant={status === 'enrolled' ? 'success' : 'warning'}>{status}</Badge>
                      </div>
                      {existingEnrollments?.some(
                        (e: any) => e.tsbsr_id === selectedTsbsr.id && e.school_year === schoolYear
                      ) && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-xs">
                          ⚠️ Student already enrolled in this class for this school year
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
