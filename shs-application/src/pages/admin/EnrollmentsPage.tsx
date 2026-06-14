import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select, DataTable, Modal, ConfirmModal, Badge, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { StudentTrack, Student, Tsbsr, TrackStrand, BuildingSection } from '@/types';
import toast from 'react-hot-toast';

export function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentTrack | null>(null);
  const [deletingItem, setDeletingItem] = useState<StudentTrack | null>(null);
  
  const [filterSchoolYear, setFilterSchoolYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  
  const [studentId, setStudentId] = useState('');
  const [tsbsrId, setTsbsrId] = useState('');
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [status, setStatus] = useState('enrolled');

  const { data, isLoading } = useQuery({
    queryKey: ['student-tracks', filterSchoolYear, filterStatus, page],
    queryFn: async () => {
      const res = await adminApi.getStudentTracks({ 
        school_year: filterSchoolYear || undefined, 
        status: filterStatus || undefined,
        page,
        per_page: 15,
      });
      return res.data;
    },
  });

  // API returns paginated data: { data: [...], current_page, last_page, ... }
  const enrollments = Array.isArray(data) ? data : (data?.data || data?.student_tracks || []);
  const totalPages = data?.last_page || data?.pagination?.last_page || 1;

  const { data: studentsData } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await adminApi.getStudents({ page: 1 });
      return res.data;
    },
  });
  const students: Student[] = studentsData?.students?.data || studentsData?.data || (Array.isArray(studentsData) ? studentsData : []);

  const { data: tsbsrsData } = useQuery({
    queryKey: ['tsbsrs-list'],
    queryFn: async () => {
      const res = await adminApi.getTsbsrs();
      return res.data;
    },
  });
  const tsbsrs: Tsbsr[] = tsbsrsData?.tsbsrs || tsbsrsData?.data || (Array.isArray(tsbsrsData) ? tsbsrsData : []);

  const createMutation = useMutation({
    mutationFn: (data: { student_id: number; tsbsr_id: number; school_year: string; status?: string }) => 
      adminApi.createStudentTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tracks'] });
      toast.success('Enrollment created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create enrollment'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ tsbsr_id: number; school_year: string; status: string }> }) => 
      adminApi.updateStudentTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tracks'] });
      toast.success('Enrollment updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update enrollment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStudentTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tracks'] });
      toast.success('Enrollment deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    },
    onError: () => toast.error('Failed to delete enrollment'),
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setStudentId('');
    setTsbsrId('');
    setSchoolYear('2026-2027');
    setStatus('enrolled');
    setIsModalOpen(true);
  };

  const openEditModal = (item: StudentTrack) => {
    setEditingItem(item);
    setStudentId(String(item.student_id));
    setTsbsrId(String(item.tsbsr_id));
    setSchoolYear(item.school_year);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: StudentTrack) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ 
        id: editingItem.id, 
        data: { tsbsr_id: Number(tsbsrId), school_year: schoolYear, status } 
      });
    } else {
      createMutation.mutate({ 
        student_id: Number(studentId), 
        tsbsr_id: Number(tsbsrId), 
        school_year: schoolYear, 
        status 
      });
    }
  };

  const getTsbsrLabel = (tsbsr: Tsbsr) => {
    const ts = tsbsr.track_strand as TrackStrand;
    const bs = tsbsr.building_section as BuildingSection;
    return `${ts?.track?.name || ''}-${ts?.strand?.name || ''} G${ts?.grade_level || ''} | ${bs?.building?.name || ''}-${bs?.section?.name || ''} | ${tsbsr.room?.room_number || ''}`;
  };

  const getStatusBadge = (st: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      enrolled: 'success',
      dropped: 'danger',
      graduated: 'info',
      transferred: 'warning',
    };
    return <Badge variant={variants[st] || 'default'}>{st}</Badge>;
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'student', 
      header: 'Student',
      render: (item: StudentTrack) => item.student?.username || item.student?.id_number || '-'
    },
    { 
      key: 'tsbsr', 
      header: 'Track-Strand / Section',
      render: (item: StudentTrack) => {
        if (!item.tsbsr) return '-';
        const ts = item.tsbsr.track_strand;
        const bs = item.tsbsr.building_section;
        return (
          <div className="text-xs">
            <p className="font-medium">{ts?.track?.name} - {ts?.strand?.name} (G{ts?.grade_level})</p>
            <p className="text-gray-500">{bs?.building?.name} - {bs?.section?.name}</p>
          </div>
        );
      }
    },
    { key: 'school_year', header: 'School Year' },
    { 
      key: 'status', 
      header: 'Status',
      render: (item: StudentTrack) => getStatusBadge(item.status)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: StudentTrack) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(item)} className="p-1.5 hover:bg-gray-100 rounded">
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => openDeleteModal(item)} className="p-1.5 hover:bg-red-50 rounded">
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Enrollments" breadcrumbs={[{ label: 'Enrollments' }]}>
      <Card>
        <CardHeader
          title="Manage Enrollments"
          description="Student enrollment records"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Enrollment
            </Button>
          }
        />
        
        <div className="mb-4 flex gap-4 flex-wrap">
          <Input
            value={filterSchoolYear}
            onChange={(e) => {
              setFilterSchoolYear(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by School Year (e.g., 2026-2027)"
            className="max-w-xs"
          />
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'enrolled', label: 'Enrolled' },
              { value: 'dropped', label: 'Dropped' },
              { value: 'graduated', label: 'Graduated' },
              { value: 'transferred', label: 'Transferred' },
            ]}
            placeholder="Filter by Status"
            className="max-w-xs"
          />
        </div>

        <DataTable
          columns={columns}
          data={enrollments}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No enrollments found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Enrollment' : 'Add Enrollment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingItem && (
            <Select
              label="Student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={students.map((s: Student) => ({ 
                value: s.id, 
                label: `${s.id_number} - ${s.username}`
              }))}
              placeholder="Select student"
              required
            />
          )}
          <Select
            label="TSBSR (Track-Strand / Building-Section / Room)"
            value={tsbsrId}
            onChange={(e) => setTsbsrId(e.target.value)}
            options={tsbsrs.map((t: Tsbsr) => ({ 
              value: t.id, 
              label: getTsbsrLabel(t)
            }))}
            placeholder="Select TSBSR"
            required
          />
          <Input
            label="School Year"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            placeholder="e.g., 2026-2027"
            required
          />
          <Select
            label="Status"
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
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
        title="Delete Enrollment"
        message="Are you sure you want to delete this enrollment record?"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
