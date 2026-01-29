import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-display font-bold text-xl">
              Big<span className="text-primary">Scott</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Universities <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Safety
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Features
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Universities
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                About
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                Safety
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Sign Up Free</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
