<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Drop the unique constraint that prevents multiple sessions per day
            $table->dropUnique(['member_id', 'date']);
            
            // Add duration column (in minutes)
            $table->integer('duration')->nullable()->after('check_out_time');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('duration');
            $table->unique(['member_id', 'date']);
        });
    }
};
