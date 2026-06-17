import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Check, X, MapPin, School, Store, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionCombobox, type InstitutionOption } from "@/components/campus/InstitutionCombobox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNigeriaStateOption, nigeriaStates, type CampusAudienceType } from "@/lib/nigeria";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [audienceType, setAudienceType] = useState<CampusAudienceType>("student");
  const [universityId, setUniversityId] = useState("");
  const [homeState, setHomeState] = useState("");
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
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
    const fetchInstitutions = async () => {
      const { data } = await (supabase as any)
        .from("universities")
        .select("id, name, institution_type, ownership, state, region, aliases")
        .order("name");
      if (data) setInstitutions(data);
    };
    fetchInstitutions();
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

    if (audienceType === "student" && !universityId) {
      toast({
        title: "Institution required",
        description: "Please select your school or institution.",
        variant: "destructive",
      });
      return;
    }

    const selectedState = getNigeriaStateOption(homeState);

    if (audienceType !== "student" && !selectedState) {
      toast({
        title: "State required",
        description: "Please select your state so we can place you in the right regional community.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, displayName, {
      universityId: audienceType === "student" ? universityId : undefined,
      userType: audienceType,
      homeState: audienceType === "student" ? undefined : selectedState?.state,
      homeRegion: audienceType === "student" ? undefined : selectedState?.region,
    });

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
        description: "Welcome to CampusHub.",
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

  const selectedState = getNigeriaStateOption(homeState);

  const audienceOptions = [
    {
      value: "student" as const,
      title: "Student",
      description: "Join by school",
      icon: School,
    },
    {
      value: "agent_trader" as const,
      title: "Agent or trader",
      description: "Join by state",
      icon: Store,
    },
    {
      value: "community" as const,
      title: "Community user",
      description: "Browse locally",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/CampusHub-logo.png" alt="CampusHub" className="h-16 w-auto max-w-[220px] object-contain" />
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Join CampusHub</CardTitle>
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

              <div className="space-y-3">
                <Label>I am joining as</Label>
                <RadioGroup
                  value={audienceType}
                  onValueChange={(value) => {
                    const nextType = value as CampusAudienceType;
                    setAudienceType(nextType);
                    if (nextType === "student") {
                      setHomeState("");
                    } else {
                      setUniversityId("");
                    }
                  }}
                  className="grid gap-2"
                >
                  {audienceOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`audience-${option.value}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem id={`audience-${option.value}`} value={option.value} />
                      <option.icon className="h-4 w-4 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{option.title}</span>
                        <span className="block text-xs text-muted-foreground">{option.description}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {audienceType === "student" ? (
                <div className="space-y-2">
                  <Label htmlFor="institution">School / Institution</Label>
                  <InstitutionCombobox
                    institutions={institutions}
                    value={universityId}
                    onChange={setUniversityId}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={homeState} onValueChange={setHomeState}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigeriaStates.map((option) => (
                        <SelectItem key={option.state} value={option.state}>
                          {option.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedState && (
                    <div
                      className="rounded-lg border p-3 text-sm"
                      style={{ borderColor: selectedState.accentColor }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" style={{ color: selectedState.accentColor }} />
                        <span className="font-medium">{selectedState.state}</span>
                        <Badge variant="secondary">{selectedState.region}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedState.prompt}</p>
                    </div>
                  )}
                </div>
              )}

              {audienceType === "student" ? (
                <input type="hidden" name="audience-region" value="school" />
              ) : (
                <input type="hidden" name="audience-region" value={selectedState?.region || ""} />
              )}

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
