<?php

namespace Database\Seeders;

use App\Models\Track;
use App\Models\Strand;
use App\Models\TrackStrand;
use Illuminate\Database\Seeder;

class TrackStrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define track-strand mappings
        $trackStrandMappings = [
            'Academic' => ['STEM', 'ABM', 'HUMSS', 'GAS'],
            'TVL' => ['Home Economics', 'ICT', 'Industrial Arts', 'Agri-Fishery Arts'],
            'Arts and Design' => ['Performing Arts', 'Visual Arts', 'Media Arts', 'Literary Arts'],
            'Sports' => ['Sports Coaching', 'Fitness and Sports Services', 'Sports Officiating'],
        ];

        $gradeLevels = ['11', '12'];

        foreach ($trackStrandMappings as $trackName => $strandNames) {
            $track = Track::where('name', $trackName)->first();

            if (!$track) {
                continue;
            }

            foreach ($strandNames as $strandName) {
                $strand = Strand::where('name', $strandName)->first();

                if (!$strand) {
                    continue;
                }

                // Create for both grade levels
                foreach ($gradeLevels as $gradeLevel) {
                    TrackStrand::firstOrCreate([
                        'track_id' => $track->id,
                        'strand_id' => $strand->id,
                        'grade_level' => $gradeLevel,
                    ]);
                }
            }
        }
    }
}
