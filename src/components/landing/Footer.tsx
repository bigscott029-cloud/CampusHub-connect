import { Twitter, Instagram, Facebook, Mail, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import campusHubLogo from "@/assets/campus-hub-logo.png";

const Footer = () => {
  const contactHref = "mailto:hello@campushub.ng";

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
              <a href={`${contactHref}?subject=CampusHub%20Twitter`} aria-label="Contact CampusHub about Twitter" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href={`${contactHref}?subject=CampusHub%20Instagram`} aria-label="Contact CampusHub about Instagram" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href={`${contactHref}?subject=CampusHub%20Facebook`} aria-label="Contact CampusHub about Facebook" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-background/70 hover:text-background transition-colors text-sm">Features</Link></li>
              <li><Link to="/feed" className="text-background/70 hover:text-background transition-colors text-sm">Campus Gists</Link></li>
              <li><Link to="/anonymous" className="text-background/70 hover:text-background transition-colors text-sm">Anonymous Zone</Link></li>
              <li><Link to="/hostel" className="text-background/70 hover:text-background transition-colors text-sm">Hostel Hub</Link></li>
              <li><Link to="/marketplace" className="text-background/70 hover:text-background transition-colors text-sm">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-background/70 hover:text-background transition-colors text-sm">About Us</Link></li>
              <li><Link to="/universities" className="text-background/70 hover:text-background transition-colors text-sm">Partner Institutions</Link></li>
              <li><a href={`${contactHref}?subject=CampusHub%20Careers`} className="text-background/70 hover:text-background transition-colors text-sm">Careers</a></li>
              <li><a href={contactHref} className="text-background/70 hover:text-background transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Safety & Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/safety" className="text-background/70 hover:text-background transition-colors text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Community Guidelines</Link></li>
              <li><a href={`${contactHref}?subject=Privacy%20Policy`} className="text-background/70 hover:text-background transition-colors text-sm">Privacy Policy</a></li>
              <li><a href={`${contactHref}?subject=Terms%20of%20Service`} className="text-background/70 hover:text-background transition-colors text-sm">Terms of Service</a></li>
              <li><a href={`${contactHref}?subject=Report%20Abuse`} className="text-background/70 hover:text-background transition-colors text-sm">Report Abuse</a></li>
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
