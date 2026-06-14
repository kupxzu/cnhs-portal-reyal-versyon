<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    /**
     * Display a listing of tracks.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Track::with('strands');
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $tracks = $query->paginate($perPage);

            return response()->json([
                'tracks' => $tracks->items(),
                'pagination' => [
                    'current_page' => $tracks->currentPage(),
                    'last_page' => $tracks->lastPage(),
                    'per_page' => $tracks->perPage(),
                    'total' => $tracks->total(),
                ],
            ]);
        }

        $tracks = $query->get();

        return response()->json([
            'tracks' => $tracks,
        ]);
    }

    /**
     * Store a newly created track.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tracks',
        ]);

        $track = Track::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Track created successfully',
            'track' => $track,
        ], 201);
    }

    /**
     * Display the specified track.
     */
    public function show(Track $track): JsonResponse
    {
        $track->load(['trackStrands.strand']);

        return response()->json([
            'track' => $track,
        ]);
    }

    /**
     * Update the specified track.
     */
    public function update(Request $request, Track $track): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tracks,name,' . $track->id,
        ]);

        $track->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Track updated successfully',
            'track' => $track,
        ]);
    }

    /**
     * Remove the specified track.
     */
    public function destroy(Track $track): JsonResponse
    {
        $track->delete();

        return response()->json([
            'message' => 'Track deleted successfully',
        ]);
    }
}
