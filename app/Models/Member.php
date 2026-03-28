<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'gender',
        'date_of_birth',
        'address',
        'photo',
        'join_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'join_date' => 'date',
    ];

    protected $with = ['user']; // Always eager load user

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // Accessor for convenience - access member name via $member->name
    public function getNameAttribute(): ?string
    {
        return $this->user?->name;
    }

    // Accessor for email
    public function getEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    // Accessor for phone
    public function getPhoneAttribute(): ?string
    {
        return $this->user?->phone;
    }
}
