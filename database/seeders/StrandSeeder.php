<?php

namespace Database\Seeders;

use App\Models\Strand;
use Illuminate\Database\Seeder;

class StrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $strands = [
            // Academic Track Strands
            'STEM',                         // Science, Technology, Engineering, Mathematics
            'ABM',                          // Accountancy, Business, and Management
            'HUMSS',                        // Humanities and Social Sciences
            'GAS',                          // General Academic Strand

            // TVL Track Strands
            'Home Economics',
            'ICT',                          // Information and Communications Technology
            'Industrial Arts',
            'Agri-Fishery Arts',

            // Arts and Design Track Strands
            'Performing Arts',              // Dance, theater, music
            'Visual Arts',                  // Painting, sculpture, drawing
            'Media Arts',                   // Film, animation, graphic design
            'Literary Arts',                // Creative writing, journalism

            // Sports Track Strands
            'Sports Coaching',
            'Fitness and Sports Services',
            'Sports Officiating',
        ];

        foreach ($strands as $strand) {
            Strand::firstOrCreate(['name' => $strand]);
        }
    }
}
