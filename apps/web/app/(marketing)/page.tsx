import Link from "next/link";

import { 
  Scale, 
  ReceiptText, 
  Landmark, 
  ChartNoAxesCombined, 
  ShieldCheck, 
  Globe, 
  ChevronDown,
  Building2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

// ─── Static feature data ───────────────────────────────────────────────────
const features = [
  {
    icon: <Scale className="h-6 w-6 text-brass-500" />,
    title: "True Double-Entry Ledger",
    description:
      "Every transaction posts balanced debits and credits across your chart of accounts. No shortcuts, no approximations — just rock-solid accounting as standard.",
  },
  {
    icon: <ReceiptText className="h-6 w-6 text-brass-500" />,
    title: "Invoices & Bills",
    description:
      "Create professional invoices, track payments, manage supplier bills and allocations — all with automatic journal entries posted the moment you save.",
  },
  {
    icon: <Landmark className="h-6 w-6 text-brass-500" />,
    title: "Bank Reconciliation",
    description:
      "Import bank statements via CSV or M-Pesa feed, auto-match transactions against your ledger, and close the period with confidence.",
  },
  {
    icon: <ChartNoAxesCombined className="h-6 w-6 text-brass-500" />,
    title: "Real-time Reports",
    description:
      "Profit & Loss, Balance Sheet, Cash Flow statement, and Aged Receivables — generated instantly from live journal data, exportable to PDF or Excel.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-brass-500" />,
    title: "Role-Based Access Control",
    description:
      "Grant bookkeepers read access, give managers approval rights, and keep financial data away from staff who don't need it — per-module permissions.",
  },
  {
    icon: <Globe className="h-6 w-6 text-brass-500" />,
    title: "Multi-Currency & Tax",
    description:
      "Native KES, USD, EUR, and UGX support with live exchange rates. VAT, WHT, and PAYE calculations built in for Kenya, Uganda, and Tanzania.",
  },
];

const faqs = [
  {
    question: "Do I need accounting experience to use LedgerLine?",
    answer: "No. While LedgerLine is built on professional double-entry principles, our intuitive interfaces for invoicing, bills, and banking automatically handle the complex journal entries behind the scenes. Your accountant will love the data, and you'll love the ease of use."
  },
  {
    question: "How does the M-Pesa integration work?",
    answer: "You can securely connect your M-Pesa Till or Paybill number. Transactions flow in automatically, and LedgerLine's AI suggests matches against open invoices or standard expense categories to speed up reconciliation."
  },
  {
    question: "Can my external auditor or accountant access my books?",
    answer: "Yes, you can invite your accountant as a dedicated user with 'Accountant' permissions. They get free access to your workspace to review journals, export reports, and help you close the period."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-grade encryption, continuous backups, and strict tenant isolation so your data is never mixed with other organizations. We also provide full audit logs for every change made in your workspace."
  }
];

const testimonials = [
  {
    quote:
      "We replaced three different tools with LedgerLine and cut month-end close from five days to one afternoon.",
    name: "Grace Wanjiru",
    role: "CFO, Kijani Grocers",
    initials: "GW",
    color: "bg-ledger-green",
  },
  {
    quote:
      "The double-entry engine caught a KES 280,000 reconciliation discrepancy that our previous software had missed for six months.",
    name: "David Omondi",
    role: "Head of Finance, Lakefront Hotels",
    initials: "DO",
    color: "bg-brass",
  },
  {
    quote:
      "Onboarding took 20 minutes. Our chart of accounts was imported, our team was set up, and we posted our first invoice the same day.",
    name: "Amina Hassan",
    role: "Director, Coast Logistics",
    initials: "AH",
    color: "bg-ink",
  },
];

const plans = [
  {
    name: "Starter",
    price: "KES 2,900",
    period: "/ month",
    description: "Perfect for sole traders and micro-businesses.",
    features: [
      "1 organisation",
      "Chart of Accounts",
      "Invoicing & Bills",
      "Bank import (CSV)",
      "P&L and Balance Sheet",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Business",
    price: "KES 7,900",
    period: "/ month",
    description: "For growing companies that need full accounting coverage.",
    features: [
      "Everything in Starter",
      "Payroll (up to 50 employees)",
      "Multi-currency",
      "Bank reconciliation",
      "Aged Receivables & Payables",
      "Role-based access (5 seats)",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations with complex requirements.",
    features: [
      "Everything in Business",
      "Unlimited seats",
      "Custom integrations",
      "Dedicated onboarding",
      "SLA & audit trail",
      "Custom reporting",
      "Account manager",
    ],
    cta: "Contact us",
    href: "mailto:enterprise@ledgerline.app",
    highlighted: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────
export default function MarketingPage() {
  return (
    <div className="marketing-root">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="marketing-nav">
        <div className="marketing-container nav-inner">
          <span className="brand">
            <span className="brand-double-rule" aria-hidden="true" />
            LedgerLine
          </span>
          <ul className="nav-links" role="list">
            <li><a href="#features">Features</a></li>
            <li><a href="#testimonials">Customers</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn btn-primary">Start free trial</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="marketing-container hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            Built for East Africa
          </div>
          <h1 className="hero-headline">
            Accounting software<br />
            <span className="hero-headline-accent">your CFO will love.</span>
          </h1>
          <p className="hero-subheadline">
            LedgerLine is a double-entry accounting platform built for East African SMEs.
            Bank-grade accuracy. Beautiful reporting. No accountancy degree required.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start your free 30-day trial
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign in to your workspace
            </Link>
          </div>
          <p className="hero-footnote">No credit card required · Cancel anytime · KES-native pricing</p>
        </div>

        {/* Decorative ledger grid */}
        <div className="hero-ledger-preview" aria-hidden="true">
          <div className="ledger-card">
            <div className="ledger-card-header">
              <span className="ledger-card-title">Profit &amp; Loss — July 2026</span>
              <span className="ledger-card-badge live">Live</span>
            </div>
            <div className="ledger-row ledger-row-section">Revenue</div>
            <div className="ledger-row">
              <span>Sales — Domestic</span><span className="ledger-amount credit">4,812,000.00</span>
            </div>
            <div className="ledger-row">
              <span>Sales — Export</span><span className="ledger-amount credit">1,240,000.00</span>
            </div>
            <div className="ledger-row ledger-row-total">
              <span>Total Revenue</span><span className="ledger-amount credit">6,052,000.00</span>
            </div>
            <div className="ledger-row ledger-row-section">Expenses</div>
            <div className="ledger-row">
              <span>Cost of Goods Sold</span><span className="ledger-amount debit">2,190,000.00</span>
            </div>
            <div className="ledger-row">
              <span>Staff costs</span><span className="ledger-amount debit">820,000.00</span>
            </div>
            <div className="ledger-row ledger-row-total net-profit">
              <span>Net Profit</span><span className="ledger-amount credit">3,042,000.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────── */}
      <section className="trust-section">
        <div className="marketing-container">
          <p className="trust-eyebrow">Trusted by forward-thinking businesses across East Africa</p>
          <div className="trust-logos">
            <div className="trust-logo">Kijani Grocers</div>
            <div className="trust-logo">Lakefront Hotels</div>
            <div className="trust-logo">Coast Logistics</div>
            <div className="trust-logo">Mara Essentials</div>
            <div className="trust-logo">Athi River Manufacturing</div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="how-it-works-section bg-paper-dark">
        <div className="marketing-container">
          <div className="section-header">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">Automate the busywork, focus on growth</h2>
          </div>
          <div className="how-it-works-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Connect & Import</h3>
              <p className="step-description">Link your bank feeds and M-Pesa tills, or upload a CSV. Your financial data flows securely into your workspace.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">AI Auto-categorization</h3>
              <p className="step-description">Our intelligent engine suggests matches for transactions, invoices, and expenses based on your past activity.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Close with Confidence</h3>
              <p className="step-description">Validate your exact debit-credit trial balance. Generate compliant tax reports and share them with your auditor in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="features-section">
        <div className="marketing-container">
          <div className="section-header">
            <p className="section-eyebrow">Everything you need</p>
            <h2 className="section-title">Accounting that works the way accountants think</h2>
            <p className="section-description">
              LedgerLine is built on a genuine double-entry engine. Every feature flows from that
              foundation — no workarounds, no hidden single-entry hacks.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────────────── */}
      <section id="testimonials" className="testimonials-section">
        <div className="marketing-container">
          <div className="section-header">
            <p className="section-eyebrow">Customer stories</p>
            <h2 className="section-title">Trusted by East Africa's fastest-growing businesses</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <footer className="testimonial-footer">
                  <div className={`testimonial-avatar ${t.color}`} aria-hidden="true">
                    {t.initials}
                  </div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="pricing-section">
        <div className="marketing-container">
          <div className="section-header">
            <p className="section-eyebrow">Simple pricing</p>
            <h2 className="section-title">Plans that grow with your business</h2>
            <p className="section-description">
              All plans include a 30-day free trial. No credit card required.
            </p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-card ${plan.highlighted ? "pricing-card-highlighted" : ""}`}
              >
                {plan.highlighted && (
                  <div className="pricing-badge">Most popular</div>
                )}
                <h3 className="pricing-plan-name">{plan.name}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
                <p className="pricing-description">{plan.description}</p>
                <ul className="pricing-features" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="pricing-feature-item">
                      <span className="pricing-check" aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`btn btn-lg pricing-cta ${plan.highlighted ? "btn-primary" : "btn-outline"}`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="marketing-container cta-inner">
          <h2 className="cta-title">Ready to close your books with confidence?</h2>
          <p className="cta-description">
            Join hundreds of East African businesses that trust LedgerLine for their accounting.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg btn-cta">
            Start your free 30-day trial →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="marketing-footer">
        <div className="marketing-container footer-inner">
          <div className="footer-brand-col">
            <span className="brand footer-brand">
              <span className="brand-double-rule" aria-hidden="true" />
              LedgerLine
            </span>
            <p className="footer-copy">
              © {new Date().getFullYear()} LedgerLine Technologies Ltd.<br />
              Nairobi, Kenya.
            </p>
          </div>
          
          <div className="footer-links-grid">
            <div className="footer-link-group">
              <h4 className="footer-link-title">Product</h4>
              <nav aria-label="Product navigation">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#testimonials">Customers</a>
                <a href="/catalog">Component Catalog</a>
              </nav>
            </div>
            <div className="footer-link-group">
              <h4 className="footer-link-title">Company</h4>
              <nav aria-label="Company navigation">
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="mailto:support@ledgerline.app">Support</a>
              </nav>
            </div>
            <div className="footer-link-group">
              <h4 className="footer-link-title">Legal</h4>
              <nav aria-label="Legal navigation">
                <a href="/terms">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="#">Security</a>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Styles (scoped via class prefix) ─────────────────────────── */}
      <style>{`
        /* Reset / base */
        .marketing-root {
          --ink: #0b1b33;
          --ink-light: #122744;
          --paper: #f6f5f1;
          --paper-dark: #edebe4;
          --brass: #b8863b;
          --brass-light: #c99b52;
          --slate: #5b6472;
          --slate-light: #c8ced7;
          --green: #0f5132;
          --white: #ffffff;
          --radius: 10px;
          --shadow: 0 2px 12px rgba(11,27,51,0.10), 0 1px 3px rgba(11,27,51,0.06);
          --shadow-lg: 0 8px 40px rgba(11,27,51,0.13), 0 2px 8px rgba(11,27,51,0.07);

          font-family: "IBM Plex Sans", "Inter", ui-sans-serif, system-ui, sans-serif;
          color: var(--ink);
          background: var(--paper);
          line-height: 1.6;
        }

        .marketing-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          border: 1.5px solid transparent;
        }
        .btn-lg { padding: 14px 28px; font-size: 16px; }
        .btn-primary {
          background: var(--ink);
          color: var(--white);
          border-color: var(--ink);
        }
        .btn-primary:hover {
          background: var(--ink-light);
          border-color: var(--ink-light);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(11,27,51,0.22);
        }
        .btn-ghost {
          background: transparent;
          color: var(--ink);
          border-color: transparent;
        }
        .btn-ghost:hover { background: var(--paper-dark); }
        .btn-outline {
          background: transparent;
          color: var(--ink);
          border-color: var(--slate-light);
        }
        .btn-outline:hover {
          border-color: var(--ink);
          background: var(--paper-dark);
        }

        /* ── Brand ── */
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--ink);
          text-decoration: none;
        }
        .brand-double-rule {
          display: inline-block;
          width: 4px;
          height: 22px;
          border-left: 1px solid var(--brass);
          border-right: 1px solid var(--brass);
        }

        /* ── Nav ── */
        .marketing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(246, 245, 241, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--slate-light);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          gap: 32px;
          height: 64px;
        }
        .nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 24px;
          flex: 1;
        }
        .nav-links a {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--slate);
          transition: color 0.15s;
        }
        .nav-links a:hover { color: var(--ink); }
        .nav-actions { display: flex; align-items: center; gap: 8px; }

        /* ── Hero ── */
        .hero-section {
          padding: 96px 0 80px;
          overflow: hidden;
          position: relative;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--paper-dark);
          border: 1px solid var(--slate-light);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: var(--slate);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .hero-badge-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brass);
        }
        .hero-headline {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          color: var(--ink);
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .hero-headline-accent { color: var(--brass); }
        .hero-subheadline {
          font-size: 18px;
          line-height: 1.7;
          color: var(--slate);
          margin: 0 0 36px;
          max-width: 480px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .hero-footnote {
          font-size: 12px;
          color: var(--slate);
          margin: 0;
        }

        /* Ledger preview card */
        .hero-ledger-preview {
          display: flex;
          justify-content: center;
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .ledger-card {
          background: var(--white);
          border: 1px solid var(--slate-light);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          padding: 24px;
          width: 100%;
          max-width: 420px;
          font-size: 13px;
        }
        .ledger-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--slate-light);
        }
        .ledger-card-title {
          font-weight: 700;
          font-size: 13px;
          color: var(--ink);
          letter-spacing: 0.02em;
        }
        .ledger-card-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .ledger-card-badge.live {
          background: #d1fae5;
          color: var(--green);
        }
        .ledger-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--paper-dark);
          color: var(--slate);
        }
        .ledger-row-section {
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--brass);
          padding-top: 12px;
          border-bottom: none;
        }
        .ledger-row-total {
          font-weight: 700;
          color: var(--ink);
          border-bottom: 2px solid var(--slate-light);
          border-top: 1px solid var(--slate-light);
        }
        .net-profit .ledger-amount { color: var(--green) !important; }
        .ledger-amount { font-family: "IBM Plex Mono", "Courier New", monospace; }
        .ledger-amount.credit { color: var(--green); }
        .ledger-amount.debit { color: var(--ink); }

        /* ── Sections shared ── */
        .section-header {
          text-align: center;
          margin-bottom: 56px;
        }
        .section-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brass);
          margin: 0 0 12px;
        }
        .section-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 700;
          line-height: 1.2;
          color: var(--ink);
          margin: 0 auto 16px;
          max-width: 680px;
          letter-spacing: -0.02em;
        }
        .section-description {
          font-size: 16px;
          color: var(--slate);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Features ── */
        .features-section {
          padding: 96px 0;
          background: var(--white);
          border-top: 1px solid var(--slate-light);
          border-bottom: 1px solid var(--slate-light);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 28px;
        }
        .feature-card {
          background: var(--paper);
          border: 1px solid var(--slate-light);
          border-radius: var(--radius);
          padding: 28px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .feature-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
        }
        .feature-icon { font-size: 28px; margin-bottom: 16px; }
        .feature-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 10px;
        }
        .feature-description {
          font-size: 14px;
          color: var(--slate);
          line-height: 1.65;
          margin: 0;
        }

        /* ── Testimonials ── */
        .testimonials-section {
          padding: 96px 0;
          background: var(--ink);
        }
        .testimonials-section .section-eyebrow { color: var(--brass-light); }
        .testimonials-section .section-title { color: var(--white); }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .testimonial-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius);
          padding: 28px;
          margin: 0;
          transition: background 0.2s;
        }
        .testimonial-card:hover { background: rgba(255,255,255,0.10); }
        .testimonial-quote {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255,255,255,0.9);
          margin: 0 0 24px;
          font-style: italic;
        }
        .testimonial-footer { display: flex; align-items: center; gap: 12px; }
        .testimonial-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--white);
          flex-shrink: 0;
        }
        .bg-ledger-green { background: var(--green); }
        .bg-brass { background: var(--brass); }
        .bg-ink { background: var(--ink-light); border: 1px solid rgba(255,255,255,0.2); }
        .testimonial-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          margin: 0 0 2px;
        }
        .testimonial-role { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0; }

        /* ── Pricing ── */
        .pricing-section {
          padding: 96px 0;
          background: var(--paper);
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          align-items: start;
        }
        .pricing-card {
          background: var(--white);
          border: 1px solid var(--slate-light);
          border-radius: var(--radius);
          padding: 32px;
          position: relative;
          transition: box-shadow 0.2s;
        }
        .pricing-card:hover { box-shadow: var(--shadow); }
        .pricing-card-highlighted {
          border-color: var(--ink);
          box-shadow: var(--shadow-lg);
          transform: scale(1.02);
        }
        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--brass);
          color: var(--white);
          font-size: 11px;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .pricing-plan-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 16px;
        }
        .pricing-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }
        .pricing-amount {
          font-size: 32px;
          font-weight: 800;
          color: var(--ink);
          font-family: "IBM Plex Mono", monospace;
        }
        .pricing-period { font-size: 14px; color: var(--slate); }
        .pricing-description { font-size: 14px; color: var(--slate); margin: 0 0 24px; }
        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pricing-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--ink);
        }
        .pricing-check {
          color: var(--green);
          font-weight: 700;
          flex-shrink: 0;
        }
        .pricing-cta { width: 100%; justify-content: center; }

        /* ── CTA band ── */
        .cta-section {
          background: linear-gradient(135deg, var(--brass) 0%, #8a6228 100%);
          padding: 80px 0;
        }
        .cta-inner { text-align: center; }
        .cta-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          color: var(--white);
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .cta-description {
          font-size: 17px;
          color: rgba(255,255,255,0.85);
          margin: 0 0 36px;
        }
        .btn-cta {
          background: var(--white) !important;
          color: var(--ink) !important;
          border-color: var(--white) !important;
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }

        /* ── Footer ── */
        /* ── Trust Bar ── */
        .trust-section {
          background: var(--paper-dark);
          padding: 40px 0;
          border-top: 1px solid var(--slate-light);
          border-bottom: 1px solid var(--slate-light);
        }
        .trust-eyebrow {
          text-align: center;
          font-size: 13px;
          color: var(--slate);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 24px;
        }
        .trust-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
        }
        .trust-logo {
          font-family: Georgia, serif;
          font-size: 18px;
          color: var(--slate);
          opacity: 0.6;
          font-weight: 700;
        }

        /* ── How it works ── */
        .how-it-works-section {
          padding: 96px 0;
        }
        .how-it-works-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }
        .step-card {
          background: var(--white);
          border: 1px solid var(--slate-light);
          border-radius: var(--radius);
          padding: 32px;
          position: relative;
        }
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--brass);
          color: var(--white);
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 24px;
        }
        .step-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 12px;
        }
        .step-description {
          font-size: 15px;
          color: var(--slate);
          line-height: 1.6;
          margin: 0;
        }

        /* ── FAQ ── */
        .faq-section {
          padding: 96px 0;
        }
        .faq-list {
          max-width: 768px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .faq-item {
          background: var(--white);
          border: 1px solid var(--slate-light);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          list-style: none;
        }
        .faq-question::-webkit-details-marker {
          display: none;
        }
        .faq-answer {
          padding: 0 24px 24px;
          font-size: 15px;
          color: var(--slate);
          line-height: 1.6;
        }

        /* ── Footer ── */
        .marketing-footer {
          background: var(--ink);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 64px 0;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 48px;
        }
        .footer-brand-col {
          max-width: 280px;
        }
        .footer-brand { color: var(--white); margin-bottom: 16px; }
        .footer-brand .brand-double-rule { border-color: var(--brass); }
        .footer-copy { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; line-height: 1.6; }
        
        .footer-links-grid {
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
        }
        .footer-link-group {
          display: flex;
          flex-direction: column;
        }
        .footer-link-title {
          color: var(--white);
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 20px;
        }
        .footer-link-group nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-link-group a {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link-group a:hover { color: var(--white); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-ledger-preview { order: -1; }
          .nav-links { display: none; }
          .pricing-card-highlighted { transform: none; }
          .footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
