import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/downloads", label: "Downloads" },
    { to: "/support", label: "Support" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Mountinal<span className="gradient-text">Corp</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/account"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User size={16} />
                Account
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="glass-button-primary text-sm !px-5 !py-2">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel-strong mx-4 mb-4 p-6 flex flex-col gap-4 animate-fade-up">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`text-base font-medium ${
                isActive(l.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/account" onClick={() => setMobileOpen(false)} className="text-base font-medium text-muted-foreground">
                Account
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-base font-medium text-muted-foreground text-left">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="glass-button-primary text-sm text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
