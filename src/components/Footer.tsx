import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border py-12 mt-24">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-display text-lg font-bold text-foreground">
          Mountinal<span className="gradient-text">Corp</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/downloads" className="hover:text-foreground transition-colors">Downloads</Link>
          <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mountinal Corp. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
