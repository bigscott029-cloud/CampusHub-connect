import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  sponsor: string;
  category: string;
}

const mockAds: Ad[] = [
  {
    id: "1",
    title: "MTN Campus Data Bundles",
    description: "Get 10GB for just ₦1,500! Perfect for streaming and studying. Valid for 30 days.",
    ctaText: "Get Offer",
    ctaLink: "#",
    sponsor: "MTN Nigeria",
    category: "Tech",
  },
  {
    id: "2",
    title: "New Semester, New Style!",
    description: "20% off all fashion items this week. Use code CAMPUS20 at checkout.",
    ctaText: "Shop Now",
    ctaLink: "#",
    sponsor: "Campus Fashion Hub",
    category: "Fashion",
  },
  {
    id: "3",
    title: "Affordable Laptop Repairs",
    description: "Screen repairs from ₦15,000. Free diagnosis for all campus students!",
    ctaText: "Book Repair",
    ctaLink: "#",
    sponsor: "TechFix Campus",
    category: "Services",
  },
];

const AdPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Show ad popup after 30 seconds of page load (once per session)
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];
        setCurrentAd(randomAd);
        setIsVisible(true);
        setHasBeenShown(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!currentAd) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: 100 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 100, x: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="glass-card border-2 border-primary/20 shadow-lg overflow-hidden">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
                <span className="text-xs text-muted-foreground">{currentAd.category}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="p-4">
              {/* Ad Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-bold text-lg leading-tight">
                    {currentAd.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentAd.description}
                  </p>
                </div>

                {/* Sponsor */}
                <p className="text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground">{currentAd.sponsor}</span>
                </p>

                {/* CTA Button */}
                <Button variant="hero" className="w-full" asChild>
                  <a href={currentAd.ctaLink} target="_blank" rel="noopener noreferrer">
                    {currentAd.ctaText}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>

            {/* Animated border glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 rounded-lg border-2 border-primary/20 animate-pulse" />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdPopup;
