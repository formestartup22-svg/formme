"use client";

import * as React from "react";
import { UserIcon, CartIcon } from "./ui/Icons";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface NavBarProps {
  initialDark?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ initialDark = false }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Use a much deeper green gradient, multiply look
  // #09100B → #233229 → #09100B, slightly diagonal
  return (
    <header
      className={cn(
        "flex fixed inset-x-0 top-0 justify-between items-center px-9 py-0 h-20 z-[100] transition-all duration-300",
        scrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
          : "bg-transparent",
      )}
    >
      <Link to="/" className="flex items-center">
        <div
          className={cn(
            "text-3xl font-bold bg-none -ml-2 tracking-tight drop-shadow-sm transition-colors duration-300",
            initialDark && !scrolled ? "text-[#111827]" : "text-foreground",
          )}
        >
          formme
        </div>
      </Link>
      <nav className="hidden md:flex gap-8 mr-10 ml-auto">
        {["collection", "create", "reviews", "contact"].map((item) => (
          <Link
            key={item}
            to={
              item === "create"
                ? "/designer"
                : item === "reviews"
                  ? "/reviews"
                  : "#"
            }
            className={cn(
              "text-lg relative py-1 group transition-colors",
              initialDark && !scrolled
                ? "text-[#111827] hover:text-[#111827]/80"
                : "text-foreground hover:text-foreground/80",
            )}
          >
            {item}
            <span
              className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                initialDark && !scrolled ? "bg-[#111827]" : "bg-foreground",
              )}
            ></span>
          </Link>
        ))}
        
        {/* Dashboard Dropdown */}
        <div className="relative group">
          <button
            className={cn(
              "text-lg relative py-1 transition-colors",
              initialDark && !scrolled
                ? "text-[#111827] hover:text-[#111827]/80"
                : "text-foreground hover:text-foreground/80",
            )}
          >
            dashboard
            <span
              className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                initialDark && !scrolled ? "bg-[#111827]" : "bg-foreground",
              )}
            ></span>
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <Link
              to="/dashboard"
              className="block px-4 py-3 text-sm hover:bg-muted transition-colors rounded-t-lg"
            >
              Designer
            </Link>
            <Link
              to="/manufacturer"
              className="block px-4 py-3 text-sm hover:bg-muted transition-colors rounded-b-lg"
            >
              Manufacturer
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex gap-6 items-center">
        {user && (
          <Link to="/profile" aria-label="User profile">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <UserIcon />
            </button>
          </Link>
        )}
        <button aria-label="Shopping cart" className="p-2 rounded-full hover:bg-muted transition-colors">
          <CartIcon />
        </button>
        <ThemeToggle />
        {!user && (
          <Link to="/auth">
            <button className="px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
              Sign up
            </button>
          </Link>
        )}
        <button className="md:hidden p-2 rounded-full hover:bg-muted transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
