<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add soft deletes to members
        Schema::table('members', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to subscriptions
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to trainers
        Schema::table('trainers', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to plans
        Schema::table('plans', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to users
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to attendances
        Schema::table('attendances', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to expenses
        Schema::table('expenses', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to equipment
        Schema::table('equipment', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('trainers', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('equipment', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
