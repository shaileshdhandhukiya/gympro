<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Role;
use App\Models\Member;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
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

        return $user;
    }
}

