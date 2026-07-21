export type ColumnId = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  columnId: ColumnId;
  content: string;
}
