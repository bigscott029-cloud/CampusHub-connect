import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNigeriaStateOption, nigeriaStates, type CampusAudienceType } from "@/lib/nigeria";

const normalizeUsername = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);

const generateUsernameSuggestions = (base: string) => {
  const normalized = normalizeUsername(base) || "campushub_user";
  const suffix = Math.floor(100 + Math.random() * 900);
  return [
    `${normalized}${suffix}`,
    `${normalized}_${new Date().getFullYear()}`,
    `${normalized}_hub`,
  ];
};

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [audienceType, setAudienceType] = useState<CampusAudienceType>("student");
  const [universityId, setUniversityId] = useState("");
  const [homeState, setHomeState] = useState("");
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      toast({
        title: "OTP Required",
        description: "Please enter the 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: "signup",
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid OTP code. Please check your email or proceed to sign in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Verified Successfully! 🎉",
          description: "Your registration is complete. You can now sign in.",
        });
        setShowVerificationModal(false);
        navigate("/login?verified=true");
      }
    } catch {
      toast({
        title: "Verification Error",
        description: "Could not verify code automatically. Please proceed to the login page.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
    const incomingReferral = searchParams.get("ref") || searchParams.get("referral");
    if (incomingReferral) {
      setReferralCode(incomingReferral.trim().toUpperCase());
    }
  }, [searchParams]);

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

  useEffect(() => {
    const normalized = normalizeUsername(username);
    if (!normalized || normalized.length < 3) {
      setUsernameStatus("idle");
      setUsernameSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setUsernameStatus("checking");
      const { data } = await (supabase as any)
        .from("profiles")
        .select("user_id")
        .ilike("username", normalized)
        .maybeSingle();

      if (data) {
        setUsernameStatus("taken");
        setUsernameSuggestions(generateUsernameSuggestions(normalized));
      } else {
        setUsernameStatus("available");
        setUsernameSuggestions([]);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [username]);

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

    const normalizedUsername = normalizeUsername(username || displayName);
    if (normalizedUsername.length < 3) {
      toast({
        title: "Username required",
        description: "Please choose a username with at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    if (usernameStatus === "taken") {
      toast({
        title: "Username taken",
        description: "Choose one of the suggestions or edit your username.",
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
      username: normalizedUsername,
      universityId: audienceType === "student" ? universityId : undefined,
      userType: audienceType,
      homeState: audienceType === "student" ? undefined : selectedState?.state,
      homeRegion: audienceType === "student" ? undefined : selectedState?.region,
      phoneNumber: phoneNumber.trim() || undefined,
      referralCode: referralCode.trim() || undefined,
    });

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShowVerificationModal(true);
      toast({
        title: "Registration successful! 🎉",
        description: "Please check your email for your 6-digit verification OTP.",
      });
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
                  placeholder="Your name on CampusHub"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Create your username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. bigscott"
                  value={username}
                  onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                  required
                  minLength={3}
                  maxLength={24}
                />
                <div className="text-xs">
                  {usernameStatus === "checking" && <span className="text-muted-foreground">Checking username...</span>}
                  {usernameStatus === "available" && <span className="text-success">Username is available</span>}
                  {usernameStatus === "taken" && <span className="text-destructive">Username is taken. Try one below.</span>}
                </div>
                {usernameSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setUsername(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
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
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+234..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Used to help friends find you. You can control visibility later.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Optional invite code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
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

      {/* Account Registration Verification & OTP Dialog */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              🎉 Registration Successful!
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm">
              We have sent a 6-digit verification code and email link to <span className="font-semibold text-primary">{email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-Digit OTP Code</Label>
              <Input
                id="otp"
                placeholder="e.g. 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>

            <Button
              onClick={handleVerifyOtp}
              variant="hero"
              className="w-full"
              disabled={isVerifyingOtp || !otpCode.trim()}
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                "Verify OTP & Sign In"
              )}
            </Button>

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowVerificationModal(false);
                  navigate("/login?signup=check-email");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Proceed to Login Page (Click Email Link Instead)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
