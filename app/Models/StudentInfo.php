<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentInfo extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'last_name',
        'first_name',
        'middle_name',
        'extension_name',
        'date_of_birth',
        'address',
        'phone_number',
        'gender',
        'civil_status',
        'nationality',
        'religion',
        'father_name',
        'father_occupation',
        'father_phone',
        'mother_name',
        'mother_occupation',
        'mother_phone',
        'guardian_name',
        'guardian_relationship',
        'guardian_phone',
        'guardian_address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'lrn',
        'previous_school',
        'previous_school_address',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    /**
     * Get the student that owns this info.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the full name.
     */
    public function getFullNameAttribute(): string
    {
        $name = "{$this->first_name} ";
        
        if ($this->middle_name) {
            $name .= "{$this->middle_name} ";
        }
        
        $name .= $this->last_name;
        
        if ($this->extension_name) {
            $name .= " {$this->extension_name}";
        }

        return $name;
    }

    /**
     * Get the age based on date of birth.
     */
    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->diffInYears(now());
    }
}
