<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'duration_months',
        'price',
        'admission_fee',
        'shift',
        'shift_time',
        'personal_training',
        'group_classes',
        'locker_facility',
        'description',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'admission_fee' => 'decimal:2',
    ];

    /**
     * Boot method to clear cache on changes
     */
    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('plans:active');
            Cache::forget('plans:all');
        });

        static::deleted(function () {
            Cache::forget('plans:active');
            Cache::forget('plans:all');
        });
    }

    /**
     * Get features for this plan
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'plan_features');
    }

    /**
     * Get subscriptions for this plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active plans with caching
     */
    public static function getActivePlans()
    {
        return Cache::remember('plans:active', 3600, function () {
            return self::with('features')
                ->where('status', 'active')
                ->get();
        });
    }
}
