import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { Database, Lock, Mail, Shield, UserCheck } from "lucide-react";

const privacySections = [
  {
    title: "Information we collect",
    body: "We collect account details, profile details, institution or location selections, verification submissions, posts, messages, listings, reports, support requests, and basic technical data such as device, browser, IP address, and usage logs. For payments, CampusHub stores transaction references, purpose, amount, and status. Card or bank details are handled by the payment provider.",
  },
  {
    title: "How we use information",
    body: "We use data to create accounts, connect users by school, state, and region, show relevant gists and listings, verify students and agents, review marketplace and hostel activity, process reports, improve safety, prevent fraud, provide support, and maintain legal and operational records.",
  },
  {
    title: "Verification and safety reviews",
    body: "Student, hostel, agent, and marketplace verification details may be checked automatically and manually by admins. If information appears false, risky, incomplete, or suspicious, CampusHub may reject, suspend, or request additional details before allowing access or publication.",
  },
  {
    title: "Sharing information",
    body: "We share information only where needed to run the service, such as Supabase hosting and database services, Flutterwave payment processing, error monitoring, moderation, legal compliance, fraud prevention, and user-to-user connections after approved marketplace or hostel payments.",
  },
  {
    title: "Retention",
    body: "We keep data for as long as it is needed to operate CampusHub, resolve disputes, support safety reviews, comply with law, and preserve transaction records. Users may request deletion, but some records may be retained where required for security, fraud prevention, legal, or accounting reasons.",
  },
  {
    title: "Your choices and rights",
    body: "You may update account details, adjust privacy settings where available, request access to your data, request correction, withdraw consent where consent is the basis for processing, or request deletion by contacting CampusHub. Some features may stop working if required data is removed.",
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24">
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="outline">
              <Shield className="mr-1 h-3 w-3" />
              Privacy Policy
            </Badge>
            <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">CampusHub Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: June 17, 2026. CampusHub is operated by Chike Eluem, also known as Big Scott. This policy explains how CampusHub collects, uses, protects, and shares information for the Nigerian campus community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-8 px-4 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card className="glass-card">
              <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact
                </div>
                <a className="block hover:text-foreground" href="mailto:campushub.connect@gmail.com">campushub.connect@gmail.com</a>
                <a className="block hover:text-foreground" href="https://wa.me/2347074474275" target="_blank" rel="noreferrer">+2347074474275</a>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  Data Principles
                </div>
                <p>CampusHub aims to follow Nigeria Data Protection Act principles: lawful processing, fairness, purpose limitation, data minimization, security, and accountability.</p>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5">
            {privacySections.map((section) => (
              <Card key={section.title} className="glass-card">
                <CardContent className="p-6">
                  <h2 className="mb-2 flex items-center gap-2 text-xl font-display font-bold">
                    <Database className="h-5 w-5 text-primary" />
                    {section.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{section.body}</p>
                </CardContent>
              </Card>
            ))}

            <Card className="glass-card border-primary/20">
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-display font-bold">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Children, updates, and complaints
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  CampusHub is intended for students, agents, traders, and campus communities who can legally use online services. If we learn that a restricted user submitted information without proper permission, we may remove it. We may update this policy as the product, law, or payment and moderation systems change. Complaints and privacy requests should be sent to the contact details above.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="hero"><Link to="/terms">Read Terms</Link></Button>
                  <Button asChild variant="outline"><Link to="/marketplace-rules">Marketplace Rules</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
