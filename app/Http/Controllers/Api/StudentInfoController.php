<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentInfo;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentInfoController extends Controller
{
    /**
     * Display the student info for a specific student.
     */
    public function show(Student $student): JsonResponse
    {
        $info = $student->info;

        if (!$info) {
            return response()->json([
                'message' => 'Student info not found',
            ], 404);
        }

        return response()->json([
            'student_info' => $info,
        ]);
    }

    /**
     * Store or update student info.
     */
    public function store(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date|before:today',
            'address' => 'required|string',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'civil_status' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'father_name' => 'nullable|string|max:255',
            'father_occupation' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:255',
            'mother_occupation' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_relationship' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'lrn' => 'nullable|string|max:20',
            'previous_school' => 'nullable|string|max:255',
            'previous_school_address' => 'nullable|string',
        ]);

        $info = StudentInfo::updateOrCreate(
            ['student_id' => $student->id],
            $request->all()
        );

        return response()->json([
            'message' => 'Student info saved successfully',
            'student_info' => $info,
        ], 201);
    }

    /**
     * Update student info.
     */
    public function update(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'last_name' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:10',
            'date_of_birth' => 'sometimes|required|date|before:today',
            'address' => 'sometimes|required|string',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'civil_status' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'father_name' => 'nullable|string|max:255',
            'father_occupation' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:255',
            'mother_occupation' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_relationship' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'lrn' => 'nullable|string|max:20',
            'previous_school' => 'nullable|string|max:255',
            'previous_school_address' => 'nullable|string',
        ]);

        $info = $student->info;

        if (!$info) {
            return response()->json([
                'message' => 'Student info not found. Use POST to create.',
            ], 404);
        }

        $info->update($request->all());

        return response()->json([
            'message' => 'Student info updated successfully',
            'student_info' => $info,
        ]);
    }
}
