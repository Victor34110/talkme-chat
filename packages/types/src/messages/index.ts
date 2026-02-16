import { Message } from "src/client/browser";

export type CreateMessage = Omit<Message, "message_id" | "created_at">