import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import Footer from "@/components/Footer";
import { Monitor, Cpu, Shield, Zap, Layers, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-4xl"
          initial="hidden"
          animate="visible"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            Welcome to the future
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-6"
          >
            Mountinal<span className="gradient-text">Corp</span>
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Engineering the Future of Operating Systems
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/downloads" className="glass-button-primary text-base">
              Download MountainOS
            </Link>
            <Link to="/downloads" className="glass-button text-base text-foreground">
              Download TountX
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* MountainOS Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Mountain<span className="gradient-text">OS</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A next-generation operating system built for performance, privacy, and elegance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Optimized kernel delivers blazing boot times and responsiveness." },
            { icon: Shield, title: "Secure by Design", desc: "Hardened architecture with built-in encryption and sandboxing." },
            { icon: Monitor, title: "Beautiful UI", desc: "Refined glass interface with fluid animations and dark mode." },
          ].map((item, i) => (
            <GlassCard key={item.title} delay={i * 0.1}>
              <item.icon className="text-primary mb-4" size={28} />
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* TountX Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Tount<span className="gradient-text">X</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Lightweight, modular, and built for developers who demand control.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Cpu, title: "Minimal Footprint", desc: "Runs smoothly on low-spec hardware with minimal resource usage." },
            { icon: Layers, title: "Modular Architecture", desc: "Install only what you need. Every component is swappable." },
            { icon: Globe, title: "Open Ecosystem", desc: "Full package manager and community-driven extension system." },
          ].map((item, i) => (
            <GlassCard key={item.title} delay={i * 0.1}>
              <item.icon className="text-accent mb-4" size={28} />
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <GlassCard className="text-center max-w-3xl mx-auto !p-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Download now and experience the next era of computing.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/downloads" className="glass-button-primary">
              Go to Downloads
            </Link>
            <Link to="/support" className="glass-button text-foreground">
              Get Support
            </Link>
          </div>
        </GlassCard>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
