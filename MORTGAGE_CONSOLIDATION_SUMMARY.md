# Mortgage Database Consolidation Summary

## Overview
Successfully consolidated duplicate mortgage functionality to use a single database table (`mortgage_profiles`) instead of two separate tables (`mortgage_calculations` and `mortgage_profiles`).

## Changes Made

### 1. Database Service Updates (`src/lib/database.ts`)
- Removed `MortgageCalculation` type definitions
- Updated `mortgageService` to use `mortgage_profiles` table instead of `mortgage_calculations`
- All CRUD operations now work with the unified `mortgage_profiles` table

### 2. Hook Updates (`src/hooks/useSavedCalculations.ts`)
- Updated `SavedMortgageCalculation` interface to match `mortgage_profiles` schema
- Removed fields: `loan_amount`, `down_payment`, `property_tax`, `home_insurance`, `pmi`, `rate_type`
- Added fields: `property_type`, `property_value`, `term_years`
- All operations now use the consolidated table

### 3. Mortgage Page Updates (`src/app/mortgage/page.tsx`)
- Added automatic loading of user's mortgage profiles on page load
- If user has existing mortgage profiles, the first one is loaded as default values
- If no profiles exist, default values are used
- Updated save/load functions to work with new schema
- Added `financialProfileService` import for loading profiles

### 4. Database Migration
- Created `database-migration-remove-mortgage-calculations.sql` to drop the old table
- The old `mortgage_calculations` table is no longer needed

## Benefits

1. **Single Source of Truth**: All mortgage data is now stored in one table
2. **Consistency**: Both financial profile and mortgage calculator pages use the same data structure
3. **Simplified Maintenance**: No need to keep two tables in sync
4. **Better User Experience**: Mortgage calculator automatically loads user's existing mortgage data
5. **Reduced Complexity**: Fewer database operations and simpler codebase

## How It Works Now

### Financial Profile Page (`/financial-profile`)
- Uses `mortgage_profiles` table to store multiple mortgage properties
- Allows users to manage their mortgage portfolio for retirement planning

### Mortgage Calculator Page (`/mortgage`)
- Automatically loads user's first mortgage profile as default values
- If no profiles exist, uses sensible default values
- Save/Load functionality works with the same `mortgage_profiles` table
- Users can save calculations as new mortgage profiles

## Database Schema
The consolidated `mortgage_profiles` table includes:
- `id`, `user_id`, `name`
- `property_type` (primary, holiday, buy-to-let, etc.)
- `property_value`, `mortgage_amount`
- `interest_rate`, `term_years`
- `payment_type` (repayment/interest-only)
- `extra_payment`, `start_date`
- `fixed_rate_end_date`, `variable_rate`, `variable_rate_enabled`
- `created_at`, `updated_at`

## Migration Steps
1. Update application code (completed)
2. Run `database-migration-remove-mortgage-calculations.sql` to drop old table
3. Test both pages to ensure functionality works correctly

## Testing Checklist
- [ ] Financial profile page loads and saves mortgage profiles correctly
- [ ] Mortgage calculator page loads existing profiles as defaults
- [ ] Mortgage calculator save/load functionality works
- [ ] No data loss during migration
- [ ] Both pages can create, read, update, and delete mortgage profiles
