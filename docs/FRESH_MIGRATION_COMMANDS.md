# Fresh Migration & Admin User Setup Commands

## Quick Start (Copy & Paste)

### Option 1: Fresh Migration with Seeding (Recommended)
```bash
php artisan migrate:fresh --seed
```

### Option 2: Fresh Migration Only (No Seeding)
```bash
php artisan migrate:fresh
```

### Option 3: Then Seed Separately
```bash
php artisan db:seed
```

### Option 4: Seed Only Admin
```bash
php artisan db:seed --class=AdminSeeder
```

---

## What Each Command Does

### `php artisan migrate:fresh --seed`
- ✅ Drops all tables
- ✅ Runs all migrations
- ✅ Runs all seeders (creates admin user + roles + permissions)
- ✅ Creates sample data

**Use this for**: Fresh development setup

---

### `php artisan migrate:fresh`
- ✅ Drops all tables
- ✅ Runs all migrations
- ❌ Does NOT seed data

**Use this for**: When you want to migrate without seeding

---

### `php artisan db:seed`
- ❌ Does NOT drop tables
- ❌ Does NOT run migrations
- ✅ Runs all seeders

**Use this for**: Adding data to existing database

---

### `php artisan db:seed --class=AdminSeeder`
- ❌ Does NOT drop tables
- ❌ Does NOT run migrations
- ✅ Runs only AdminSeeder

**Use this for**: Creating only admin user

---

## Admin User Credentials

**Email**: shaileshdhandhukiya012@gmail.com
**Password**: 123456789

---

## Step-by-Step Setup

```bash
# 1. Fresh migration with all seeders
php artisan migrate:fresh --seed

# 2. Start development server
php artisan serve

# 3. Open browser
# http://127.0.0.1:8000

# 4. Login with admin credentials
# Email: shaileshdhandhukiya012@gmail.com
# Password: 123456789
```

---

## Troubleshooting

### If migration fails
```bash
# Check migration status
php artisan migrate:status

# Rollback all
php artisan migrate:rollback --step=999

# Then try fresh
php artisan migrate:fresh --seed
```

### If seeding fails
```bash
# Check what seeders exist
ls database/seeders/

# Run specific seeder
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=AdminSeeder
```

### If admin user not created
```bash
# Check if user exists
php artisan tinker
>>> User::where('email', 'shaileshdhandhukiya012@gmail.com')->first();

# If not, create manually
>>> User::create(['email' => 'shaileshdhandhukiya012@gmail.com', 'name' => 'Admin', 'password' => bcrypt('123456789')]);
```

---

## Recommended Command

```bash
php artisan migrate:fresh --seed
```

This single command will:
1. Drop all tables
2. Run all migrations
3. Create admin user
4. Create roles and permissions
5. Create sample plans
6. Create sample exercises
