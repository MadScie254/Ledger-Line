import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brass-400/30">
      {/* Simple Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-brass-500 to-brass-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-brass-400/50">
              LL
            </div>
            <span className="font-semibold tracking-tight">LedgerLine</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/login" className="text-brass-600 hover:text-brass-700 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate prose-brass max-w-none">
          <p className="lead text-lg text-slate-700">
            Welcome to LedgerLine. By accessing or using our financial and accounting services, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-6">
            By creating an account, you agree to use LedgerLine responsibly and in compliance with all applicable local, national, and international laws, including but not limited to financial regulations in your jurisdiction.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">2. Account Registration and Security</h2>
          <p className="text-slate-600 mb-6">
            You are responsible for safeguarding your account credentials. LedgerLine employs strict isolation mechanisms to ensure your data is secure, but you must not share your password or grant unauthorized access to your workspace.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">3. Data Ownership</h2>
          <p className="text-slate-600 mb-6">
            You retain all rights to the financial data you input into LedgerLine. We claim no ownership over your journals, ledgers, or customer information. We use your data strictly to provide the accounting service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">4. Subscription and Billing</h2>
          <p className="text-slate-600 mb-6">
            Certain features of LedgerLine are available under paid subscription plans. All payments are non-refundable unless legally required in your jurisdiction.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">5. Disclaimer of Warranties</h2>
          <p className="text-slate-600 mb-6">
            While we strive for 100% accuracy in our double-entry ledger engine, LedgerLine is provided "as is". We recommend consulting a certified public accountant (CPA) for formal tax and financial advice.
          </p>

          <hr className="my-12 border-slate-200" />
          
          <p className="text-sm text-slate-500">
            If you have questions about these Terms, please contact support@ledgerline.com.
          </p>
        </div>
      </main>
    </div>
  );
}
