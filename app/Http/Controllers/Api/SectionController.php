<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    /**
     * Display a listing of sections.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Section::with('buildings');
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $sections = $query->paginate($perPage);

            return response()->json([
                'sections' => $sections->items(),
                'pagination' => [
                    'current_page' => $sections->currentPage(),
                    'last_page' => $sections->lastPage(),
                    'per_page' => $sections->perPage(),
                    'total' => $sections->total(),
                ],
            ]);
        }

        $sections = $query->get();

        return response()->json([
            'sections' => $sections,
        ]);
    }

    /**
     * Store a newly created section.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sections',
        ]);

        $section = Section::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Section created successfully',
            'section' => $section,
        ], 201);
    }

    /**
     * Display the specified section.
     */
    public function show(Section $section): JsonResponse
    {
        $section->load(['buildingSections.building']);

        return response()->json([
            'section' => $section,
        ]);
    }

    /**
     * Update the specified section.
     */
    public function update(Request $request, Section $section): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sections,name,' . $section->id,
        ]);

        $section->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Section updated successfully',
            'section' => $section,
        ]);
    }

    /**
     * Remove the specified section.
     */
    public function destroy(Section $section): JsonResponse
    {
        $section->delete();

        return response()->json([
            'message' => 'Section deleted successfully',
        ]);
    }
}
