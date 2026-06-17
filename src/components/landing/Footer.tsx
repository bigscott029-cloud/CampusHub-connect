import { Instagram, Mail, MapPin, MessageCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M16.6 5.82c1.16.84 2.56 1.34 4.08 1.4v3.04a7.92 7.92 0 0 1-4.02-1.1v5.86c0 3.34-2.7 6.04-6.04 6.04a6.04 6.04 0 0 1 0-12.08c.37 0 .73.03 1.08.1v3.18a2.94 2.94 0 1 0 2.04 2.8V2.94h2.86v2.88Z" />
  </svg>
);

const Footer = () => {
  const email = "campushub.connect@gmail.com";
  const contactHref = `mailto:${email}`;
  const whatsappHref = "https://wa.me/2347074474275";

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/CampusHub-logo.png" alt="CampusHub" className="h-10 w-auto max-w-[165px] object-contain" />
            </div>
            <p className="text-background/70 text-sm mb-6 leading-relaxed">
              Your trusted campus platform. Connecting students across universities with news, communities, and resources.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/campushub.connect" target="_blank" rel="noreferrer" aria-label="CampusHub on Instagram" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://x.com/campushub_" target="_blank" rel="noreferrer" aria-label="CampusHub on X" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><span className="text-sm font-bold">X</span></a>
              <a href="https://www.tiktok.com/@campushub.connect" target="_blank" rel="noreferrer" aria-label="CampusHub on TikTok" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><TikTokIcon className="w-5 h-5" /></a>
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
              <li><Link to="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-background/70 hover:text-background transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/marketplace-rules" className="text-background/70 hover:text-background transition-colors text-sm">Marketplace Rules</Link></li>
              <li><a href={`${contactHref}?subject=Report%20Abuse`} className="text-background/70 hover:text-background transition-colors text-sm">Report Abuse</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-background/70"><MapPin className="w-4 h-4" /><span>Serving students across Nigeria</span></div>
          <a href={contactHref} className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"><Mail className="w-4 h-4" /><span>{email}</span></a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"><MessageCircle className="w-4 h-4" /><span>+2347074474275</span></a>
          <p className="text-sm text-background/50">© 2025 Campus Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
