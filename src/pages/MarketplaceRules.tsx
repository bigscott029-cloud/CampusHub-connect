import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { Ban, BadgeCheck, HandCoins, ListChecks, PackageCheck, ShieldAlert } from "lucide-react";

const allowedRules = [
  "Use clear photos, truthful titles, realistic prices, and accurate item condition.",
  "Keep listings in the correct school, state, region, or nationwide target.",
  "Respond honestly to buyers and admins during review or dispute checks.",
  "Use CampusHub payment and admin connection steps where required.",
];

const bannedRules = [
  "Illegal goods, stolen items, weapons, drugs, exam malpractice, fake documents, and unsafe services.",
  "Counterfeit products, misleading photos, hidden defects, phishing links, or payment bypass attempts.",
  "Harassment, discrimination, explicit content, spam, impersonation, and pressure tactics.",
  "Hostel or room listings that hide agent identity, real price, location risk, or availability status.",
];

const paymentRules = [
  {
    title: "Free marketplace listing",
    body: "Seller posts for free, admin reviews before publication, and CampusHub collects 10 percent from the sale amount when the item sells.",
  },
  {
    title: "Upfront marketplace fee",
    body: "Seller pays 10 percent of the listing price in Naira before approval. Admin still reviews the listing before it becomes visible.",
  },
  {
    title: "Verified agent",
    body: "Agent pays a one-time NGN 20,000 verification fee, submits details for admin review, receives the verified badge after approval, and can list within daily and monthly limits.",
  },
  {
    title: "Hostels and rooms",
    body: "Student-verified hostel and roommate listings do not require listing payment. CampusHub may add 10 percent to the listed price as a protection and connection service fee.",
  },
];

const MarketplaceRules = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24">
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="outline">
              <ListChecks className="mr-1 h-3 w-3" />
              Marketplace Rules
            </Badge>
            <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">CampusHub Marketplace and Listing Rules</h1>
            <p className="text-muted-foreground">
              Last updated: June 17, 2026. These rules apply to marketplace posts, paid agent applications, hostel listings, roommate searches, local school targeting, regional targeting, and nationwide offers.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-success/30">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-display font-bold">
                  <PackageCheck className="h-5 w-5 text-success" />
                  Required listing behavior
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  {allowedRules.map((rule) => (
                    <li key={rule} className="flex gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="glass-card border-destructive/30">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-display font-bold">
                  <Ban className="h-5 w-5 text-destructive" />
                  Not allowed
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  {bannedRules.map((rule) => (
                    <li key={rule} className="flex gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {paymentRules.map((rule) => (
              <Card key={rule.title} className="glass-card">
                <CardContent className="p-6">
                  <h2 className="mb-2 flex items-center gap-2 text-xl font-display font-bold">
                    <HandCoins className="h-5 w-5 text-primary" />
                    {rule.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{rule.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card mt-8 border-primary/20">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-display font-bold">Admin approval, disputes, and payouts</h2>
              <p className="leading-relaxed text-muted-foreground">
                Listings remain pending until admin approval. CampusHub may reject or remove listings that fail verification, create safety risk, or break these rules. For hostel and protected payment flows, CampusHub acts as the connecting and review party: payment is confirmed first, the buyer is connected after admin approval, and payout may be released to the listing agent or seller after the required confirmation steps.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Users should keep chat evidence, receipts, item photos, and delivery or inspection notes. Report suspicious activity through CampusHub support before paying outside approved flows.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero"><Link to="/marketplace">Go to Marketplace</Link></Button>
                <Button asChild variant="outline"><Link to="/terms">Terms of Service</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default MarketplaceRules;
