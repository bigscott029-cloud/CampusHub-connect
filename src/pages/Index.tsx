import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ModulesGrid from "@/components/landing/ModulesGrid";
import FeedPreview from "@/components/landing/FeedPreview";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ModulesGrid />
        <FeedPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
