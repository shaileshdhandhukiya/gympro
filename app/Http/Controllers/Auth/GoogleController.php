<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Member;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Failed to authenticate with Google');
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update(['google_id' => $googleUser->getId()]);
            } else {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(str()->random(24)),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]);

                // Assign Member role by default
                $memberRole = Role::where('name', 'Member')->first();
                if ($memberRole) {
                    $user->roles()->attach($memberRole->id);
                }
                
                // Create Member record
                Member::create([
                    'user_id' => $user->id,
                    'status' => 'active',
                    'join_date' => now()->toDateString(),
                ]);
            }
        }

        Auth::login($user, true);

        return redirect('/dashboard');
    }
}
