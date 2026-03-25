import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  FileText, 
  Shield,
  Zap,
  Globe,
  Clock,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Event Planning',
    description: 'Organize concerts, festivals, and corporate events with intelligent scheduling and resource management.',
  },
  {
    icon: Users,
    title: 'Artist & Vendor Management',
    description: 'Track bookings, contracts, and communications with artists, venues, and service providers.',
  },
  {
    icon: FileText,
    title: 'AI Contract Analysis',
    description: 'Upload artist contracts and venue agreements for instant AI-powered risk assessment.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Manage deposits, payments, and invoicing with bank-level security and compliance.',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate reminders, approvals, and notifications to keep your events on track.',
  },
  {
    icon: Globe,
    title: 'Multi-Venue Support',
    description: 'Manage multiple venues, stages, and locations from a single dashboard.',
  },
];

const stats = [
  { value: '500+', label: 'Events Managed' },
  { value: '98%', label: 'Success Rate' },
  { value: '24/7', label: 'Support' },
  { value: '50+', label: 'Cities' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Event Director, SoundWave Festivals',
    content: 'EMS transformed how we manage our music festivals. The AI contract analysis alone saved us from several risky vendor agreements.',
    avatar: 'SM',
  },
  {
    name: 'Marcus Chen',
    role: 'Tour Manager, Starlight Productions',
    content: 'Managing artist bookings and tour logistics has never been easier. The automated reminders keep everything on schedule.',
    avatar: 'MC',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Venue Coordinator, Grand Hall',
    content: 'The venue management features are incredible. We can track multiple events simultaneously with zero conflicts.',
    avatar: 'ER',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1c] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff8a01]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center shadow-lg shadow-[#ff8a01]/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EMS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm">Features</a>
            <a href="#testimonials" className="text-white/60 hover:text-white transition-colors text-sm">Testimonials</a>
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white shadow-lg shadow-[#ff8a01]/30"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-[#ff8a01]" />
              <span className="text-sm text-white/70">Powered by Ollama AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Event Management System{' '}
              <span className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] bg-clip-text text-transparent">
                with AI Integration
              </span>
            </h1>

            <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline event planning, artist bookings, and venue management with our intelligent platform powered by Ollama AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white px-8 py-6 text-lg shadow-xl shadow-[#ff8a01]/30 hover:shadow-[#ff8a01]/50 transition-all hover:-translate-y-1"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
                onClick={() => navigate('/login')}
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-white/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] bg-clip-text text-transparent">
                Event Success
              </span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              From planning to execution, manage every aspect of your events with powerful tools and AI assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff8a01]/20 to-[#ff6b00]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-[#ff8a01]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] bg-clip-text text-transparent">
                Event Professionals
              </span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              See what event managers and promoters say about their experience with EMS.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-white/40 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-white/60 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#ff8a01]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 md:p-20 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Events?
            </h2>
            <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto">
              Join 500+ event professionals already using EMS. Start your free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white px-8 py-6 text-lg shadow-xl shadow-[#ff8a01]/30"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                onClick={() => navigate('/login')}
              >
                <Clock className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EMS</span>
            </div>
            
            <div className="flex items-center gap-8 text-white/40 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>

            <div className="text-white/40 text-sm">
              © 2024 EMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
