
"use client";

import * as React from "react";
import { UserIcon, CartIcon } from "./ui/Icons";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Use a much deeper green gradient, multiply look
  // #09100B → #233229 → #09100B, slightly diagonal
  return (
    <header 
      className={cn(
        "flex fixed inset-x-0 top-0 justify-between items-center px-9 py-0 h-20 z-[100] transition-all duration-300",
        scrolled ? "backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" : "bg-transparent"
      )}
    >
      <Link to="/" className="flex items-center">
        <div className="text-3xl font-bold bg-none text-foreground -ml-2 tracking-tight drop-shadow-sm">
          formme
        </div>
      </Link>
      <nav className="hidden md:flex gap-8 mr-10 ml-auto">
        {['about', 'collection', 'create', 'workflow', 'reviews', 'contact'].map((item) => (
          <Link 
            key={item}
            to={
              item === 'create' ? "/designer" : 
              item === 'reviews' ? "/reviews" : 
              item === 'workflow' ? "/workflow" : 
              "#"
            } 
            className="text-lg text-foreground relative py-1 group transition-colors hover:text-foreground/80"
          >
            {item}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </nav>
      <div className="flex gap-6 items-center">
        <button 
          aria-label="User profile" 
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <UserIcon />
        </button>
        <button 
          aria-label="Shopping cart" 
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <CartIcon />
        </button>
        <ThemeToggle />
        <button className="px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
          Sign up
        </button>
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
