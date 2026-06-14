<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Track extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the track strands for this track.
     */
    public function trackStrands(): HasMany
    {
        return $this->hasMany(TrackStrand::class);
    }

    /**
     * Get the strands through track strands.
     */
    public function strands()
    {
        return $this->belongsToMany(Strand::class, 'track_strands')
            ->withPivot('grade_level')
            ->withTimestamps();
    }
}
