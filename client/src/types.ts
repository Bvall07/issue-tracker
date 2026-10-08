export type Issue = {
  id: number;
  title: string;
  description: string;
  status: "To do" | "In progress" | "Done";
  created_at: string;
};