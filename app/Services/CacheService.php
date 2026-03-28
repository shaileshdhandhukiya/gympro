<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Cache TTL in seconds
     */
    const TTL_SHORT = 300; // 5 minutes
    const TTL_MEDIUM = 1800; // 30 minutes
    const TTL_LONG = 3600; // 1 hour
    const TTL_DAY = 86400; // 24 hours

    /**
     * Cache tags
     */
    const TAG_SETTINGS = 'settings';
    const TAG_PLANS = 'plans';
    const TAG_REPORTS = 'reports';
    const TAG_MEMBERS = 'members';
    const TAG_SUBSCRIPTIONS = 'subscriptions';

    /**
     * Remember a value in cache
     */
    public function remember(string $key, int $ttl, callable $callback)
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Remember with tags
     */
    public function rememberWithTags(array $tags, string $key, int $ttl, callable $callback)
    {
        return Cache::tags($tags)->remember($key, $ttl, $callback);
    }

    /**
     * Forget a cache key
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Flush cache by tags
     */
    public function flushTags(array $tags): bool
    {
        return Cache::tags($tags)->flush();
    }

    /**
     * Clear all cache
     */
    public function clearAll(): bool
    {
        return Cache::flush();
    }

    /**
     * Get cache key for settings
     */
    public function getSettingKey(string $key): string
    {
        return "setting:{$key}";
    }

    /**
     * Get cache key for plans
     */
    public function getPlansKey(string $status = 'active'): string
    {
        return "plans:{$status}";
    }

    /**
     * Get cache key for reports
     */
    public function getReportKey(array $filters): string
    {
        return 'reports:' . md5(json_encode($filters));
    }
}
