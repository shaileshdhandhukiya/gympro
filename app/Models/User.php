<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'profile_image',
        'status',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /** @var array<string>|null */
    private ?array $permissionsCache = null;

    public function getAllPermissions(): array
    {
        if ($this->permissionsCache === null) {
            $this->permissionsCache = $this->roles()->with('permissions')->get()
                ->pluck('permissions')->flatten()
                ->pluck('name')->unique()->values()->toArray();
        }

        return $this->permissionsCache;
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->getAllPermissions());
    }

    public function can($ability, $arguments = []): bool
    {
        return $this->hasPermission($ability) || parent::can($ability, $arguments);
    }

    public function flushPermissionsCache(): void
    {
        $this->permissionsCache = null;
    }

    public function member()
    {
        return $this->hasOne(Member::class);
    }

    public function trainer()
    {
        return $this->hasOne(Trainer::class);
    }

    public function isMember(): bool
    {
        return $this->relationLoaded('roles')
            ? $this->roles->contains('name', 'Member')
            : $this->roles()->where('name', 'Member')->exists();
    }

    public function isTrainer(): bool
    {
        return $this->relationLoaded('roles')
            ? $this->roles->contains('name', 'Trainer')
            : $this->roles()->where('name', 'Trainer')->exists();
    }

    public function isAdmin(): bool
    {
        return $this->relationLoaded('roles')
            ? $this->roles->contains(fn($r) => in_array($r->name, ['Admin', 'Manager']))
            : $this->roles()->whereIn('name', ['Admin', 'Manager'])->exists();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationSettings()
    {
        return $this->hasMany(NotificationSetting::class);
    }
}
