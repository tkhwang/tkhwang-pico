import { Database } from "./database.types";

export type Content = Database["public"]["Tables"]["contents"]["Row"];
export type UserContent = Database["public"]["Tables"]["user_contents"]["Row"];

// Extended type with content details
export interface UserContentWithDetails extends UserContent {
  contents?: Content;
}

// Todo filter type based on database enum with 'all' option
export type ContentTodoStatus =
  Database["public"]["Enums"]["content_todo_status"];
export type TodoFilterType = ContentTodoStatus | "all";
