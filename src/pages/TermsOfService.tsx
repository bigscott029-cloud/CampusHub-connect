import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { AlertTriangle, CheckCircle2, FileText, Scale, ShieldCheck } from "lucide-react";

const terms = [
  {
    title: "Accounts and eligibility",
    body: "You must provide accurate registration details and keep your account secure. Students should use truthful institution details, while agents, traders, and community users should select the correct state and region. CampusHub may limit, suspend, or remove accounts that impersonate others, submit false verification details, or create safety risks.",
  },
  {
    title: "Student, hostel, and agent verification",
    body: "Verification is used to reduce fraud and improve trust. CampusHub may approve, reject, or request more information for student, hostel, roommate, marketplace, and agent submissions. A verified badge means CampusHub reviewed the submitted details; it is not a guarantee of future behavior.",
  },
  {
    title: "Community conduct",
    body: "Users must not post harassment, threats, hate speech, sexual exploitation, scams, impersonation, illegal goods, spam, or content that endangers others. Anonymous features are for safer expression, not abuse. CampusHub may remove content, restrict features, or escalate serious reports.",
  },
  {
    title: "Marketplace and paid services",
    body: "Marketplace sellers may choose a free listing with a 10 percent commission due on completed sale, pay a 10 percent upfront listing fee, or apply for verified agent status with a one-time fee of NGN 20,000. Paid listing or agent fees do not guarantee approval if the listing or account violates CampusHub rules.",
  },
  {
    title: "Rooms, roommates, and hostel payments",
    body: "Roommate and hostel listings do not require seller listing payment when the student verification requirements are satisfied. Hostel prices shown to users may include CampusHub's 10 percent service protection fee. CampusHub may hold or control connection steps until payment and admin approval are completed to reduce scams.",
  },
  {
    title: "Content ownership and license",
    body: "You keep ownership of content you submit, but you give CampusHub permission to host, display, moderate, reproduce, and distribute that content within the platform and related promotional or safety workflows. You must only upload content you have the right to share.",
  },
  {
    title: "Disputes and limitations",
    body: "CampusHub helps connect users and moderate transactions, but users remain responsible for truthful listings, safe communication, and lawful activity. To the fullest extent allowed by law, CampusHub is not liable for indirect loss, user misconduct, external payment provider issues, or unavailable services.",
  },
];

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24">
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="outline">
              <Scale className="mr-1 h-3 w-3" />
              Terms
            </Badge>
            <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">CampusHub Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: June 17, 2026. These terms govern use of CampusHub, operated by Chike Eluem, also known as Big Scott. By creating an account or using the platform, you agree to follow these terms and all applicable rules.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="grid gap-5">
            {terms.map((section) => (
              <Card key={section.title} className="glass-card">
                <CardContent className="p-6">
                  <h2 className="mb-2 flex items-center gap-2 text-xl font-display font-bold">
                    <FileText className="h-5 w-5 text-primary" />
                    {section.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{section.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card className="glass-card border-success/30">
              <CardContent className="space-y-3 p-6">
                <h2 className="flex items-center gap-2 text-xl font-display font-bold">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Payments and refunds
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Payment records must match CampusHub references. Refunds, reversals, withheld payouts, and disputes may be reviewed case by case based on payment status, listing approval, user conduct, and available transaction evidence.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-warning/30">
              <CardContent className="space-y-3 p-6">
                <h2 className="flex items-center gap-2 text-xl font-display font-bold">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Enforcement
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  CampusHub may remove content, reject listings, hold approvals, restrict accounts, report illegal activity, or preserve records where needed for safety, disputes, compliance, and fraud prevention.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card mt-8">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-display font-bold">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Need a related policy?
                </h2>
                <p className="text-muted-foreground">Review the privacy policy and marketplace rules before launch.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link to="/privacy">Privacy Policy</Link></Button>
                <Button asChild variant="hero"><Link to="/marketplace-rules">Marketplace Rules</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
