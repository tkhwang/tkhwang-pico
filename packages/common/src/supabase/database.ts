import { Database } from "./database.types";

export type Content = Database["public"]["Tables"]["contents"]["Row"];
export type UserContent = Database["public"]["Tables"]["user_contents"]["Row"];

// Extended type with content details
export interface UserContentWithDetails extends UserContent {
  content?: Content;
  contents?: Content;
}
