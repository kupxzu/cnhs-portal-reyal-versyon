<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','student','registrar','teacher') NOT NULL DEFAULT 'student'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("UPDATE users SET role = 'registrar' WHERE role IN ('admin', 'student')");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('registrar','teacher') NOT NULL DEFAULT 'registrar'");
    }
};
