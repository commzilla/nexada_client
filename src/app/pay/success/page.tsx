export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="mt-2 text-gray-600">
          Thank you! Your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>
        <p className="mt-6 text-sm text-gray-400">Powered by Nexada</p>
      </div>
    </div>
  );
}
