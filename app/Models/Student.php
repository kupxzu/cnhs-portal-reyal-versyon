<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_number',
        'email',
        'username',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Get the student info (one-to-one).
     */
    public function info(): HasOne
    {
        return $this->hasOne(StudentInfo::class);
    }

    /**
     * Get the student tracks (enrollment history).
     */
    public function studentTracks(): HasMany
    {
        return $this->hasMany(StudentTrack::class);
    }

    /**
     * Get the current enrollment (most recent school year).
     */
    public function currentEnrollment()
    {
        return $this->studentTracks()
            ->where('status', 'enrolled')
            ->orderBy('school_year', 'desc')
            ->first();
    }

    /**
     * Get the full name from student info.
     */
    public function getFullNameAttribute(): ?string
    {
        if (!$this->info) {
            return null;
        }

        $name = "{$this->info->first_name} ";
        
        if ($this->info->middle_name) {
            $name .= "{$this->info->middle_name} ";
        }
        
        $name .= $this->info->last_name;
        
        if ($this->info->extension_name) {
            $name .= " {$this->info->extension_name}";
        }

        return $name;
    }
}
