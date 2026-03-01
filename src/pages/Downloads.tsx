import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import Footer from "@/components/Footer";
import { ChevronDown, Download } from "lucide-react";

interface Release {
  version: string;
  date: string;
  size: string;
  notes: string[];
  url: string;
}

const mountainOSReleases: Release[] = [
  {
    version: "3.2.1",
    date: "Feb 2026",
    size: "2.4 GB",
    notes: ["Improved boot performance by 40%", "New glass UI compositor", "Enhanced privacy controls", "Bug fixes and stability"],
    url: "#",
  },
  {
    version: "3.1.0",
    date: "Dec 2025",
    size: "2.3 GB",
    notes: ["Initial glass UI theme", "New package manager", "Kernel 6.x support"],
    url: "#",
  },
];

const tountXReleases: Release[] = [
  {
    version: "1.4.0",
    date: "Jan 2026",
    size: "680 MB",
    notes: ["ARM64 native support", "Reduced memory footprint", "New CLI toolkit", "Community extensions API"],
    url: "#",
  },
  {
    version: "1.3.2",
    date: "Nov 2025",
    size: "650 MB",
    notes: ["Hotfix for network stack", "Improved container support"],
    url: "#",
  },
];

const ReleaseCard = ({ release, product }: { release: Release; product: string }) => {
  const [open, setOpen] = useState(false);
  const isLatest = (product === "MountainOS" ? mountainOSReleases : tountXReleases)[0].version === release.version;

  return (
    <div className="glass-panel p-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {product} v{release.version}
            </h3>
            {isLatest && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                Latest
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {release.date} · {release.size}
          </p>
        </div>
        <a href={release.url} className="glass-button-primary text-sm flex items-center gap-2 !py-2.5 shrink-0">
          <Download size={16} /> Download
        </a>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Release Notes
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside"
        >
          {release.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

const Downloads = () => (
  <div className="min-h-screen pt-24">
    <div className="container mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-20"
      >
        <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4">
          Down<span className="gradient-text">loads</span>
        </h1>
        <p className="text-muted-foreground text-lg">Get the latest releases of our operating systems.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* MountainOS */}
        <div>
          <GlassCard className="!p-6 mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">MountainOS</h2>
            <p className="text-sm text-muted-foreground">Full-featured desktop operating system</p>
          </GlassCard>
          {mountainOSReleases.map((r) => (
            <ReleaseCard key={r.version} release={r} product="MountainOS" />
          ))}
        </div>

        {/* TountX */}
        <div>
          <GlassCard className="!p-6 mb-6" delay={0.1}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">TountX</h2>
            <p className="text-sm text-muted-foreground">Lightweight modular OS for developers</p>
          </GlassCard>
          {tountXReleases.map((r) => (
            <ReleaseCard key={r.version} release={r} product="TountX" />
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Downloads;
