import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Upload,
  ShieldCheck,
  User,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InstitutionCombobox, type InstitutionOption } from "@/components/campus/InstitutionCombobox";

const departments = [
  "Accounting",
  "Agricultural Economics",
  "Architecture",
  "Biochemistry",
  "Business Administration",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Economics",
  "Education",
  "Electrical/Electronics Engineering",
  "English and Literary Studies",
  "Estate Management",
  "Law",
  "Mass Communication",
  "Mathematics",
  "Mechanical Engineering",
  "Medicine and Surgery",
  "Microbiology",
  "Nursing",
  "Pharmacy",
  "Political Science",
  "Public Administration",
  "Sociology",
  "Statistics",
  "Theatre Arts",
  "Other",
];
const levels = ["100L", "200L", "300L", "400L", "500L", "600L", "Postgraduate"];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [universityChangeWarning, setUniversityChangeWarning] = useState(false);
  const [universityChangeCount, setUniversityChangeCount] = useState(0);
  const [initialUniversityId, setInitialUniversityId] = useState("");
  const [universities, setUniversities] = useState<InstitutionOption[]>([]);
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const verificationDocumentRef = useRef<HTMLInputElement>(null);
  const verificationCameraRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    phoneNumber: "",
    department: "",
    departmentOther: "",
    level: "",
    universityId: "",
  });
  const [verificationForm, setVerificationForm] = useState({
    matricNumber: "",
    studentIdNumber: "",
    documentUrl: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsBootstrapping(true);

      const [{ data: profile }, { data: universityOptions }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        (supabase as any).from("universities").select("id, name, institution_type, ownership, state, region, aliases").order("name"),
      ]);

      if (profile) {
        setFormData({
          displayName: profile.display_name || "",
          bio: profile.bio || "",
          avatarUrl: profile.avatar_url || "",
          phoneNumber: (profile as any).phone_number || "",
          department: profile.department || "",
          departmentOther: "",
          level: profile.level || "",
          universityId: profile.university_id || "",
        });
        setInitialUniversityId(profile.university_id || "");
        setUniversityChangeCount(profile.university_change_count || 0);
        setVerificationStatus((profile as any).student_verification_status || "unverified");
        setVerificationForm({
          matricNumber: (profile as any).matric_number || "",
          studentIdNumber: (profile as any).student_id_number || "",
          documentUrl: (profile as any).verification_document_url || "",
        });
      }

      setUniversities(universityOptions || []);
      setIsBootstrapping(false);
    };

    loadProfile();
  }, [user]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: loadEvent.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUniversitySelect = (value: string) => {
    if (initialUniversityId && value !== initialUniversityId && value !== formData.universityId) {
      setUniversityChangeWarning(true);
    }

    setFormData((prev) => ({ ...prev, universityId: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const universityChanged = formData.universityId !== initialUniversityId;
    const isTrackedUniversityChange = Boolean(initialUniversityId) && universityChanged;
    const finalDepartment = formData.department === "Other" ? formData.departmentOther.trim() : formData.department;

    if (isTrackedUniversityChange && universityChangeCount >= 2) {
      toast.error("You have reached the university change limit. An admin request has been created.");
      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "university_verification",
        status: "pending",
      });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "University change needs review",
        description: "An admin needs to verify additional university changes on your account.",
        type: "warning",
        is_important: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Record<string, string | number | null> = {
        display_name: formData.displayName,
        bio: formData.bio || null,
        avatar_url: formData.avatarUrl || null,
        phone_number: formData.phoneNumber.trim() || null,
        department: finalDepartment || null,
        level: formData.level || null,
        university_id: formData.universityId || null,
      };

      if (isTrackedUniversityChange) {
        updateData.university_change_count = universityChangeCount + 1;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVerificationDocument = async (file: File) => {
    if (!user) return;

    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").toLowerCase();
      const path = `${user.id}/verification/${crypto.randomUUID()}-${cleanName}`;
      const { error } = await supabase.storage.from("profile-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
      setVerificationForm((prev) => ({ ...prev, documentUrl: data.publicUrl }));
      toast.success("Verification document uploaded.");
    } catch (error) {
      console.error("Error uploading verification document:", error);
      toast.error("Failed to upload document.");
    }
  };

  const handleSubmitVerification = async () => {
    if (!user) return;
    if (!formData.universityId) {
      toast.error("Please select your school before submitting verification.");
      return;
    }
    if (!verificationForm.matricNumber && !verificationForm.studentIdNumber) {
      toast.error("Please provide a matric number or student ID number.");
      return;
    }

    setIsSubmittingVerification(true);
    try {
      const { data: request, error } = await (supabase as any)
        .from("student_verification_requests")
        .insert({
          user_id: user.id,
          university_id: formData.universityId,
          matric_number: verificationForm.matricNumber.trim() || null,
          student_id_number: verificationForm.studentIdNumber.trim() || null,
          document_url: verificationForm.documentUrl.trim() || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      await (supabase as any)
        .from("profiles")
        .update({
          student_verification_status: "pending",
          matric_number: verificationForm.matricNumber.trim() || null,
          student_id_number: verificationForm.studentIdNumber.trim() || null,
          verification_document_url: verificationForm.documentUrl.trim() || null,
        })
        .eq("user_id", user.id);

      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "student_verification",
        reference_id: request.id,
        status: "pending",
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Student Verification Submitted",
        description: "Your student details are now queued for review.",
        type: "verification",
        is_important: true,
        reference_type: "student_verification",
        reference_id: request.id,
      });

      setVerificationStatus("pending");
      toast.success("Student verification submitted.");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit student verification.");
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                    {formData.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Click avatar to upload from device</p>
                <p className="text-xs text-muted-foreground">Or enter a URL below</p>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl.startsWith("data:") ? "" : formData.avatarUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                placeholder="Your display name"
                value={formData.displayName}
                onChange={(event) => setFormData((prev) => ({ ...prev, displayName: event.target.value }))}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+234..."
                value={formData.phoneNumber}
                onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Used for friend discovery when someone searches your number.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>University</Label>
              <InstitutionCombobox
                institutions={universities}
                value={formData.universityId}
                onChange={handleUniversitySelect}
                disabled={isBootstrapping}
                placeholder="Search schools in Nigeria..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.department === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter your department/course"
                    value={formData.departmentOther}
                    onChange={(event) => setFormData((prev) => ({ ...prev, departmentOther: event.target.value }))}
                  />
                )}
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

	        <Card className="glass-card border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              University Change Policy
            </CardTitle>
            <CardDescription>
              You have {Math.max(0, 2 - universityChangeCount)} tracked university change(s) remaining before manual admin review is required.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The first time you set a university does not count toward the limit. Switching from one existing university to another does.
          </CardContent>
	        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Student Verification
            </CardTitle>
            <CardDescription>
              Required before hostel listings and roommate requests can go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              Current status: <span className="font-semibold capitalize">{verificationStatus.replace(/_/g, " ")}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Matric Number</Label>
                <Input
                  value={verificationForm.matricNumber}
                  onChange={(event) => setVerificationForm((prev) => ({ ...prev, matricNumber: event.target.value }))}
                  placeholder="e.g. CSC/2024/001"
                />
              </div>
              <div>
                <Label>Student ID Number</Label>
                <Input
                  value={verificationForm.studentIdNumber}
                  onChange={(event) => setVerificationForm((prev) => ({ ...prev, studentIdNumber: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Verification Document URL</Label>
              <Input
                value={verificationForm.documentUrl}
                onChange={(event) => setVerificationForm((prev) => ({ ...prev, documentUrl: event.target.value }))}
                placeholder="Optional link to school ID/admission proof"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={verificationDocumentRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadVerificationDocument(file);
                  }}
                />
                <input
                  ref={verificationCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadVerificationDocument(file);
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => verificationDocumentRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" />
                  Upload file
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => verificationCameraRef.current?.click()}>
                  <Camera className="mr-1 h-4 w-4" />
                  Capture photo
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmitVerification}
              disabled={isSubmittingVerification || verificationStatus === "verified"}
            >
              {isSubmittingVerification ? "Submitting..." : verificationStatus === "verified" ? "Verified" : "Submit Verification"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isLoading || isBootstrapping}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <AlertDialog open={universityChangeWarning} onOpenChange={setUniversityChangeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              University Change Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have used {universityChangeCount} of 2 tracked university changes. Additional changes after the limit require admin review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.info(`You have ${Math.max(0, 2 - universityChangeCount)} tracked change(s) remaining.`)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProfile;
