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
        // Members table indexes
        Schema::table('members', function (Blueprint $table) {
            $table->index('user_id', 'idx_members_user_id');
            $table->index('status', 'idx_members_status');
            $table->index('join_date', 'idx_members_join_date');
            $table->index(['status', 'join_date'], 'idx_members_status_join_date');
        });

        // Subscriptions table indexes
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('member_id', 'idx_subscriptions_member_id');
            $table->index('plan_id', 'idx_subscriptions_plan_id');
            $table->index('trainer_id', 'idx_subscriptions_trainer_id');
            $table->index('status', 'idx_subscriptions_status');
            $table->index('end_date', 'idx_subscriptions_end_date');
            $table->index(['status', 'end_date'], 'idx_subscriptions_status_end_date');
            $table->index(['member_id', 'status'], 'idx_subscriptions_member_status');
        });

        // Payments table indexes
        Schema::table('payments', function (Blueprint $table) {
            $table->index('subscription_id', 'idx_payments_subscription_id');
            $table->index('status', 'idx_payments_status');
            $table->index('payment_date', 'idx_payments_payment_date');
            $table->index('payment_method', 'idx_payments_payment_method');
            $table->index(['status', 'payment_date'], 'idx_payments_status_date');
            $table->index('transaction_id', 'idx_payments_transaction_id');
        });

        // Attendances table indexes
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('member_id', 'idx_attendances_member_id');
            $table->index('date', 'idx_attendances_date');
            $table->index(['member_id', 'date'], 'idx_attendances_member_date');
        });

        // Trainers table indexes
        Schema::table('trainers', function (Blueprint $table) {
            $table->index('user_id', 'idx_trainers_user_id');
            $table->index('status', 'idx_trainers_status');
        });

        // Plans table indexes
        Schema::table('plans', function (Blueprint $table) {
            $table->index('status', 'idx_plans_status');
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('status', 'idx_users_status');
            $table->index('email', 'idx_users_email');
        });

        // Expenses table indexes
        Schema::table('expenses', function (Blueprint $table) {
            $table->index('expense_date', 'idx_expenses_expense_date');
            $table->index('category', 'idx_expenses_category');
        });

        // Equipment table indexes
        Schema::table('equipment', function (Blueprint $table) {
            $table->index('status', 'idx_equipment_status');
            $table->index('category', 'idx_equipment_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex('idx_members_user_id');
            $table->dropIndex('idx_members_status');
            $table->dropIndex('idx_members_join_date');
            $table->dropIndex('idx_members_status_join_date');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('idx_subscriptions_member_id');
            $table->dropIndex('idx_subscriptions_plan_id');
            $table->dropIndex('idx_subscriptions_trainer_id');
            $table->dropIndex('idx_subscriptions_status');
            $table->dropIndex('idx_subscriptions_end_date');
            $table->dropIndex('idx_subscriptions_status_end_date');
            $table->dropIndex('idx_subscriptions_member_status');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_subscription_id');
            $table->dropIndex('idx_payments_status');
            $table->dropIndex('idx_payments_payment_date');
            $table->dropIndex('idx_payments_payment_method');
            $table->dropIndex('idx_payments_status_date');
            $table->dropIndex('idx_payments_transaction_id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendances_member_id');
            $table->dropIndex('idx_attendances_date');
            $table->dropIndex('idx_attendances_member_date');
        });

        Schema::table('trainers', function (Blueprint $table) {
            $table->dropIndex('idx_trainers_user_id');
            $table->dropIndex('idx_trainers_status');
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropIndex('idx_plans_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_status');
            $table->dropIndex('idx_users_email');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex('idx_expenses_expense_date');
            $table->dropIndex('idx_expenses_category');
        });

        Schema::table('equipment', function (Blueprint $table) {
            $table->dropIndex('idx_equipment_status');
            $table->dropIndex('idx_equipment_category');
        });
    }
};
