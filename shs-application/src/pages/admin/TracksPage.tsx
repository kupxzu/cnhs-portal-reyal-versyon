import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, DataTable, Modal, ConfirmModal, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Track } from '@/types';
import toast from 'react-hot-toast';

export function TracksPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tracks', page],
    queryFn: async () => {
      const res = await adminApi.getTracks({ page, per_page: 15 });
      return res.data;
    },
  });
  const tracks = data?.tracks || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => adminApi.createTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Track created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create track'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      adminApi.updateTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Track updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update track'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Track deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingTrack(null);
    },
    onError: () => toast.error('Failed to delete track'),
  });

  const openCreateModal = () => {
    setEditingTrack(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setName(track.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (track: Track) => {
    setDeletingTrack(track);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrack) {
      updateMutation.mutate({ id: editingTrack.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { 
      key: 'created_at', 
      header: 'Created At',
      render: (track: Track) => new Date(track.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (track: Track) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(track)}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => openDeleteModal(track)}
            className="p-1.5 hover:bg-red-50 rounded"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Tracks" breadcrumbs={[{ label: 'Tracks' }]}>
      <Card>
        <CardHeader
          title="Manage Tracks"
          description="Academic tracks available in the school"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Track
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={tracks}
          keyExtractor={(track) => track.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No tracks found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTrack ? 'Edit Track' : 'Add Track'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Track Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Academic, TVL, Sports"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingTrack ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingTrack && deleteMutation.mutate(deletingTrack.id)}
        title="Delete Track"
        message={`Are you sure you want to delete "${deletingTrack?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
