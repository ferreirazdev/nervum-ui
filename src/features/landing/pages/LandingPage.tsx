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
import { FeatureCard } from '../components/FeatureCard';
import { AutomationFlow } from '../components/AutomationFlow';
import { BeforeAfter } from '../components/BeforeAfter';
import { Button } from '@/app/components/ui/button';
import { AppLogo } from '@/app/components/AppLogo';
import { useAuth } from '@/features/auth';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
              How it works
            </a>
            <a href="#who" className="text-sm text-gray-400 hover:text-white transition-colors">
              Who it&apos;s for
            </a>
            {user ? (
              <Button asChild>
                <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Engineering Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            >
              See your system
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                as it really is
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              A live, visual map of your entire technical system. Understand impact instantly. Act with
              confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8">
                <Link to="/register">
                  Request Early Access
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 text-base px-8">
                Book a Demo
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <SystemGraphVisualization />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">System visibility</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">10x</div>
              <div className="text-sm text-gray-400">Faster incident response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Zero</div>
              <div className="text-sm text-gray-400">Tool replacement needed</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The problem with modern systems</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              As your system grows, so does the chaos. Knowledge is scattered, context is missing,
              and every incident becomes a treasure hunt.
            </p>
          </motion.div>

          <BeforeAfter
            before={[
              { text: "System knowledge scattered across Confluence, Notion, and people's heads" },
              { text: "Jump between 6+ tools to understand what's happening during incidents" },
              { text: 'No clear view of environment dependencies and infrastructure' },
              { text: "Can't assess impact or blast radius of changes" },
              { text: 'Ownership is unclear — who do you even notify?' },
              { text: "Cost and risk are invisible until it's too late" },
            ]}
            after={[
              { text: 'Single source of truth for all environments, services, and infrastructure' },
              { text: 'One-click access to logs, errors, metrics, and ownership' },
              { text: 'Visual dependency graph with live health status' },
              { text: "Instant impact analysis — see what's affected in real-time" },
              { text: 'Automatic ownership resolution and smart notifications' },
              { text: 'Cost and risk visibility built into every layer' },
            ]}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Nervum works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect your existing tools. Get instant visibility. Automate intelligent responses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="text-center p-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 mb-6">
                <Network className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Connect</h3>
              <p className="text-gray-400 leading-relaxed">
                Integrate with your cloud providers, databases, observability tools, and ticketing
                systems. No agents to install.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-purple-400 mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. Map</h3>
              <p className="text-gray-400 leading-relaxed">
                Nervum automatically builds a live graph of your environments, services,
                infrastructure, and their relationships.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-green-400 mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Act</h3>
              <p className="text-gray-400 leading-relaxed">
                Detect issues, understand impact, notify the right people, and trigger automated
                responses — all context-aware.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for engineering teams who need clarity, not complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={GitBranch}
              title="Live System Graph"
              description="Visual map of environments, services, databases, and infrastructure with real-time health overlays. See dependencies and relationships at a glance."
              delay={0}
            />
            <FeatureCard
              icon={Activity}
              title="Health Status Monitoring"
              description="Continuous health checks across your entire stack. Healthy, warning, or critical status for every component with intelligent alerting."
              delay={0.1}
            />
            <FeatureCard
              icon={Eye}
              title="One-Click Context"
              description="Jump directly from any node to logs, errors, metrics, dashboards, or runbooks. No more hunting through tools."
              delay={0.2}
            />
            <FeatureCard
              icon={DollarSign}
              title="Cost Visibility"
              description="See costs per service, environment, and resource. Catch anomalies before they appear on your bill."
              delay={0.3}
            />
            <FeatureCard
              icon={UserCheck}
              title="Ownership Intelligence"
              description="Automatic ownership resolution based on code, teams, and context. Always know who to contact."
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Smart Automations"
              description="Trigger tickets, notifications, runbooks, or custom workflows based on health changes, cost spikes, or deployment events."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Automation Flows Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Intelligent automation</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Turn system events into contextual actions — automatically.
            </p>
          </motion.div>

          <div className="space-y-6">
            <AutomationFlow
              title="Service Health Issue"
              description="When a service becomes unhealthy, Nervum creates a ticket with full context and notifies the right team."
              steps={[
                { label: 'Service unhealthy', icon: '⚠️', color: '#f59e0b' },
                { label: 'Create Jira issue', icon: '📋', color: '#3b82f6' },
                { label: 'Add context', icon: '🔍', color: '#8b5cf6' },
                { label: 'Notify owners', icon: '🔔', color: '#10b981' },
              ]}
              delay={0}
            />
            <AutomationFlow
              title="Cost Anomaly Detection"
              description="Unusual spending patterns are detected and the finance and engineering teams are alerted immediately."
              steps={[
                { label: 'Cost spike detected', icon: '💰', color: '#ef4444' },
                { label: 'Analyze services', icon: '📊', color: '#3b82f6' },
                { label: 'Alert team', icon: '🚨', color: '#f59e0b' },
                { label: 'Generate report', icon: '📄', color: '#8b5cf6' },
              ]}
              delay={0.1}
            />
            <AutomationFlow
              title="Database Risk Management"
              description="High-risk database operations trigger alerts with ownership and dependency information for safe execution."
              steps={[
                { label: 'Risk detected', icon: '🛡️', color: '#ef4444' },
                { label: 'Check dependencies', icon: '🔗', color: '#3b82f6' },
                { label: 'Flag owners', icon: '👥', color: '#8b5cf6' },
                { label: 'Request approval', icon: '✅', color: '#10b981' },
              ]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="who" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for growing teams</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
              className="p-8 rounded-xl border border-white/10 bg-gradient-to-br from-blue-950/20 to-black"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CTOs & Tech Leads</h3>
              <p className="text-gray-400 leading-relaxed">
                Get the system-wide visibility you need to make confident decisions, manage risk,
                and scale infrastructure intelligently.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-xl border border-white/10 bg-gradient-to-br from-purple-950/20 to-black"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Founders</h3>
              <p className="text-gray-400 leading-relaxed">
                No platform team yet? No problem. Nervum gives you production-grade system
                intelligence from day one.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-xl border border-white/10 bg-gradient-to-br from-green-950/20 to-black"
            >
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Engineering Teams</h3>
              <p className="text-gray-400 leading-relaxed">
                Spend less time debugging and more time building. Understand impact, find issues
                faster, and ship with confidence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Enterprise-grade security</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your system data is sensitive. We take security seriously.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-gray-400">Security certified and audited</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-purple-400 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Encrypted at rest</h3>
              <p className="text-sm text-gray-400">AES-256 encryption</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">RBAC & SSO</h3>
              <p className="text-sm text-gray-400">Fine-grained access control</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-green-400 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Read-only access</h3>
              <p className="text-sm text-gray-400">Never modifies your systems</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/5 to-black" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by engineering teams</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                delay: 0,
              },
              {
                quote:
                  'The automation flows are a game-changer. Incidents now create tickets with full context automatically. Our MTTR dropped by 60%.',
                author: 'Michael Rodriguez',
                role: 'Tech Lead at DataScale',
                delay: 0.1,
              },
              {
                quote:
                  "We don't have a platform team yet, but Nervum makes us look like we do. It's like having an SRE in a box.",
                author: 'Emma Thompson',
                role: 'Founder at BuildFast',
                delay: 0.2,
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: testimonial.delay }}
                className="p-8 rounded-xl border border-white/10 bg-gradient-to-br from-black to-gray-950"
              >
                <p className="text-gray-300 leading-relaxed mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/10 to-black" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to see your system clearly?</h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Join the early access program and get Nervum running in your infrastructure in minutes,
              not months.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6">
                <Link to="/register">
                  Request Early Access
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 text-lg px-10 py-6"
              >
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <AppLogo className="h-6 w-auto" />
            </Link>
            <div className="text-sm text-gray-400">© 2026 Nervum. Engineering Intelligence Platform.</div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
