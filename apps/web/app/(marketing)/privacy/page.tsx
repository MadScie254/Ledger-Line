import Link from "next/link";

export default function PrivacyPage() {
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
            <Link href="/terms" className="text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="/login" className="text-brass-600 hover:text-brass-700 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate prose-brass max-w-none">
          <p className="lead text-lg text-slate-700">
            At LedgerLine, we take your privacy and the security of your financial data extremely seriously. This Privacy Policy outlines how we collect, use, and protect your information.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-6">
            We collect information you provide directly to us, such as when you create an account, enter financial data, or communicate with our support team. This includes your name, email address, company details, and transaction records.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-6">
            We use your data strictly to operate and improve the LedgerLine platform. We use it to authenticate you, generate financial reports, process your accounting entries, and communicate important service updates.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">3. Data Security and Isolation</h2>
          <p className="text-slate-600 mb-6">
            LedgerLine utilizes strict Row-Level Security (RLS) on our database infrastructure to ensure that your financial data is completely isolated. Data belonging to your workspace cannot be accessed by other organizations under any circumstances.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">4. Sharing of Information</h2>
          <p className="text-slate-600 mb-6">
            We do not sell your personal or financial information. We only share information with trusted third-party service providers (such as hosting and email providers) who are bound by strict confidentiality agreements.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">5. Your Rights</h2>
          <p className="text-slate-600 mb-6">
            Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. You can export your financial ledgers at any time from the LedgerLine dashboard.
          </p>

          <hr className="my-12 border-slate-200" />
          
          <p className="text-sm text-slate-500">
            If you have privacy concerns or requests, please contact privacy@ledgerline.com.
          </p>
        </div>
      </main>
    </div>
  );
}
