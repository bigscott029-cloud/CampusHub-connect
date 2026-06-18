import { supabase } from "@/integrations/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

type CountQuery = PromiseLike<{ count: number | null; error: { message?: string } | null }>;
type RpcNumberQuery = PromiseLike<{ data: number | null; error: { message?: string } | null }>;

export interface PlatformMetrics {
  universities: number;
  registeredUsers: number;
  publicGists: number;
  anonymousPosts: number;
  marketplaceListings: number;
  hostelListings: number;
  roommateRequests: number;
  upcomingExams: number;
  activeStories: number;
  unreadCapableMessages: number;
  campusActivity: number;
  publicListings: number;
}

export interface PublicFeedPreviewItem {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  type: "gist" | "anonymous";
  trending: boolean;
  createdAt: string;
}

async function safeCount(query: CountQuery) {
  const { count, error } = await query;

  if (error) {
    console.warn("Live metric unavailable:", error.message ?? error);
    return 0;
  }

  return count ?? 0;
}

async function safeNumberRpc(query: RpcNumberQuery) {
  const { data, error } = await query;

  if (error) {
    console.warn("Live metric unavailable:", error.message ?? error);
    return 0;
  }

  return data ?? 0;
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const nowIso = new Date().toISOString();

  const [
    universities,
    registeredUsers,
    publicGists,
    anonymousPosts,
    marketplaceListings,
    hostelListings,
    roommateRequests,
    upcomingExams,
    activeStories,
    unreadCapableMessages,
  ] = await Promise.all([
    safeCount(supabase.from("universities").select("id", { count: "exact", head: true })),
    safeNumberRpc(supabase.rpc("get_registered_user_count")),
    safeCount(supabase.from("posts").select("id", { count: "exact", head: true })),
    safeCount(supabase.from("anonymous_posts").select("id", { count: "exact", head: true })),
    safeCount(supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("status", "approved")),
    safeCount(supabase.from("hostel_listings").select("id", { count: "exact", head: true }).eq("status", "approved")),
    safeCount(supabase.from("roommate_requests").select("id", { count: "exact", head: true }).eq("status", "approved")),
    safeCount(supabase.from("exams").select("id", { count: "exact", head: true }).gte("exam_date", nowIso)),
    safeCount(supabase.from("stories").select("id", { count: "exact", head: true }).gt("expires_at", nowIso)),
    safeCount(supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false)),
  ]);

  const publicListings = marketplaceListings + hostelListings;

  return {
    universities,
    registeredUsers,
    publicGists,
    anonymousPosts,
    marketplaceListings,
    hostelListings,
    roommateRequests,
    upcomingExams,
    activeStories,
    unreadCapableMessages,
    publicListings,
    campusActivity: publicGists + anonymousPosts + publicListings + roommateRequests + upcomingExams,
  };
}

export async function getPublicFeedPreview(limit = 3): Promise<PublicFeedPreviewItem[]> {
  const [postsResult, anonymousResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, content, likes_count, comments_count, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("anonymous_posts")
      .select("id, anonymous_name, content, likes_count, comments_count, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (postsResult.error || anonymousResult.error) {
    throw postsResult.error || anonymousResult.error;
  }

  return [
    ...(postsResult.data ?? []).map((post): PublicFeedPreviewItem => ({
      id: `gist-${post.id}`,
      author: "Campus member",
      avatar: "CM",
      time: formatRelativeTime(post.created_at),
      content: post.content,
      likes: post.likes_count ?? 0,
      comments: post.comments_count ?? 0,
      type: "gist",
      trending: (post.likes_count ?? 0) + (post.comments_count ?? 0) > 10,
      createdAt: post.created_at,
    })),
    ...(anonymousResult.data ?? []).map((post): PublicFeedPreviewItem => ({
      id: `anonymous-${post.id}`,
      author: post.anonymous_name,
      avatar: post.anonymous_name.charAt(0).toUpperCase(),
      time: formatRelativeTime(post.created_at),
      content: post.content,
      likes: post.likes_count ?? 0,
      comments: post.comments_count ?? 0,
      type: "anonymous",
      trending: (post.likes_count ?? 0) + (post.comments_count ?? 0) > 10,
      createdAt: post.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
