<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuildingSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuildingSectionController extends Controller
{
    /**
     * Display a listing of building sections.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BuildingSection::with(['building', 'section']);

        // Filter by building
        if ($request->has('building_id')) {
            $query->where('building_id', $request->building_id);
        }

        // Filter by section
        if ($request->has('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $buildingSections = $query->paginate($perPage);

            return response()->json([
                'building_sections' => $buildingSections->items(),
                'pagination' => [
                    'current_page' => $buildingSections->currentPage(),
                    'last_page' => $buildingSections->lastPage(),
                    'per_page' => $buildingSections->perPage(),
                    'total' => $buildingSections->total(),
                ],
            ]);
        }

        $buildingSections = $query->get();

        return response()->json([
            'building_sections' => $buildingSections,
        ]);
    }

    /**
     * Store a newly created building section.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        // Check if combination already exists
        $exists = BuildingSection::where('building_id', $request->building_id)
            ->where('section_id', $request->section_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This building-section combination already exists',
            ], 422);
        }

        $buildingSection = BuildingSection::create([
            'building_id' => $request->building_id,
            'section_id' => $request->section_id,
        ]);

        $buildingSection->load(['building', 'section']);

        return response()->json([
            'message' => 'Building section created successfully',
            'building_section' => $buildingSection,
        ], 201);
    }

    /**
     * Display the specified building section.
     */
    public function show(BuildingSection $buildingSection): JsonResponse
    {
        $buildingSection->load(['building', 'section']);

        return response()->json([
            'building_section' => $buildingSection,
        ]);
    }

    /**
     * Update the specified building section.
     */
    public function update(Request $request, BuildingSection $buildingSection): JsonResponse
    {
        $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        // Check if combination already exists (excluding current)
        $exists = BuildingSection::where('building_id', $request->building_id)
            ->where('section_id', $request->section_id)
            ->where('id', '!=', $buildingSection->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This building-section combination already exists',
            ], 422);
        }

        $buildingSection->update([
            'building_id' => $request->building_id,
            'section_id' => $request->section_id,
        ]);

        $buildingSection->load(['building', 'section']);

        return response()->json([
            'message' => 'Building section updated successfully',
            'building_section' => $buildingSection,
        ]);
    }

    /**
     * Remove the specified building section.
     */
    public function destroy(BuildingSection $buildingSection): JsonResponse
    {
        $buildingSection->delete();

        return response()->json([
            'message' => 'Building section deleted successfully',
        ]);
    }
}
