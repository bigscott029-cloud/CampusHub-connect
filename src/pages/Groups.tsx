import { Link } from "react-router-dom";
import { Hash, MessageCircle, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Groups = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center">
      <Card className="glass-card w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Campus Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="rounded-xl border border-dashed border-border p-8">
            <Hash className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No campus groups have been created in the live database yet.
            </p>
          </div>
          <Button asChild variant="hero">
            <Link to="/messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              Open Messages
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Groups;
