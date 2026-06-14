<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentTrack extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'tsbsr_id',
        'school_year',
        'status',
    ];

    /**
     * Get the student for this enrollment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the TSBSR for this enrollment.
     */
    public function tsbsr(): BelongsTo
    {
        return $this->belongsTo(Tsbsr::class);
    }

    /**
     * Scope a query to only include enrolled students.
     */
    public function scopeEnrolled($query)
    {
        return $query->where('status', 'enrolled');
    }

    /**
     * Scope a query to filter by school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Check if student is currently enrolled.
     */
    public function isEnrolled(): bool
    {
        return $this->status === 'enrolled';
    }
}
