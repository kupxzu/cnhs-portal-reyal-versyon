import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Select, DataTable, Modal, ConfirmModal, Badge, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon, ResetIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { TrackStrand, Track, Strand } from '@/types';
import toast from 'react-hot-toast';

export function TrackStrandsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrackStrand | null>(null);
  const [deletingItem, setDeletingItem] = useState<TrackStrand | null>(null);
  const [trackId, setTrackId] = useState('');
  const [strandId, setStrandId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [filterTrackId, setFilterTrackId] = useState('');
  const [filterStrandId, setFilterStrandId] = useState('');
  const [filterGradeLevel, setFilterGradeLevel] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['track-strands', filterTrackId, filterStrandId, filterGradeLevel, page],
    queryFn: async () => {
      const res = await adminApi.getTrackStrands({
        track_id: filterTrackId ? Number(filterTrackId) : undefined,
        strand_id: filterStrandId ? Number(filterStrandId) : undefined,
        grade_level: filterGradeLevel || undefined,
        page,
        per_page: 15,
      });
      return res.data;
    },
  });
  const trackStrands = data?.track_strands || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const { data: tracksData } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const res = await adminApi.getTracks();
      return res.data;
    },
  });
  const tracks = tracksData?.tracks || tracksData?.data || (Array.isArray(tracksData) ? tracksData : []);

  const { data: strandsData } = useQuery({
    queryKey: ['strands'],
    queryFn: async () => {
      const res = await adminApi.getStrands();
      return res.data;
    },
  });
  const strands = strandsData?.strands || strandsData?.data || (Array.isArray(strandsData) ? strandsData : []);

  const createMutation = useMutation({
    mutationFn: (data: { track_id: number; strand_id: number; grade_level: string }) => 
      adminApi.createTrackStrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-strands'] });
      toast.success('Track-Strand created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create track-strand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { track_id: number; strand_id: number; grade_level: string } }) => 
      adminApi.updateTrackStrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-strands'] });
      toast.success('Track-Strand updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update track-strand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTrackStrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-strands'] });
      toast.success('Track-Strand deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    },
    onError: () => toast.error('Failed to delete track-strand'),
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTrackId('');
    setStrandId('');
    setGradeLevel('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: TrackStrand) => {
    setEditingItem(item);
    setTrackId(String(item.track_id));
    setStrandId(String(item.strand_id));
    setGradeLevel(item.grade_level);
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: TrackStrand) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      track_id: Number(trackId), 
      strand_id: Number(strandId), 
      grade_level: gradeLevel 
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'track', 
      header: 'Track',
      render: (item: TrackStrand) => item.track?.name || '-'
    },
    { 
      key: 'strand', 
      header: 'Strand',
      render: (item: TrackStrand) => item.strand?.name || '-'
    },
    { 
      key: 'grade_level', 
      header: 'Grade Level',
      render: (item: TrackStrand) => (
        <Badge variant={item.grade_level === '11' ? 'info' : 'success'}>
          Grade {item.grade_level}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: TrackStrand) => (
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
    <DashboardLayout title="Track-Strands" breadcrumbs={[{ label: 'Track-Strands' }]}>
      <Card>
        <CardHeader
          title="Manage Track-Strands"
          description="Combinations of tracks and strands per grade level"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Track-Strand
            </Button>
          }
        />

        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={filterTrackId}
            onChange={(e) => {
              setFilterTrackId(e.target.value);
              setPage(1);
            }}
            options={tracks.map((t: Track) => ({ value: t.id, label: t.name }))}
            placeholder="Filter by track"
          />
          <Select
            value={filterStrandId}
            onChange={(e) => {
              setFilterStrandId(e.target.value);
              setPage(1);
            }}
            options={strands.map((s: Strand) => ({ value: s.id, label: s.name }))}
            placeholder="Filter by strand"
          />
          <Select
            value={filterGradeLevel}
            onChange={(e) => {
              setFilterGradeLevel(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '11', label: 'Grade 11' },
              { value: '12', label: 'Grade 12' },
            ]}
            placeholder="Filter by grade"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFilterTrackId('');
              setFilterStrandId('');
              setFilterGradeLevel('');
              setPage(1);
            }}
          >
            <ResetIcon className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={trackStrands}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No track-strands found for selected filters"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Track-Strand' : 'Add Track-Strand'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Track"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            options={tracks.map((t: Track) => ({ value: t.id, label: t.name }))}
            placeholder="Select a track"
            required
          />
          <Select
            label="Strand"
            value={strandId}
            onChange={(e) => setStrandId(e.target.value)}
            options={strands.map((s: Strand) => ({ value: s.id, label: s.name }))}
            placeholder="Select a strand"
            required
          />
          <Select
            label="Grade Level"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            options={[
              { value: '11', label: 'Grade 11' },
              { value: '12', label: 'Grade 12' },
            ]}
            placeholder="Select grade level"
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
        title="Delete Track-Strand"
        message="Are you sure you want to delete this track-strand combination?"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
