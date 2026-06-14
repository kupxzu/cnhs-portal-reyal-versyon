<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['info', 'studentTracks.tsbsr.trackStrand']);

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhereHas('info', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by enrollment status
        if ($request->has('status')) {
            $query->whereHas('studentTracks', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        // Filter by school year
        if ($request->has('school_year')) {
            $query->whereHas('studentTracks', function ($q) use ($request) {
                $q->where('school_year', $request->school_year);
            });
        }

        $students = $query->paginate($request->per_page ?? 15);

        return response()->json($students);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_number' => 'required|string|unique:students',
            'email' => 'required|string|email|max:255|unique:students',
            'username' => 'required|string|max:255|unique:students',
            'password' => 'required|string|min:8',
        ]);

        $student = Student::create([
            'id_number' => $request->id_number,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password,
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student,
        ], 201);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): JsonResponse
    {
        $student->load([
            'info',
            'studentTracks.tsbsr.trackStrand.track',
            'studentTracks.tsbsr.trackStrand.strand',
            'studentTracks.tsbsr.buildingSection.building',
            'studentTracks.tsbsr.buildingSection.section',
            'studentTracks.tsbsr.room',
        ]);

        return response()->json([
            'student' => $student,
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'id_number' => 'sometimes|required|string|unique:students,id_number,' . $student->id,
            'email' => 'sometimes|required|string|email|max:255|unique:students,email,' . $student->id,
            'username' => 'sometimes|required|string|max:255|unique:students,username,' . $student->id,
            'password' => 'sometimes|required|string|min:8',
        ]);

        $student->update($request->only(['id_number', 'email', 'username', 'password']));

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student,
        ]);
    }

    /**
     * Remove the specified student (soft delete).
     */
    public function destroy(Student $student): JsonResponse
    {
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully',
        ]);
    }

    /**
     * Restore a soft-deleted student.
     */
    public function restore($id): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $student->restore();

        return response()->json([
            'message' => 'Student restored successfully',
            'student' => $student,
        ]);
    }
}
