<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
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
     * Get the building sections for this section.
     */
    public function buildingSections(): HasMany
    {
        return $this->hasMany(BuildingSection::class);
    }

    /**
     * Get the buildings through building sections.
     */
    public function buildings()
    {
        return $this->belongsToMany(Building::class, 'building_sections')
            ->withTimestamps();
    }
}
