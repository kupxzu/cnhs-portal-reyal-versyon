import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Button, Input, Select, Modal, ConfirmModal } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon, CubeIcon, Cross2Icon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Building, Room, BuildingSection, Section } from '@/types';
import toast from 'react-hot-toast';

type SectionModal = 'none' | 'new' | 'assign' | 'edit';
type RoomModal    = 'none' | 'create' | 'edit';

export function RoomsPage() {
  const queryClient = useQueryClient();

  // Building selector (native <select> — no lag)
  const [selectedBuildingId, setSelectedBuildingId] = useState('');

  // Modal states
  const [buildingModal,        setBuildingModal]        = useState<'none'|'create'|'edit'|'delete'>('none');
  const [sectionModal,         setSectionModal]         = useState<SectionModal>('none');
  const [roomModal,            setRoomModal]            = useState<RoomModal>('none');
  const [bsDeleteTarget,       setBsDeleteTarget]       = useState<BuildingSection | null>(null);
  const [roomDeleteTarget,     setRoomDeleteTarget]     = useState<Room | null>(null);
  const [buildingDeleteTarget, setBuildingDeleteTarget] = useState<Building | null>(null);

  // Form values
  const [buildingName,   setBuildingName]   = useState('');
  const [editingBuilding,setEditingBuilding]= useState<Building | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [assignSectionId,setAssignSectionId]= useState('');
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionName,setEditSectionName]= useState('');
  const [roomNumber,     setRoomNumber]     = useState('');
  const [roomCapacity,   setRoomCapacity]   = useState('');
  const [editingRoom,    setEditingRoom]    = useState<Room | null>(null);

  // ── Queries ─────────────────────────────────────────────────────────
  const { data: buildingsData, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => (await adminApi.getBuildings()).data,
  });
  const buildings: Building[] = buildingsData?.buildings ?? buildingsData?.data ?? (Array.isArray(buildingsData) ? buildingsData : []);

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await adminApi.getRooms()).data,
  });
  const allRooms: Room[] = roomsData?.rooms ?? roomsData?.data ?? (Array.isArray(roomsData) ? roomsData : []);

  const { data: bsData } = useQuery({
    queryKey: ['building-sections'],
    queryFn: async () => (await adminApi.getBuildingSections()).data,
  });
  const allBuildingSections: BuildingSection[] = bsData?.building_sections ?? bsData?.data ?? (Array.isArray(bsData) ? bsData : []);

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await adminApi.getSections()).data,
  });
  const allSections: Section[] = sectionsData?.sections ?? sectionsData?.data ?? (Array.isArray(sectionsData) ? sectionsData : []);

  // ── Derived ─────────────────────────────────────────────────────────
  const selectedBuilding  = buildings.find(b => b.id === Number(selectedBuildingId)) ?? null;
  const filteredBs        = selectedBuilding ? allBuildingSections.filter(bs => bs.building_id === selectedBuilding.id) : [];
  const filteredRooms     = selectedBuilding ? allRooms.filter(r => r.building_id === selectedBuilding.id) : [];
  const assignedIds       = new Set(filteredBs.map(bs => bs.section_id));
  const availableSections = allSections.filter(s => !assignedIds.has(s.id));
  const hasSection        = filteredBs.length > 0;

  // ── Building mutations ───────────────────────────────────────────────
  const createBuildingMutation = useMutation({
    mutationFn: (data: { name: string }) => adminApi.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building created');
      setBuildingModal('none'); setBuildingName('');
    },
    onError: () => toast.error('Failed to create building'),
  });

  const updateBuildingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => adminApi.updateBuilding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building updated');
      setBuildingModal('none'); setEditingBuilding(null); setBuildingName('');
    },
    onError: () => toast.error('Failed to update building'),
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Building deleted');
      if (selectedBuildingId === String(buildingDeleteTarget?.id)) setSelectedBuildingId('');
      setBuildingModal('none'); setBuildingDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete building'),
  });

  const handleBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuilding) updateBuildingMutation.mutate({ id: editingBuilding.id, data: { name: buildingName } });
    else createBuildingMutation.mutate({ name: buildingName });
  };

  // ── Section mutations ────────────────────────────────────────────────
  const createSectionAndAssignMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await adminApi.createSection({ name });
      const newId: number = res.data?.section?.id ?? res.data?.id ?? res.data?.data?.id;
      await adminApi.createBuildingSection({ building_id: selectedBuilding!.id, section_id: newId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Section created and assigned');
      setSectionModal('none'); setNewSectionName('');
    },
    onError: () => toast.error('Failed to create section'),
  });

  const assignSectionMutation = useMutation({
    mutationFn: (sectionId: number) =>
      adminApi.createBuildingSection({ building_id: selectedBuilding!.id, section_id: sectionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Section assigned');
      setSectionModal('none'); setAssignSectionId('');
    },
    onError: () => toast.error('Failed to assign section'),
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => adminApi.updateSection(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Section renamed');
      setSectionModal('none'); setEditingSection(null); setEditSectionName('');
    },
    onError: () => toast.error('Failed to rename section'),
  });

  const unassignSectionMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBuildingSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Section removed from building');
      setBsDeleteTarget(null);
    },
    onError: () => toast.error('Failed to remove section'),
  });

  // ── Room mutations ───────────────────────────────────────────────────
  const createRoomMutation = useMutation({
    mutationFn: (data: { building_id: number; room_number: string; capacity?: number }) => adminApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created');
      setRoomModal('none'); setRoomNumber(''); setRoomCapacity('');
    },
    onError: () => toast.error('Failed to create room'),
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { building_id?: number; room_number: string; capacity?: number } }) =>
      adminApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated');
      setRoomModal('none'); setEditingRoom(null);
    },
    onError: () => toast.error('Failed to update room'),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
      setRoomDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { building_id: selectedBuilding!.id, room_number: roomNumber, capacity: roomCapacity ? Number(roomCapacity) : undefined };
    if (editingRoom) updateRoomMutation.mutate({ id: editingRoom.id, data });
    else createRoomMutation.mutate(data);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Buildings & Rooms" breadcrumbs={[{ label: 'Buildings & Rooms' }]}>
      <div className="space-y-4">

        {/* ── Building selector bar ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <span className="text-sm font-semibold text-gray-500 shrink-0">Building</span>

          {buildingsLoading ? (
            <div className="flex-1 h-9 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedBuildingId}
              onChange={e => setSelectedBuildingId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">— Select a building —</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          {selectedBuilding && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => { setEditingBuilding(selectedBuilding); setBuildingName(selectedBuilding.name); setBuildingModal('edit'); }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Rename building"
              >
                <Pencil1Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setBuildingDeleteTarget(selectedBuilding); setBuildingModal('delete'); }}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete building"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <Button size="sm" onClick={() => { setEditingBuilding(null); setBuildingName(''); setBuildingModal('create'); }} className="shrink-0">
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            New Building
          </Button>
        </div>

        {/* ── Main content ── */}
        {!selectedBuilding ? (
          <div className="flex flex-col items-center justify-center py-28 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <CubeIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-500">Select a building to get started</p>
            <p className="text-sm mt-1 text-gray-400">Or create a new building using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 items-start">

            {/* ── Sections panel (left 2 cols) ── */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Sections</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredBs.length} assigned to this building</p>
                </div>
                <div className="flex items-center gap-2">
                  {availableSections.length > 0 && (
                    <button
                      onClick={() => { setAssignSectionId(''); setSectionModal('assign'); }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-md transition"
                    >
                      Assign existing
                    </button>
                  )}
                  <Button size="sm" onClick={() => { setNewSectionName(''); setSectionModal('new'); }}>
                    <PlusIcon className="w-3.5 h-3.5 mr-1" />
                    New
                  </Button>
                </div>
              </div>

              <div className="p-3 space-y-1.5 min-h-25">
                {filteredBs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                    <p className="text-sm font-medium">No sections yet</p>
                    <p className="text-xs mt-1 text-gray-300">Add a section before creating rooms</p>
                  </div>
                ) : (
                  filteredBs.map(bs => (
                    <div
                      key={bs.id}
                      className="group flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                        {bs.section?.name ?? `Section #${bs.section_id}`}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => {
                            const sec = allSections.find(s => s.id === bs.section_id);
                            if (sec) { setEditingSection(sec); setEditSectionName(sec.name); setSectionModal('edit'); }
                          }}
                          className="p-1 hover:bg-blue-100 rounded" title="Rename section"
                        >
                          <Pencil1Icon className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setBsDeleteTarget(bs)}
                          className="p-1 hover:bg-red-100 rounded" title="Remove from building"
                        >
                          <Cross2Icon className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Rooms panel (right 3 cols) ── */}
            <div className="col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Rooms</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredRooms.length} in {selectedBuilding.name}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => { setEditingRoom(null); setRoomNumber(''); setRoomCapacity(''); setRoomModal('create'); }}
                  disabled={!hasSection}
                  title={!hasSection ? 'Assign at least one section first' : undefined}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" />
                  Add Room
                </Button>
              </div>

              {!hasSection && (
                <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span><strong>Section required</strong> — assign at least one section to this building before adding rooms.</span>
                </div>
              )}

              {roomsLoading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <p className="text-sm font-medium">No rooms yet</p>
                  {hasSection && <p className="text-xs mt-1 text-gray-300">Click "Add Room" to create the first room</p>}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
                      <th className="w-20 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room, i) => (
                      <tr key={room.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                        <td className="px-4 py-3 font-medium text-gray-800">{room.room_number}</td>
                        <td className="px-4 py-3 text-gray-600">{room.capacity || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(room.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => { setEditingRoom(room); setRoomNumber(room.room_number); setRoomCapacity(String(room.capacity || '')); setRoomModal('edit'); }}
                              className="p-1.5 hover:bg-gray-100 rounded" title="Edit room"
                            >
                              <Pencil1Icon className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setRoomDeleteTarget(room)}
                              className="p-1.5 hover:bg-red-50 rounded" title="Delete room"
                            >
                              <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════ */}

      {/* Building create / edit */}
      <Modal
        isOpen={buildingModal === 'create' || buildingModal === 'edit'}
        onClose={() => setBuildingModal('none')}
        title={buildingModal === 'edit' ? 'Rename Building' : 'New Building'}
      >
        <form onSubmit={handleBuildingSubmit} className="space-y-4">
          <Input label="Building Name" value={buildingName} onChange={e => setBuildingName(e.target.value)} placeholder="e.g., Main Building, Science Wing" required />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setBuildingModal('none')}>Cancel</Button>
            <Button type="submit" isLoading={createBuildingMutation.isPending || updateBuildingMutation.isPending}>
              {buildingModal === 'edit' ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={buildingModal === 'delete'}
        onClose={() => setBuildingModal('none')}
        onConfirm={() => buildingDeleteTarget && deleteBuildingMutation.mutate(buildingDeleteTarget.id)}
        title="Delete Building"
        message={`Delete "${buildingDeleteTarget?.name}"? All rooms and section assignments will be removed.`}
        confirmText="Delete"
        isLoading={deleteBuildingMutation.isPending}
      />

      {/* Section — new (create + assign) */}
      <Modal
        isOpen={sectionModal === 'new'}
        onClose={() => setSectionModal('none')}
        title={`New Section — ${selectedBuilding?.name}`}
      >
        <form onSubmit={e => { e.preventDefault(); createSectionAndAssignMutation.mutate(newSectionName); }} className="space-y-4">
          <Input label="Section Name" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g., Section A, Rizal" required />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setSectionModal('none')}>Cancel</Button>
            <Button type="submit" isLoading={createSectionAndAssignMutation.isPending}>Create & Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Section — assign existing */}
      <Modal
        isOpen={sectionModal === 'assign'}
        onClose={() => setSectionModal('none')}
        title={`Assign Section to ${selectedBuilding?.name}`}
      >
        <form onSubmit={e => { e.preventDefault(); assignSectionMutation.mutate(Number(assignSectionId)); }} className="space-y-4">
          <Select
            label="Section"
            value={assignSectionId}
            onChange={e => setAssignSectionId(e.target.value)}
            options={availableSections.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select a section"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setSectionModal('none')}>Cancel</Button>
            <Button type="submit" isLoading={assignSectionMutation.isPending}>Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Section — rename */}
      <Modal
        isOpen={sectionModal === 'edit'}
        onClose={() => setSectionModal('none')}
        title="Rename Section"
      >
        <form onSubmit={e => { e.preventDefault(); editingSection && updateSectionMutation.mutate({ id: editingSection.id, name: editSectionName }); }} className="space-y-4">
          <Input label="Section Name" value={editSectionName} onChange={e => setEditSectionName(e.target.value)} placeholder="e.g., Section A" required />
          <p className="text-xs text-gray-400">This renames the section everywhere it is used.</p>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setSectionModal('none')}>Cancel</Button>
            <Button type="submit" isLoading={updateSectionMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Section — unassign */}
      <ConfirmModal
        isOpen={!!bsDeleteTarget}
        onClose={() => setBsDeleteTarget(null)}
        onConfirm={() => bsDeleteTarget && unassignSectionMutation.mutate(bsDeleteTarget.id)}
        title="Remove Section"
        message={`Remove "${bsDeleteTarget?.section?.name}" from ${selectedBuilding?.name}?`}
        confirmText="Remove"
        isLoading={unassignSectionMutation.isPending}
      />

      {/* Room create / edit */}
      <Modal
        isOpen={roomModal === 'create' || roomModal === 'edit'}
        onClose={() => { setRoomModal('none'); setEditingRoom(null); }}
        title={roomModal === 'edit' ? 'Edit Room' : `Add Room — ${selectedBuilding?.name}`}
      >
        <form onSubmit={handleRoomSubmit} className="space-y-4">
          <Input label="Room Number / Name" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="e.g., 101, Lab-A, AVR" required />
          <Input label="Capacity" type="number" value={roomCapacity} onChange={e => setRoomCapacity(e.target.value)} placeholder="e.g., 40" />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => { setRoomModal('none'); setEditingRoom(null); }}>Cancel</Button>
            <Button type="submit" isLoading={createRoomMutation.isPending || updateRoomMutation.isPending}>
              {roomModal === 'edit' ? 'Save' : 'Create Room'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Room delete */}
      <ConfirmModal
        isOpen={!!roomDeleteTarget}
        onClose={() => setRoomDeleteTarget(null)}
        onConfirm={() => roomDeleteTarget && deleteRoomMutation.mutate(roomDeleteTarget.id)}
        title="Delete Room"
        message={`Delete room "${roomDeleteTarget?.room_number}"?`}
        confirmText="Delete"
        isLoading={deleteRoomMutation.isPending}
      />
    </DashboardLayout>
  );
}
