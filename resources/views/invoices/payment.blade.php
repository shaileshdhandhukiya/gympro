<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice {{ $payment->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .invoice-info { margin-bottom: 30px; }
        .invoice-info table { width: 100%; }
        .invoice-info td { padding: 5px; }
        .details { margin-top: 30px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .details th { background-color: #f4f4f4; }
        .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>GYM PRO</h1>
        <p>Payment Invoice</p>
    </div>

    <div class="invoice-info">
        <table>
            <tr>
                <td><strong>Invoice Number:</strong> {{ $payment->invoice_number }}</td>
                <td style="text-align: right;"><strong>Date:</strong> {{ \Carbon\Carbon::parse($payment->payment_date)->format('d M, Y') }}</td>
            </tr>
            <tr>
                <td><strong>Member:</strong> {{ $payment->member->name }}</td>
                <td style="text-align: right;"><strong>Status:</strong> {{ strtoupper($payment->status) }}</td>
            </tr>
            @if($payment->member->email)
            <tr>
                <td><strong>Email:</strong> {{ $payment->member->email }}</td>
                <td></td>
            </tr>
            @endif
            @if($payment->member->phone)
            <tr>
                <td><strong>Phone:</strong> {{ $payment->member->phone }}</td>
                <td></td>
            </tr>
            @endif
        </table>
    </div>

    <div class="details">
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Type</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        @if($payment->subscription)
                            {{ $payment->subscription->plan->name }} Subscription
                        @else
                            {{ ucfirst($payment->payment_type) }} Payment
                        @endif
                    </td>
                    <td>{{ strtoupper(str_replace('_', ' ', $payment->payment_method)) }}</td>
                    <td>{{ ucfirst($payment->payment_type) }}</td>
                    <td>Rs. {{ number_format($payment->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="total">
        Total Amount: Rs. {{ number_format($payment->amount, 2) }}
    </div>

    @if($payment->notes)
    <div style="margin-top: 30px;">
        <strong>Notes:</strong>
        <p>{{ $payment->notes }}</p>
    </div>
    @endif

    @if($payment->transaction_id)
    <div style="margin-top: 20px;">
        <strong>Transaction ID:</strong> {{ $payment->transaction_id }}
    </div>
    @endif

    <div class="footer">
        <p>Thank you for your payment!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
</body>
</html>
