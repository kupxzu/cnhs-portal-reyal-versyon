<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuildingSection;
use App\Models\Room;
use App\Models\Tsbsr;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TsbsrController extends Controller
{
    /**
     * Display a listing of TSBSRs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tsbsr::with([
            'trackStrand.track',
            'trackStrand.strand',
            'buildingSection.building',
            'buildingSection.section',
            'room.building',
        ]);

        // Filter by track strand
        if ($request->has('track_strand_id')) {
            $query->where('track_strand_id', $request->track_strand_id);
        }

        // Filter by building section
        if ($request->has('building_section_id')) {
            $query->where('building_section_id', $request->building_section_id);
        }

        // Filter by room
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        // Filter by grade level (through track strand)
        if ($request->has('grade_level')) {
            $query->whereHas('trackStrand', function ($q) use ($request) {
                $q->where('grade_level', $request->grade_level);
            });
        }

        // Filter by track (through track strand)
        if ($request->has('track_id')) {
            $query->whereHas('trackStrand', function ($q) use ($request) {
                $q->where('track_id', $request->track_id);
            });
        }

        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $tsbsrs = $query->paginate($perPage);
            $items = collect($tsbsrs->items());

            $items->each(function ($tsbsr) {
                $tsbsr->enrollment_count = $tsbsr->enrollmentCount;
                $tsbsr->has_capacity = $tsbsr->hasCapacity();
            });

            return response()->json([
                'tsbsrs' => $items,
                'pagination' => [
                    'current_page' => $tsbsrs->currentPage(),
                    'last_page' => $tsbsrs->lastPage(),
                    'per_page' => $tsbsrs->perPage(),
                    'total' => $tsbsrs->total(),
                ],
            ]);
        }

        $tsbsrs = $query->get();

        // Add enrollment count to each TSBSR
        $tsbsrs->each(function ($tsbsr) {
            $tsbsr->enrollment_count = $tsbsr->enrollmentCount;
            $tsbsr->has_capacity = $tsbsr->hasCapacity();
        });

        return response()->json([
            'tsbsrs' => $tsbsrs,
        ]);
    }

    /**
     * Store a newly created TSBSR.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'track_strand_id' => 'required|exists:track_strands,id',
            'building_section_id' => 'required|exists:building_sections,id',
            'room_id' => 'required|exists:rooms,id',
        ]);

        $buildingSection = BuildingSection::findOrFail($request->building_section_id);
        $room = Room::findOrFail($request->room_id);

        if ($room->building_id !== null && $room->building_id !== $buildingSection->building_id) {
            return response()->json([
                'message' => 'Selected room does not belong to the selected building section',
            ], 422);
        }

        // Check if combination already exists
        $exists = Tsbsr::where('track_strand_id', $request->track_strand_id)
            ->where('building_section_id', $request->building_section_id)
            ->where('room_id', $request->room_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This TSBSR combination already exists',
            ], 422);
        }

        $tsbsr = Tsbsr::create([
            'track_strand_id' => $request->track_strand_id,
            'building_section_id' => $request->building_section_id,
            'room_id' => $request->room_id,
        ]);

        $tsbsr->load([
            'trackStrand.track',
            'trackStrand.strand',
            'buildingSection.building',
            'buildingSection.section',
            'room.building',
        ]);

        return response()->json([
            'message' => 'TSBSR created successfully',
            'tsbsr' => $tsbsr,
        ], 201);
    }

    /**
     * Display the specified TSBSR.
     */
    public function show(Tsbsr $tsbsr): JsonResponse
    {
        $tsbsr->load([
            'trackStrand.track',
            'trackStrand.strand',
            'buildingSection.building',
            'buildingSection.section',
            'room.building',
            'studentTracks.student.info',
        ]);

        $tsbsr->enrollment_count = $tsbsr->enrollmentCount;
        $tsbsr->has_capacity = $tsbsr->hasCapacity();

        return response()->json([
            'tsbsr' => $tsbsr,
        ]);
    }

    /**
     * Update the specified TSBSR.
     */
    public function update(Request $request, Tsbsr $tsbsr): JsonResponse
    {
        $request->validate([
            'track_strand_id' => 'required|exists:track_strands,id',
            'building_section_id' => 'required|exists:building_sections,id',
            'room_id' => 'required|exists:rooms,id',
        ]);

        $buildingSection = BuildingSection::findOrFail($request->building_section_id);
        $room = Room::findOrFail($request->room_id);

        if ($room->building_id !== null && $room->building_id !== $buildingSection->building_id) {
            return response()->json([
                'message' => 'Selected room does not belong to the selected building section',
            ], 422);
        }

        // Check if combination already exists (excluding current)
        $exists = Tsbsr::where('track_strand_id', $request->track_strand_id)
            ->where('building_section_id', $request->building_section_id)
            ->where('room_id', $request->room_id)
            ->where('id', '!=', $tsbsr->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This TSBSR combination already exists',
            ], 422);
        }

        $tsbsr->update([
            'track_strand_id' => $request->track_strand_id,
            'building_section_id' => $request->building_section_id,
            'room_id' => $request->room_id,
        ]);

        $tsbsr->load([
            'trackStrand.track',
            'trackStrand.strand',
            'buildingSection.building',
            'buildingSection.section',
            'room.building',
        ]);

        return response()->json([
            'message' => 'TSBSR updated successfully',
            'tsbsr' => $tsbsr,
        ]);
    }

    /**
     * Remove the specified TSBSR.
     */
    public function destroy(Tsbsr $tsbsr): JsonResponse
    {
        $tsbsr->delete();

        return response()->json([
            'message' => 'TSBSR deleted successfully',
        ]);
    }
}
