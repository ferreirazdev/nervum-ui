import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  Network,
  Zap,
  Shield,
  DollarSign,
  Users,
  Eye,
  Activity,
  GitBranch,
  Lock,
  ArrowRight,
  Sparkles,
  UserCheck,
  Building2,
} from 'lucide-react';
import { SystemGraphVisualization } from '../components/SystemGraphVisualization';
import { LandingIntegrations } from '../components/LandingIntegrations';
import { FeatureCard } from '../components/FeatureCard';
import { AutomationFlow } from '../components/AutomationFlow';
import { BeforeAfter } from '../components/BeforeAfter';
import { Button } from '@/app/components/ui/button';
import { AppLogo } from '@/app/components/AppLogo';
import { useAuth } from '@/features/auth';
import '../landing.css';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page landing-grid-bg min-h-screen bg-background text-foreground scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <AppLogo className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#who" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Who it&apos;s for
            </a>
            {user ? (
              <Button asChild className="bg-primary text-primary-foreground landing-btn-pixel px-4 py-2 text-xs font-bold uppercase tracking-widest">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground text-sm font-medium">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground landing-btn-pixel px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-block opacity-60"
            >
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 10 10" aria-hidden>
                <rect width="2" height="2" x="2" y="2" />
                <rect width="2" height="2" x="6" y="2" />
                <rect width="2" height="2" x="4" y="4" />
                <rect width="2" height="2" x="2" y="6" />
                <rect width="2" height="2" x="6" y="6" />
              </svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono-landing text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase"
            >
              See your system <br />
              <span className="text-primary">as it really is</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The engineering intelligence platform that automatically maps your infrastructure,
              identifies bottlenecks, and accelerates your incident response.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
            >
              <Button asChild size="lg" className="bg-primary text-primary-foreground landing-btn-pixel px-8 py-4 font-bold uppercase tracking-widest text-base">
                <Link to="/register">
                  Request Early Access
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border text-foreground px-8 py-4 font-bold uppercase tracking-widest hover:bg-muted/50 text-base">
                Book a Demo
              </Button>
            </motion.div>

            {/* Integrates with strip */}
            <LandingIntegrations />

            {/* Terminal wrapper around system graph */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-4xl mx-auto p-4 border border-border bg-surface/50 backdrop-blur-sm rounded-lg landing-retro-border overflow-hidden"
            >
              <div className="absolute inset-0 landing-pixel-dots opacity-20 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden />
                    <span className="w-2 h-2 rounded-full bg-chart-4" aria-hidden />
                    <span className="w-2 h-2 rounded-full bg-chart-3" aria-hidden />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Live_System_Graph.sh
                  </span>
                </div>
                <div className="relative min-h-[280px] md:min-h-[384px]">
                  <SystemGraphVisualization />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-surface border border-primary/50 p-4 rounded text-xs font-mono">
                      <span className="text-primary">STATUS:</span> OPERATIONAL<br />
                      <span className="text-primary">NODES:</span> 142 ACTIVE<br />
                      <span className="text-primary">LATENCY:</span> 12ms
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              <div className="flex flex-col items-center p-6 border-x border-border">
                <div className="font-mono-landing text-3xl text-primary mb-2">100%</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">System visibility</div>
              </div>
              <div className="flex flex-col items-center p-6 border-x border-border">
                <div className="font-mono-landing text-3xl text-primary mb-2">10x</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Faster response</div>
              </div>
              <div className="flex flex-col items-center p-6 border-x border-border">
                <div className="font-mono-landing text-3xl text-primary mb-2">Zero</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Tool replacement</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-24 border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">The Engineering Blind Spot</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              As your system grows, so does the chaos. Knowledge is scattered, context is missing,
              and every incident becomes a treasure hunt.
            </p>
          </motion.div>

          <BeforeAfter
            before={[
              { title: 'Outdated Documentation', text: "Wiki pages that haven't been touched in years while the system evolved daily." },
              { title: 'Siloed Data Islands', text: "Checking 15 different dashboards just to find the owner of a failing microservice." },
              { title: 'Invisible Costs', text: "Unexplained cloud spikes that take weeks to trace back to a specific commit." },
            ]}
            after={[
              { title: 'Auto-Generated Mapping', text: 'Real-time infrastructure discovery that updates with every single deployment.' },
              { title: 'Live Context', text: 'Unified view of code, ownership, and health in a single interactive graph.' },
              { title: 'Proactive Insights', text: 'Automated anomaly detection that alerts the right team before things break.' },
            ]}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">Integrate in minutes</h2>
            <p className="text-muted-foreground">Zero agents, zero instrumentation, zero friction.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 border border-border bg-muted mx-auto flex items-center justify-center mb-6 text-primary">
                <Network className="w-8 h-8" />
              </div>
              <h4 className="font-mono-landing text-lg uppercase mb-3">01. Connect</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Link your cloud providers, git repositories, and observability tools via secure API.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 border border-border bg-muted mx-auto flex items-center justify-center mb-6 text-primary">
                <Eye className="w-8 h-8" />
              </div>
              <h4 className="font-mono-landing text-lg uppercase mb-3">02. Map</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our engine automatically builds a high-fidelity graph of your entire engineering ecosystem.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 border border-border bg-muted mx-auto flex items-center justify-center mb-6 text-primary">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="font-mono-landing text-lg uppercase mb-3">03. Act</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use actionable insights to reduce incidents, optimize spend, and ship faster.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Built for engineering teams who need clarity, not complexity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            <FeatureCard
              icon={GitBranch}
              category="Architecture"
              title="Live System Graph"
              description="A dynamic, navigable map of all microservices, databases, and third-party dependencies."
              delay={0}
              gridCell
            />
            <FeatureCard
              icon={Activity}
              category="Observability"
              title="Health Status Monitoring"
              description="Aggregate metrics from Datadog, New Relic, and Prometheus into a single health score."
              delay={0.1}
              gridCell
            />
            <FeatureCard
              icon={Eye}
              category="Efficiency"
              title="One-Click Context"
              description="Jump from a failing service directly to the relevant Slack channel or GitHub Repo."
              delay={0.2}
              gridCell
            />
            <FeatureCard
              icon={DollarSign}
              category="Finance"
              title="Cost Visibility"
              description="Tie cloud infrastructure costs directly to specific engineering teams and services."
              delay={0.3}
              gridCell
            />
            <FeatureCard
              icon={UserCheck}
              category="Operations"
              title="Ownership Intelligence"
              description={'Never ask "who owns this?" again. Auto-identify owners based on commit history.'}
              delay={0.4}
              gridCell
            />
            <FeatureCard
              icon={Zap}
              category="Scale"
              title="Smart Automations"
              description="Trigger workflows automatically based on system state changes or health thresholds."
              delay={0.5}
              gridCell
            />
          </div>
        </div>
      </section>

      {/* Automation Flows Section */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">Automated Response</h2>
            <p className="text-muted-foreground">Pre-built intelligence for common engineering operational tasks.</p>
          </motion.div>

          <div className="space-y-12">
            <AutomationFlow
              title="Service Health"
              description="Detect degradation and notify the on-call engineer with full incident context."
              steps={[
                { label: 'DEGRADE' },
                { label: 'FETCH_OWNER' },
                { label: 'PAGERDUTY_ALERT' },
              ]}
              delay={0}
            />
            <AutomationFlow
              title="Cost Anomaly"
              description="Identify sudden spend increases and map them to recent infrastructure changes."
              steps={[
                { label: 'COST_SPIKE' },
                { label: 'CORRELATE_TERRAFORM' },
                { label: 'FINOPS_REPORT' },
              ]}
              delay={0.1}
            />
            <AutomationFlow
              title="Database Risk"
              description="Flag unencrypted databases or exposed endpoints before they reach production."
              steps={[
                { label: 'SCAN_DB' },
                { label: 'POLICY_CHECK' },
                { label: 'BLOCK_DEPLOY' },
              ]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="who" className="py-24 border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">Built for Modern Tech Orgs</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Perfect for startups and scale-ups who need enterprise visibility without enterprise
              complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="p-10 border border-border hover:border-primary/40 transition-all group rounded-lg"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="font-mono-landing text-xl font-bold uppercase mb-4">CTOs & Tech Leads</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get a bird&apos;s eye view of your entire organization&apos;s technical health and investment efficiency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-10 border border-border hover:border-primary/40 transition-all group rounded-lg"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="font-mono-landing text-xl font-bold uppercase mb-4">Early Founders</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Scale without losing speed. Keep your architecture clean as you transition from MVP to Enterprise.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-10 border border-border hover:border-primary/40 transition-all group rounded-lg"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Building2 className="w-10 h-10" />
              </div>
              <h3 className="font-mono-landing text-xl font-bold uppercase mb-4">Engineering Teams</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Onboard developers faster and resolve incidents with context instead of &quot;guessing.&quot;
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="font-mono-landing text-2xl uppercase tracking-widest mb-4">Enterprise-Grade Security</h2>
            <p className="text-muted-foreground">
              Your system data is sensitive. We take security seriously.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center font-bold text-xs text-foreground">SOC2</div>
              <span className="text-sm uppercase tracking-widest font-mono-landing text-muted-foreground">Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing text-muted-foreground">Encryption at Rest</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing text-muted-foreground">RBAC Controls</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing text-muted-foreground">Read-Only Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-mono-landing text-3xl uppercase tracking-tight mb-4">Trusted by engineering teams</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Join forward-thinking companies using Nervum to scale with confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Nervum gave us the visibility we desperately needed. Now we can see exactly what's connected to what and who owns it.",
                author: 'Sarah Chen',
                role: 'CTO at TechFlow',
                initials: 'SC',
                delay: 0,
              },
              {
                quote:
                  'The automation flows are a game-changer. Incidents now create tickets with full context automatically. Our MTTR dropped by 60%.',
                author: 'Michael Rodriguez',
                role: 'Tech Lead at DataScale',
                initials: 'MR',
                delay: 0.1,
              },
              {
                quote:
                  "We don't have a platform team yet, but Nervum makes us look like we do. It's like having an SRE in a box.",
                author: 'Emma Thompson',
                role: 'Founder at BuildFast',
                initials: 'ET',
                delay: 0.2,
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: testimonial.delay }}
                className="p-8 rounded-lg border border-border bg-muted/30 italic"
              >
                <p className="text-foreground leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-4 not-italic">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground text-xs flex-shrink-0">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{testimonial.author}</p>
                    <p className="text-[10px] uppercase text-muted-foreground font-mono-landing">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 landing-pixel-dots opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-mono-landing text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8">
              Ready to see <br />behind the curtain?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join the early access program and get Nervum running in your infrastructure in minutes,
              not months.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground landing-btn-pixel px-10 py-5 font-bold uppercase tracking-widest text-lg">
                <Link to="/register">
                  Request Early Access
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground px-10 py-5 font-bold uppercase tracking-widest hover:bg-muted/50 text-lg"
              >
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <AppLogo className="h-6 w-auto" />
            </Link>
            <div className="flex gap-8 text-xs uppercase tracking-widest font-mono-landing text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Security
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono-landing">© 2026 Nervum. Engineering Intelligence Platform.</p>
          </div>
        </div>
      </footer>

      {/* Floating terminal button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          className="w-12 h-12 bg-surface border border-border text-primary flex items-center justify-center landing-btn-pixel hover:bg-muted transition-colors font-mono-landing font-bold text-lg"
          aria-label="Terminal"
        >
          &gt;_
        </button>
      </div>
    </div>
  );
}
