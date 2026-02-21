import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import campusHubLogo from "@/assets/campus-hub-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={campusHubLogo} alt="Campus Hub" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-display font-bold text-xl">
              Campus<span className="text-primary">Hub</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/universities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">Universities <ChevronDown className="w-4 h-4" /></Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/safety" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Safety</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/login">Log In</Link></Button>
            <Button variant="hero" asChild><Link to="/signup">Sign Up Free</Link></Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Features</Link>
              <Link to="/universities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Universities</Link>
              <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/safety" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Safety</Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="justify-start" asChild><Link to="/login">Log In</Link></Button>
                <Button variant="hero" asChild><Link to="/signup">Sign Up Free</Link></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
