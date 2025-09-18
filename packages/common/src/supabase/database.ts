import { Database } from "./database.types";

export type Content = Database["public"]["Tables"]["contents"]["Row"];
export type UserContent = Database["public"]["Tables"]["user_contents"]["Row"];

// Extended type with content details
export interface UserContentWithDetails extends UserContent {
  contents?: Content;
  preferences?: UserContentPreferenceTyped[];
}

// Todo filter type based on database enum with 'all' option
export type ContentTodoStatus =
  Database["public"]["Enums"]["content_todo_status"];
export type TodoFilterType = ContentTodoStatus | "all";

// Recommendation type for recommendation feed
export interface Recommendation {
  content_id: string;
  distance: number;
  score: number;
  contents?: Content | null;
}

// Similar content payload returned by Nest `/contents/:id/similar`
export interface SimilarContentRecommendation {
  content_id: string;
  distance: number;
  score: number;
  contents?: Content | null;
}

// User Content Preferences types
export type PreferenceType = "liked" | "not_interested" | "blocked";

export type UserContentPreference =
  Database["public"]["Tables"]["user_content_preferences"]["Row"];

export type UserContentPreferenceInsert =
  Database["public"]["Tables"]["user_content_preferences"]["Insert"];

// Type-safe preference with proper enum
export interface UserContentPreferenceTyped
  extends Omit<UserContentPreference, "preference_type"> {
  preference_type: PreferenceType;
}
