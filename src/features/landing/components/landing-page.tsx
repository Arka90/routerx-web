import { Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { 
  Activity, 
  ShieldCheck, 
  Search, 
  BarChart3, 
  Calendar, 
  FileText, 
  Cpu, 
  Globe, 
  Zap,
  Lock
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { SplitText } from '@/components/ui/split-text';
import { motion } from 'framer-motion';

export function LandingPage() {
  const { sessionToken } = useAuthStore((state) => state.auth);

  const features = [
    {
      title: "Core Monitoring Engine",
      description: "Deterministic background execution via BullMQ repeatable jobs, supporting full HTTP/HTTPS lifecycle.",
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      title: "Uptime & Response Tracking",
      description: "Capture precision metrics: status, response time, status codes, and historical performance charts.",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: "TLS / SSL Monitoring",
      description: "Extract certificate handshakes and calculate days remaining. Prevent outages before they happen.",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      title: "Root Cause Classification",
      description: "Beyond up/down: classify failures by DNS, TCP, TLS, or HTTP level diagnostics.",
      icon: <Search className="w-5 h-5" />,
    },
    {
      title: "Incident Detection",
      description: "Real-time incident detection infrastructure with detailed failure reasons and diagnostics.",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      title: "Response Time Alerts",
      description: "Performance monitoring that alerts you when your site is alive but dying slowly.",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: "Scheduled Maintenance",
      description: "Suppress alerts during defined maintenance windows while maintaining monitoring data.",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Weekly Insights",
      description: "SaaS-ready reliability reports covering uptime %, downtime duration, and latency metrics.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "Queue Infrastructure",
      description: "Horizontally scalable background workers with BullMQ for non-blocking checks at scale.",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Status Pages",
      description: "Expose real-time monitor state and incident history to your customers automatically.",
      icon: <Globe className="w-5 h-5" />,
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-white text-black flex items-center justify-center font-bold text-[10px] uppercase tracking-tighter">
              RX
            </div>
            <span className="text-sm font-bold tracking-tight">RouteRX</span>
          </div>
          <div className="flex items-center gap-6">
            {sessionToken ? (
              <Link 
                to="/dashboard"
                className="text-sm font-medium hover:text-neutral-400 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium hover:text-neutral-400 transition-colors">
                  Login
                </Link>
                <Link 
                  to="/auth/login"
                  className="px-4 py-1.5 bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-all rounded-full"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Enterprise Reliability Engineering
              </span>
            </div>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-center flex flex-col items-center">
            <SplitText text="Reliability" className="mb-2" />
            <span className="text-neutral-500">
              <SplitText text="Engineered." delay={0.5} />
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl leading-relaxed"
          >
            RouteRX delivers deep observability and failure forensics for teams that can't afford a single second of downtime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link 
              to={sessionToken ? "/dashboard" : "/auth/login"}
              className="px-10 py-4 bg-white text-black font-black text-lg hover:bg-neutral-200 transition-all active:scale-95 rounded-full"
            >
              {sessionToken ? "Go to Dashboard" : "Start Monitoring Free"}
            </Link>
          </motion.div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px' 
          }} 
        />
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 mb-4">Precision Infrastructure</h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tighter">Engineered for absolute visibility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <SpotlightCard 
                key={idx} 
                className="h-full border-neutral-900 bg-neutral-950/50 hover:border-neutral-700"
                spotlightColor="rgba(255, 255, 255, 0.03)"
              >
                <div className="h-10 w-10 flex items-center justify-center mb-6 bg-neutral-900 rounded-lg border border-neutral-800 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter italic">Zero. Downtime. Policy.</h2>
          <Link 
            to={sessionToken ? "/dashboard" : "/auth/login"}
            className="inline-block px-12 py-5 bg-white text-black font-black text-xl hover:bg-neutral-200 transition-all rounded-full"
          >
            Deploy RouteRX
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-900 text-center text-neutral-600">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em]">RouteRX © 2026</p>
        </div>
      </footer>
    </div>
  );
}
