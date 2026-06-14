<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StudentAuthController extends Controller
{
    /**
     * Student login.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $student = Student::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->orWhere('id_number', $request->username)
            ->first();

        if (!$student || !Hash::check($request->password, $student->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $student->createToken('student-token', ['student'])->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'student' => $student->load('info'),
            'token' => $token,
        ]);
    }

    /**
     * Student registration.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'id_number' => 'required|string|unique:students',
            'email' => 'required|string|email|max:255|unique:students',
            'username' => 'required|string|max:255|unique:students',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $student = Student::create([
            'id_number' => $request->id_number,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password,
        ]);

        $token = $student->createToken('student-token', ['student'])->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'student' => $student,
            'token' => $token,
        ], 201);
    }

    /**
     * Student logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get current student profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $student = $request->user()->load(['info', 'studentTracks.tsbsr.trackStrand.track', 'studentTracks.tsbsr.trackStrand.strand']);

        return response()->json([
            'student' => $student,
        ]);
    }
}
