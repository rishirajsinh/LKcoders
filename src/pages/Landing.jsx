import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Toast from '../components/ui/Toast';

/* ─── Scroll Reveal Wrapper ─── */
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.7s var(--smooth) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.4s var(--spring)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      e.currentTarget.style.borderColor = 'rgba(255,200,0,0.4)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
      e.currentTarget.style.borderColor = 'var(--border-default)';
    }}
    >
      <div style={{ width: 48, height: 48, marginBottom: '16px', color: 'var(--text-primary)' }}>{icon}</div>
      <h3 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export default function Landing() {
  const [pricingMonthly, setPricingMonthly] = useState(true);

  const features = [
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, title: 'AI Report Generator', desc: 'Generates full PDF-ready report cards in 3 seconds with personalized teacher comments.' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, title: 'Student Risk Detector', desc: 'Identifies at-risk students 3 weeks before failure with 91% confidence.' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Performance Predictor', desc: 'Predicts end-term scores with 94% accuracy using historical trend analysis.' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>, title: 'Smart Teaching Suggestions', desc: 'AI recommends lesson plans based on class weakness patterns.' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, title: 'Auto Attendance Analyzer', desc: 'Detects patterns like "Mondays see 40% drop" and suggests interventions.' },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Sentiment Analysis', desc: 'Analyzes student engagement from participation data and flags disengagement.' },
  ];

  const pricingPlans = [
    { name: 'Free', price: 0, desc: 'For individual teachers', features: ['Up to 30 students', 'Basic attendance', 'Manual reports', 'Dark/Light mode', 'Email support'], highlighted: false },
    { name: 'Pro', price: pricingMonthly ? 29 : 24, desc: 'For schools & departments', features: ['Unlimited students', 'All AI features', 'Risk detection', 'PDF exports', 'Priority support', 'API access', 'Custom branding'], highlighted: true },
    { name: 'Enterprise', price: pricingMonthly ? 99 : 79, desc: 'For institutions', features: ['Multi-school support', 'Advanced analytics', 'SSO integration', 'Dedicated support', 'SLA guarantee', 'Custom AI models', 'On-premise option', 'Training included'], highlighted: false },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      <Toast />

      {/* ═══ HERO SECTION ═══ */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 5% 60px',
        background: '#f1f5f9', // light gray off-white base
        overflow: 'hidden',
      }}>
        {/* Dark asterisk top approx middle */}
        <svg style={{ position: 'absolute', top: '25%', left: '48%', width: '30px', height: '30px', color: '#111827' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/>
        </svg>
        {/* Small bottom left star */}
        <svg style={{ position: 'absolute', bottom: '20%', left: '26%', width: '25px', height: '25px', color: '#111827' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/>
        </svg>
        {/* Dark green leaf/plant bottom left */}
        <svg style={{ position: 'absolute', bottom: '5%', left: '15%', width: '150px', height: '150px', color: '#0f5132' }} viewBox="0 0 100 100" fill="currentColor">
          <path d="M30 80 Q50 30 70 50 Q60 80 30 80 Z" />
          <path d="M30 80 Q20 40 40 20 Q55 50 30 80 Z" />
          <path d="M30 80 Q60 70 85 90 Q60 100 30 80 Z" />
        </svg>
        {/* Palette icon bottom left */}
        <svg style={{ position: 'absolute', bottom: '8%', left: '5%', width: '80px', height: '80px' }} viewBox="0 0 100 100">
           <path d="M10 50 A40 40 0 1 1 90 50 A40 40 0 0 1 10 50 Z" fill="#ffffff" />
           <circle cx="30" cy="35" r="8" fill="#e11d48"/>
           <circle cx="50" cy="20" r="8" fill="#3b82f6"/>
           <circle cx="70" cy="35" r="8" fill="#10b981"/>
           <circle cx="65" cy="55" r="8" fill="#f59e0b"/>
           <circle cx="30" cy="60" r="10" fill="#e5e7eb"/>
        </svg>
        {/* Dark green blob top left */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '350px', height: '350px', transform: 'translate(-30%, -30%)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0 L100 0 A100 100 0 0 1 0 100 Z" fill="#0f5132" />
        </svg>
        {/* Decorative dashed lines left */}
        <svg style={{ position: 'absolute', top: '10%', left: '20%', width: '150px', height: '150px' }} viewBox="0 0 100 100">
           <path d="M10 50 Q 30 10 90 50" fill="none" stroke="#111827" strokeWidth="2" strokeDasharray="5,5" opacity="0.3"/>
        </svg>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: '1200px',
          width: '100%',
          gap: '40px',
        }} className="hero-container">
          {/* Left Text */}
          <div style={{ flex: 1, zIndex: 2, paddingRight: '20px' }}>
             <h1 style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', fontWeight: 900, lineHeight: 1.1, color: '#111827', textTransform: 'uppercase', marginBottom: '24px' }}>
               The Path To<br/>Excellence
             </h1>
             <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '32px', maxWidth: '500px', lineHeight: 1.6 }}>
               Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
             </p>
             <Link to="/register" style={{
               display: 'inline-block', padding: '14px 40px', background: '#FFC800', color: '#111827', borderRadius: '40px', fontWeight: 800, textDecoration: 'none', fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(255, 200, 0, 0.4)'
             }}>
               REGISTER
             </Link>
          </div>

          {/* Right Imagery */}
          <div style={{ flex: 1, position: 'relative', height: '550px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1 }}>
            {/* Yellow Blob */}
            <div style={{
              position: 'absolute', right: '-15%', top: '-10%', width: '130%', height: '120%',
              background: '#FFC800', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', zIndex: -1
            }} />
            {/* White/Gray dashed blobs */}
            <svg style={{ position: 'absolute', bottom: '30%', right: '-5%', width: '150px', height: '150px' }} viewBox="0 0 100 100">
               <path d="M10 50 A40 40 0 1 1 90 50 A40 40 0 0 1 10 50 Z" fill="none" stroke="#111827" strokeWidth="2" strokeDasharray="5,5" opacity="0.3"/>
            </svg>

            {/* Math Text */}
            <div style={{ position: 'absolute', top: '10%', right: '40%', fontFamily: 'serif', fontSize: '1.4rem', color: '#fff', transform: 'rotate(-5deg)' }}>
              (x+y)² = x² + 2xy + y²
            </div>
            <div style={{ position: 'absolute', top: '25%', right: '5%', fontFamily: 'serif', fontSize: '1.4rem', color: '#fff', transform: 'rotate(10deg)' }}>
              a² + b² = c²
            </div>

            {/* Rocket */}
            <svg style={{ position: 'absolute', bottom: '30%', left: '-5%', width: '100px', height: '100px', transform: 'rotate(45deg)' }} viewBox="0 0 100 100">
              <path d="M40 80 L30 100 L50 90 L70 100 L60 80 Z" fill="#ef4444"/>
              <path d="M20 60 Q50 10 80 60 Q50 100 20 60 Z" fill="#3b82f6"/>
              <path d="M50 30 A10 10 0 1 1 50.1 30 Z" fill="#fff" stroke="#111827" strokeWidth="4"/>
              <path d="M10 80 L30 65 L40 85 Z" fill="#f59e0b" />
              <path d="M90 80 L70 65 L60 85 Z" fill="#f59e0b" />
            </svg>

            {/* Students Container */}
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {/* Fake grayscale avatars / images as block divs */}
              <div style={{
                position: 'absolute', bottom: 0, left: '5%', width: '240px', height: '400px',
                background: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80) center/cover',
                borderRadius: '120px 120px 0 0', filter: 'grayscale(100%) contrast(1.1)', zIndex: 1
              }} />
              <div style={{
                position: 'absolute', bottom: 0, right: '5%', width: '280px', height: '450px',
                background: 'url(https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80) 60% 40%/cover',
                borderRadius: '140px 140px 0 0', filter: 'grayscale(100%) contrast(1.1)', zIndex: 2
              }} />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-container { flex-direction: column !important; text-align: center; margin-top: 60px; }
            .hero-container > div:first-child { align-items: center; padding-right: 0px !important; }
            .hero-container h1 { font-size: clamp(2.5rem, 8vw, 3.5rem) !important; }
          }
        `}</style>
      </section>

      {/* ═══ AI FEATURES SECTION ═══ */}
      <section id="features" style={{
        position: 'relative', zIndex: 1,
        padding: '100px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.8rem', color: 'var(--primary-light)', marginBottom: '16px',
            }}>AI Features</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '16px' }}>
              The <span className="gradient-text">AI Brain</span> Behind Edubase
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Powered by state-of-the-art language models, Edubase transforms raw academic data into actionable intelligence.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <FeatureCard {...f} delay={i * 0.3} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{
        position: 'relative', zIndex: 1,
        padding: '100px 32px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
        </ScrollReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Add Students', desc: 'Import or add student data to your class' },
            { step: '02', icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, title: 'Mark Attendance', desc: 'Quick toggle-based daily attendance' },
            { step: '03', icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>, title: 'AI Analyzes', desc: 'AI processes data for patterns & risks' },
            { step: '04', icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, title: 'Get Insights', desc: 'Actionable insights and smart reports' },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div style={{
                textAlign: 'center',
                padding: '32px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                transition: 'all 0.4s var(--spring)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>STEP {item.step}</div>
                <div style={{ marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{
        position: 'relative', zIndex: 1,
        padding: '100px 32px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '4px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <button onClick={() => setPricingMonthly(true)} style={{
                padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600,
                background: pricingMonthly ? 'var(--primary)' : 'transparent',
                color: pricingMonthly ? 'white' : 'var(--text-secondary)',
                border: 'none', transition: 'all 0.3s',
              }}>Monthly</button>
              <button onClick={() => setPricingMonthly(false)} style={{
                padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600,
                background: !pricingMonthly ? 'var(--primary)' : 'transparent',
                color: !pricingMonthly ? 'white' : 'var(--text-secondary)',
                border: 'none', transition: 'all 0.3s', position: 'relative',
              }}>
                Yearly
                <span style={{
                  position: 'absolute', top: -8, right: -8,
                  padding: '2px 6px', borderRadius: 'var(--radius-full)',
                  background: 'var(--emerald)', color: 'white',
                  fontSize: '0.6rem', fontWeight: 700,
                }}>-20%</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {pricingPlans.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div style={{
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                background: plan.highlighted ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                border: `1px solid ${plan.highlighted ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-default)'}`,
                transition: 'all 0.4s var(--spring)',
                position: 'relative',
                ...(plan.highlighted && { transform: 'scale(1.05)' }),
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = `translateY(-8px) ${plan.highlighted ? 'scale(1.07)' : 'scale(1.02)'}`;
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = plan.highlighted ? 'scale(1.05)' : '';
                e.currentTarget.style.boxShadow = '';
              }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                    color: 'white', fontSize: '0.75rem', fontWeight: 700,
                  }}>MOST POPULAR</div>
                )}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{plan.desc}</p>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '4px' }}>
                  ${plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
                <Link to="/register" className={plan.highlighted ? 'btn-gradient' : 'btn-outline'} style={{
                  display: 'block', textAlign: 'center', marginTop: '20px', marginBottom: '24px',
                  padding: '12px', width: '100%', borderRadius: 'var(--radius-md)', textDecoration: 'none'
                }}>
                  <span>Get Started</span>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--emerald)' }}>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '80px 32px',
        margin: '60px 32px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        border: '1px solid rgba(99,102,241,0.3)',
        textAlign: 'center',
        maxWidth: '1000px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '16px' }}>
          Start Automating Today — <span className="gradient-text">Free Forever</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Join 10,000+ educators already using AI to transform their classrooms.
        </p>
        <Link to="/register" className="btn-gradient" style={{ padding: '16px 48px', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '40px' }}>
          <span>Get Started Free →</span>
        </Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '60px 32px 40px',
        borderTop: '1px solid var(--border-default)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#FFC800" />
                  <polygon points="50,60 42,75 58,75" fill="#FFC800" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Edubase</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '250px' }}>
              Academic administration that transforms how education works.
            </p>
          </div>
          {/* Links */}
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'API', 'Changelog'] },
            { title: 'Resources', links: ['Documentation', 'Blog', 'Community', 'Support'] },
            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>{col.title}</h4>
              {col.links.map(link => (
                <div key={link} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '4px 0', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
          paddingTop: '24px', borderTop: '1px solid var(--border-default)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Edubase. All rights reserved.</div>
          <div style={{
            display: 'inline-flex', padding: '6px 14px', borderRadius: 'var(--radius-full)',
            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
            fontSize: '0.75rem', color: 'var(--ai-glow)',
          }}>Built with AI ✦</div>
        </div>
      </footer>
    </div>
  );
}
