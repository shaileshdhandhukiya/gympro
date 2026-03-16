<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\NewSubscriptionAdminNotification;
use App\Notifications\PaymentConfirmedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PhonePePaymentController extends Controller
{
    // -------------------------------------------------------------------------
    // Checkout page — show plan + amount summary
    // -------------------------------------------------------------------------

    public function checkout($planId)
    {
        $member = Member::where('user_id', auth()->id())->with('user')->first();
        if (!$member) abort(404, 'Member profile not found');

        $plan = Plan::findOrFail($planId);

        $hasActiveSubscription = Subscription::where('member_id', $member->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->exists();

        $amount = $plan->price + ($hasActiveSubscription ? 0 : $plan->admission_fee);

        return Inertia::render('member/Checkout', [
            'plan'                  => $plan,
            'member'                => $member,
            'amount'                => $amount,
            'hasActiveSubscription' => $hasActiveSubscription,
        ]);
    }

    // -------------------------------------------------------------------------
    // Initiate payment — create pending record, redirect to PhonePe
    // -------------------------------------------------------------------------

    public function initiatePayment(Request $request, $planId)
    {
        if (Setting::get('phonepe_enabled', '0') !== '1') {
            return redirect()->route('member.plans.checkout', $planId)
                ->with('error', 'Payment gateway is currently disabled');
        }

        $member = Member::where('user_id', auth()->id())->with('user')->firstOrFail();
        $plan   = Plan::findOrFail($planId);

        $hasActiveSubscription = Subscription::where('member_id', $member->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->exists();

        $amount          = $plan->price + ($hasActiveSubscription ? 0 : $plan->admission_fee);
        $merchantOrderId = 'ORD' . time() . random_int(1000, 9999);
        $merchantId      = Setting::get('phonepe_merchant_id');
        $saltKey         = Setting::get('phonepe_salt_key');
        $saltIndex       = Setting::get('phonepe_salt_index', '1');
        $env             = Setting::get('phonepe_env', 'UAT');

        $paymentUrl = $env === 'PRODUCTION'
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
            : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

        try {
            $payload = [
                'merchantId'            => $merchantId,
                'merchantTransactionId' => $merchantOrderId,
                'merchantUserId'        => 'MUID' . $member->id,
                'amount'                => (int) round($amount * 100),
                'redirectUrl'           => route('phonepe.redirect', ['orderId' => $merchantOrderId]),
                'redirectMode'          => 'REDIRECT',
                'callbackUrl'           => route('phonepe.webhook', ['orderId' => $merchantOrderId]),
                'mobileNumber'          => $member->user->phone ?? '',
                'paymentInstrument'     => ['type' => 'PAY_PAGE'],
            ];

            $base64Payload = base64_encode(json_encode($payload));
            $xVerify       = hash('sha256', $base64Payload . '/pg/v1/pay' . $saltKey) . '###' . $saltIndex;

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-VERIFY'     => $xVerify,
            ])->post($paymentUrl, ['request' => $base64Payload]);

            $data = $response->json();

            Log::info('PhonePe initiate response', ['order_id' => $merchantOrderId, 'response' => $data]);

            if (!$response->successful() || !($data['success'] ?? false)) {
                return redirect()->route('member.plans.checkout', $planId)
                    ->with('error', 'Failed to initiate payment: ' . ($data['message'] ?? 'Unknown error'));
            }

            $redirectUrl = $data['data']['instrumentResponse']['redirectInfo']['url'] ?? null;
            if (!$redirectUrl) {
                return redirect()->route('member.plans.checkout', $planId)
                    ->with('error', 'Payment gateway error: No redirect URL received');
            }

            DB::table('pending_payments')->insert([
                'order_id'   => $merchantOrderId,
                'member_id'  => $member->id,
                'plan_id'    => $plan->id,
                'amount'     => $amount,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error('PhonePe initiate error', ['error' => $e->getMessage()]);
            return redirect()->route('member.plans.checkout', $planId)
                ->with('error', 'Payment error: ' . $e->getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Webhook — server-to-server POST from PhonePe (CSRF-exempt, signature-verified)
    // -------------------------------------------------------------------------

    public function webhook(Request $request, string $orderId)
    {
        // 1. Verify X-VERIFY signature
        if (!$this->verifyWebhookSignature($request)) {
            Log::warning('PhonePe webhook: invalid signature', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        // 2. Decode and validate payload
        $encodedResponse = $request->input('response');
        if (!$encodedResponse) {
            return response()->json(['message' => 'Missing response payload'], 400);
        }

        $decoded = json_decode(base64_decode($encodedResponse), true);
        $transactionId = $decoded['data']['merchantTransactionId'] ?? null;
        $responseCode  = $decoded['data']['responseCode'] ?? null;

        if (!$transactionId || $transactionId !== $orderId) {
            Log::warning('PhonePe webhook: transaction ID mismatch', [
                'url_order_id'  => $orderId,
                'payload_tx_id' => $transactionId,
            ]);
            return response()->json(['message' => 'Transaction ID mismatch'], 400);
        }

        // 3. Idempotency — skip if already processed
        $pending = DB::table('pending_payments')
            ->where('order_id', $orderId)
            ->whereNull('processed_at')
            ->first();

        if (!$pending) {
            Log::info('PhonePe webhook: already processed or not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'OK']);
        }

        // 4. Only activate on SUCCESS
        if ($responseCode !== 'SUCCESS') {
            Log::info('PhonePe webhook: payment not successful', [
                'order_id'      => $orderId,
                'response_code' => $responseCode,
            ]);
            DB::table('pending_payments')->where('order_id', $orderId)->delete();
            return response()->json(['message' => 'Payment not successful']);
        }

        // 5. Create subscription + payment atomically
        try {
            $this->processSuccessfulPayment($pending, $orderId);
        } catch (\Exception $e) {
            Log::error('PhonePe webhook: transaction failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Internal error'], 500);
        }

        return response()->json(['message' => 'OK']);
    }

    // -------------------------------------------------------------------------
    // Redirect — browser return from PhonePe (GET, auth-protected)
    // Polls PhonePe status API as a safety net in case webhook hasn't fired yet
    // -------------------------------------------------------------------------

    public function redirect(Request $request, string $orderId)
    {
        $pending = DB::table('pending_payments')->where('order_id', $orderId)->first();

        if (!$pending) {
            // Already cleaned up — subscription exists
            return redirect()->route('member.dashboard')
                ->with('success', 'Payment successful! Your subscription is now active.');
        }

        // Webhook already processed it
        if ($pending->processed_at) {
            DB::table('pending_payments')->where('order_id', $orderId)->delete();
            return redirect()->route('member.dashboard')
                ->with('success', 'Payment successful! Your subscription is now active.');
        }

        // Webhook hasn't fired yet — query PhonePe status API directly as fallback
        $status = $this->queryPhonePeStatus($orderId);

        if ($status === 'SUCCESS') {
            $this->processSuccessfulPayment($pending, $orderId);
            return redirect()->route('member.dashboard')
                ->with('success', 'Payment successful! Your subscription is now active.');
        }

        if ($status === 'FAILED' || $status === 'PAYMENT_ERROR') {
            DB::table('pending_payments')->where('order_id', $orderId)->delete();
            return redirect()->route('member.plans')
                ->with('error', 'Payment failed. Please try again.');
        }

        // Still pending (PENDING / INITIATED)
        return redirect()->route('member.dashboard')
            ->with('info', 'Your payment is being verified. Your subscription will activate shortly.');
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function verifyWebhookSignature(Request $request): bool
    {
        $xVerifyHeader = $request->header('X-VERIFY');
        if (!$xVerifyHeader) {
            return false;
        }

        // X-VERIFY format: "<sha256hash>###<saltIndex>"
        $parts = explode('###', $xVerifyHeader);
        if (count($parts) !== 2) {
            return false;
        }

        $receivedHash = $parts[0];
        $saltKey      = Setting::get('phonepe_salt_key');
        $saltIndex    = Setting::get('phonepe_salt_index', '1');

        // PhonePe callback X-VERIFY: sha256(base64EncodedResponse + saltKey)
        // NOTE: No endpoint path — that is only used when initiating a payment
        $encodedResponse = $request->input('response', '');
        $expectedHash    = hash('sha256', $encodedResponse . $saltKey);

        // Constant-time comparison to prevent timing attacks
        return hash_equals($expectedHash, $receivedHash) && $parts[1] === $saltIndex;
    }

    // -------------------------------------------------------------------------
    // Query PhonePe status API
    // -------------------------------------------------------------------------

    private function queryPhonePeStatus(string $orderId): string
    {
        try {
            $merchantId = Setting::get('phonepe_merchant_id');
            $saltKey    = Setting::get('phonepe_salt_key');
            $saltIndex  = Setting::get('phonepe_salt_index', '1');
            $env        = Setting::get('phonepe_env', 'UAT');

            $endpoint  = "/pg/v1/status/{$merchantId}/{$orderId}";
            $xVerify   = hash('sha256', $endpoint . $saltKey) . '###' . $saltIndex;
            $statusUrl = ($env === 'PRODUCTION'
                ? 'https://api.phonepe.com/apis/hermes'
                : 'https://api-preprod.phonepe.com/apis/hermes') . $endpoint;

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Content-Type'  => 'application/json',
                'X-VERIFY'      => $xVerify,
                'X-MERCHANT-ID' => $merchantId,
            ])->get($statusUrl);

            $data = $response->json();
            Log::info('PhonePe status check', ['order_id' => $orderId, 'response' => $data]);

            return $data['data']['responseCode'] ?? 'PENDING';
        } catch (\Exception $e) {
            Log::error('PhonePe status check failed', ['order_id' => $orderId, 'error' => $e->getMessage()]);
            return 'PENDING';
        }
    }

    // -------------------------------------------------------------------------
    // Shared subscription+payment creation (used by both webhook and redirect fallback)
    // -------------------------------------------------------------------------

    private function processSuccessfulPayment(object $pending, string $orderId): void
    {
        DB::transaction(function () use ($pending, $orderId) {
            $locked = DB::table('pending_payments')
                ->where('order_id', $orderId)
                ->whereNull('processed_at')
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                return; // Already handled by webhook
            }

            DB::table('pending_payments')
                ->where('order_id', $orderId)
                ->update(['processed_at' => now(), 'updated_at' => now()]);

            $member = Member::with('user')->findOrFail($pending->member_id);
            $plan   = Plan::findOrFail($pending->plan_id);

            Subscription::where('member_id', $member->id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            $subscription = Subscription::create([
                'member_id'  => $member->id,
                'plan_id'    => $plan->id,
                'start_date' => now(),
                'end_date'   => now()->addMonths($plan->duration_months),
                'status'     => 'active',
            ]);

            Payment::create([
                'subscription_id' => $subscription->id,
                'amount'          => $pending->amount,
                'payment_method'  => 'phonepe',
                'payment_source'  => 'gateway',
                'payment_type'    => 'plan',
                'payment_date'    => now(),
                'transaction_id'  => $orderId,
                'status'          => 'completed',
            ]);

            $this->dispatchNotifications($subscription, $member, $plan, $pending->amount);

            Log::info('PhonePe: subscription activated', [
                'order_id'        => $orderId,
                'subscription_id' => $subscription->id,
            ]);
        });
    }

    private function dispatchNotifications($subscription, $member, $plan, $amount): void
    {
        $memberPayload = [
            'subscription_id' => $subscription->id,
            'payment_id'      => null,
            'plan_name'       => $plan->name,
            'amount'          => $amount,
        ];

        // Ensure this only runs if the transaction commits without error
        DB::afterCommit(function () use ($member, $memberPayload, $plan, $amount) {
            // Member gets a first-person payment confirmation
            if ($member->user) {
                $member->user->notify(new PaymentConfirmedNotification($memberPayload));
            }

            // Admins get a third-person new subscription alert
            $adminPayload = array_merge($memberPayload, ['member_name' => $member->user->name]);

            User::whereHas('roles', fn($q) => $q->whereIn('name', ['Admin', 'Manager']))
                ->get()
                ->each(fn($admin) => $admin->notify(new NewSubscriptionAdminNotification($adminPayload)));
        });
    }
}
