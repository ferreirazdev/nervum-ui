import { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { SystemGraphVisualization } from '../components/SystemGraphVisualization';
import { LandingIntegrations } from '../components/LandingIntegrations';
import { FeatureCard } from '../components/FeatureCard';
import { AutomationFlow } from '../components/AutomationFlow';
import { BeforeAfter } from '../components/BeforeAfter';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button } from '@/app/components/ui/button';
import { AppLogo } from '@/app/components/AppLogo';
import { useAuth } from '@/features/auth';
import '../landing.css';

export function LandingPage() {
  const { user } = useAuth();
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const testimonials = t('socialProof.testimonials', { returnObjects: true }) as Array<{
    quote: string;
    author: string;
    role: string;
    initials: string;
  }>;

  return (
    <div className="landing-page min-h-screen bg-background text-foreground scroll-smooth">
      {/* Navigation */}
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'landing-nav-glass border-white/[0.06]'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[72px]">
          <Link to="/" className="flex items-center gap-2">
            <AppLogo className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              {t('nav.features')}
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              {t('nav.howItWorks')}
            </a>
            <a href="#who" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              {t('nav.whoItsFor')}
            </a>
            <LanguageSwitcher />
            {user ? (
              <Button asChild className="landing-btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold">
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground text-sm font-medium hidden sm:inline-flex">
                  <Link to="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild className="landing-btn-outline rounded-xl px-5 py-2.5 text-sm font-semibold">
                  <Link to="/register">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden landing-hero-glow border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
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
              className="font-display-landing text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
              style={{ lineHeight: 1.05 }}
            >
              {t('hero.titleLine1')} <br />
              <span className="landing-gradient-text">{t('hero.titleLine2')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              style={{ lineHeight: 1.7 }}
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
            >
              <Button asChild size="lg" className="landing-btn-gradient rounded-xl px-8 py-4 font-semibold text-base">
                <Link to="/register">
                  {t('hero.requestAccess')}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="landing-btn-outline rounded-xl px-8 py-4 font-semibold text-base border-white/25 text-foreground hover:bg-transparent">
                {t('hero.bookDemo')}
              </Button>
            </motion.div>

            {/* Integrates with strip */}
            <LandingIntegrations />

            {/* Terminal wrapper around system graph */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="landing-hero-card-glow relative max-w-4xl mx-auto p-4 border border-border bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 landing-pixel-dots opacity-10 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive" aria-hidden />
                    <span className="w-2.5 h-2.5 rounded-full bg-chart-4" aria-hidden />
                    <span className="w-2.5 h-2.5 rounded-full bg-chart-3" aria-hidden />
                  </div>
                  <span className="font-mono-landing font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Live_System_Graph.sh
                  </span>
                </div>
                <div className="relative min-h-[280px] md:min-h-[384px]">
                  <SystemGraphVisualization />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-surface border border-primary/30 p-4 rounded-lg text-xs font-mono-landing font-mono">
                      <span className="text-primary">{t('hero.toolsReplaced')}</span> {t('hero.toolsReplacedValue')}<br />
                      <span className="text-primary">{t('hero.environments')}</span> {t('hero.environmentsValue')}<br />
                      <span className="text-primary">{t('hero.lastDeploy')}</span> {t('hero.lastDeployValue')}
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
                <div className="font-mono-landing font-mono text-3xl text-primary mb-2">{t('stats.time')}</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground font-mono-landing font-mono">{t('stats.timeLabel')}</div>
              </div>
              <div className="flex flex-col items-center p-6 border-x border-border">
                <div className="font-mono-landing font-mono text-3xl text-primary mb-2">{t('stats.tabs')}</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground font-mono-landing font-mono">{t('stats.tabsLabel')}</div>
              </div>
              <div className="flex flex-col items-center p-6 border-x border-border">
                <div className="font-mono-landing font-mono text-3xl text-primary mb-2">{t('stats.agents')}</div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground font-mono-landing font-mono">{t('stats.agentsLabel')}</div>
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('problem.title')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('problem.subtitle')}
            </p>
          </motion.div>

          <BeforeAfter
            beforeLabel={t('problem.withoutNervum')}
            afterLabel={t('problem.withNervum')}
            before={t('problem.before', { returnObjects: true }) as Array<{ title: string; text: string }>}
            after={t('problem.after', { returnObjects: true }) as Array<{ title: string; text: string }>}
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('howItWorks.title')}</h2>
            <p className="text-muted-foreground">{t('howItWorks.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="text-center p-8"
            >
              <div className="landing-icon-box mx-auto mb-6">
                <Network className="w-6 h-6" />
              </div>
              <h4 className="font-display-landing text-lg font-bold mb-3">{t('howItWorks.connect.step')}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('howItWorks.connect.text')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-8"
            >
              <div className="landing-icon-box mx-auto mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h4 className="font-display-landing text-lg font-bold mb-3">{t('howItWorks.map.step')}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('howItWorks.map.text')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8"
            >
              <div className="landing-icon-box mx-auto mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-display-landing text-lg font-bold mb-3">{t('howItWorks.manage.step')}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('howItWorks.manage.text')}
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={GitBranch}
              category={t('features.environmentMaps.category')}
              title={t('features.environmentMaps.title')}
              description={t('features.environmentMaps.description')}
              delay={0}
              gridCell
            />
            <FeatureCard
              icon={Activity}
              category={t('features.activityFeed.category')}
              title={t('features.activityFeed.title')}
              description={t('features.activityFeed.description')}
              delay={0.1}
              gridCell
            />
            <FeatureCard
              icon={Eye}
              category={t('features.gcpManagement.category')}
              title={t('features.gcpManagement.title')}
              description={t('features.gcpManagement.description')}
              delay={0.2}
              gridCell
            />
            <FeatureCard
              icon={DollarSign}
              category={t('features.teamOwnership.category')}
              title={t('features.teamOwnership.title')}
              description={t('features.teamOwnership.description')}
              delay={0.3}
              gridCell
            />
            <FeatureCard
              icon={UserCheck}
              category={t('features.accessControl.category')}
              title={t('features.accessControl.title')}
              description={t('features.accessControl.description')}
              delay={0.4}
              gridCell
            />
            <FeatureCard
              icon={Zap}
              category={t('features.aiAssistant.category')}
              title={t('features.aiAssistant.title')}
              description={t('features.aiAssistant.description')}
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('automation.title')}</h2>
            <p className="text-muted-foreground">{t('automation.subtitle')}</p>
          </motion.div>

          <div className="space-y-12">
            <AutomationFlow
              title={t('automation.incidentTriage.title')}
              description={t('automation.incidentTriage.description')}
              steps={[
                { label: 'SENTRY_ERROR' },
                { label: 'MAP_SERVICE' },
                { label: 'FIND_OWNER' },
              ]}
              delay={0}
            />
            <AutomationFlow
              title={t('automation.deployVerification.title')}
              description={t('automation.deployVerification.description')}
              steps={[
                { label: 'CLOUD_BUILD' },
                { label: 'LINK_COMMIT' },
                { label: 'CHECK_HEALTH' },
              ]}
              delay={0.1}
            />
            <AutomationFlow
              title={t('automation.preReleaseAudit.title')}
              description={t('automation.preReleaseAudit.description')}
              steps={[
                { label: 'FETCH_INSTANCES' },
                { label: 'CHECK_BACKUPS' },
                { label: 'CONFIRM_DEPLOY' },
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('who.title')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('who.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="landing-card-nexus p-10 group"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="font-display-landing text-xl font-bold mb-4">{t('who.ctos.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('who.ctos.text')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="landing-card-nexus p-10 group"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="font-display-landing text-xl font-bold mb-4">{t('who.founders.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('who.founders.text')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="landing-card-nexus p-10 group"
            >
              <div className="text-primary mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <Building2 className="w-10 h-10" />
              </div>
              <h3 className="font-display-landing text-xl font-bold mb-4">{t('who.teams.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('who.teams.text')}
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
            <h2 className="font-display-landing text-2xl font-bold tracking-tight mb-4">{t('security.title')}</h2>
            <p className="text-muted-foreground">
              {t('security.subtitle')}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center font-bold text-xs text-foreground rounded">SOC2</div>
              <span className="text-sm uppercase tracking-widest font-mono-landing font-mono text-muted-foreground">{t('security.soc2')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing font-mono text-muted-foreground">{t('security.encryption')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing font-mono text-muted-foreground">{t('security.rbac')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-foreground" />
              <span className="text-sm uppercase tracking-widest font-mono-landing font-mono text-muted-foreground">{t('security.readOnly')}</span>
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
            <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('socialProof.title')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('socialProof.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="landing-card-nexus p-8 italic"
              >
                <p className="text-foreground leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4 not-italic">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 landing-btn-gradient">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{testimonial.author}</p>
                    <p className="text-[10px] uppercase text-muted-foreground font-mono-landing font-mono">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden landing-cta-bg landing-cta-glow">
        <div className="absolute inset-0 landing-pixel-dots opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-display-landing text-4xl md:text-5xl font-black tracking-tight mb-8"
              style={{ lineHeight: 1.1 }}
            >
              {t('cta.titleLine1')} <br /> {t('cta.titleLine2')}
            </h2>
            <p className="text-xl text-muted-foreground mb-12" style={{ lineHeight: 1.7 }}>
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="landing-btn-gradient rounded-xl px-10 py-5 font-semibold text-lg">
                <Link to="/register">
                  {t('cta.requestAccess')}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="landing-btn-outline rounded-xl px-10 py-5 font-semibold text-lg border-white/25 text-foreground hover:bg-transparent"
              >
                {t('cta.bookDemo')}
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
            <div className="flex gap-8 text-xs uppercase tracking-widest font-mono-landing font-mono text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t('footer.terms')}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t('footer.security')}
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono-landing font-mono">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Floating terminal button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          className="w-12 h-12 landing-btn-outline rounded-xl text-primary flex items-center justify-center hover:text-foreground transition-colors font-mono-landing font-mono font-bold text-lg"
          aria-label="Terminal"
        >
          {'>_'}
        </button>
      </div>
    </div>
  );
}
