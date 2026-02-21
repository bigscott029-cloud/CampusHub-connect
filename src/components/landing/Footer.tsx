import { Twitter, Instagram, Facebook, Mail, MapPin, Shield } from "lucide-react";
import campusHubLogo from "@/assets/campus-hub-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={campusHubLogo} alt="Campus Hub" className="w-9 h-9 rounded-xl object-cover" />
              <span className="font-display font-bold text-xl text-background">CampusHub</span>
            </div>
            <p className="text-background/70 text-sm mb-6 leading-relaxed">
              Your trusted campus platform. Connecting students across universities with news, communities, and resources.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Campus Gists</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Anonymous Zone</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Hostel Hub</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Marketplace</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Partner Universities</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Safety & Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Community Guidelines</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors text-sm">Report Abuse</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-background/70"><MapPin className="w-4 h-4" /><span>Serving students across Nigeria</span></div>
          <div className="flex items-center gap-2 text-sm text-background/70"><Mail className="w-4 h-4" /><span>hello@campushub.ng</span></div>
          <p className="text-sm text-background/50">© 2025 Campus Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
