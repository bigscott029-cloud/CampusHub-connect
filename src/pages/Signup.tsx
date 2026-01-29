import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface University {
  id: string;
  name: string;
  slug: string;
}

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password requirements
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase
        .from("universities")
        .select("id, name, slug")
        .order("name");
      if (data) setUniversities(data);
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    if (!universityId) {
      toast({
        title: "University required",
        description: "Please select your university.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, displayName);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update profile with university after signup
      toast({
        title: "Account created!",
        description: "Welcome to Big Scott Campus Media.",
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={passed ? "text-success" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <span className="font-display font-bold text-2xl">
            Big<span className="text-primary">Scott</span>
          </span>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Join Big Scott</CardTitle>
            <CardDescription>
              Create your account to join your campus community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select value={universityId} onValueChange={setUniversityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password requirements */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
                <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
                <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
                <PasswordCheck passed={passwordChecks.number} label="One number" />
                <PasswordCheck passed={passwordChecks.match} label="Passwords match" />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
