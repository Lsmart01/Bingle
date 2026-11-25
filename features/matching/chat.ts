// In-app chat. Conversations open automatically: a game or crew's group chat
// when you join, a one-to-one chat when a play request is accepted.
import type { SupabaseClient } from "@supabase/supabase-js";
import { call, type RpcClient } from "@/shared/supabase/rpc";

export type ConversationSummary = {
  id: string;
  kind: "direct" | "game" | "crew";
  game_id: string | null;
  crew_id: string | null;
  /** False once a game is cancelled or, in a one-to-one chat, after a block. */
  can_post: boolean;
  members: { id: string; name: string; photo_url: string }[];
  last_message: Message | null;
};

export type Message = { id: number; sender_id: string; body: string; sent_at: string };

/** Your conversations, most recent activity first. */
export const getConversations = (client: RpcClient) => call<ConversationSummary[]>(client, "my_conversations");

/** Messages oldest first. Pass `before` (the oldest id you have) to load earlier ones. */
export const getMessages = (client: RpcClient, conversationId: string, options: { before?: number; limit?: number } = {}) =>
  call<Message[]>(client, "get_messages", {
    p_conversation_id: conversationId,
    p_before: options.before ?? null,
    p_limit: options.limit ?? 50,
  });

/** Send a text message. Returns its id. */
export const sendMessage = (client: RpcClient, conversationId: string, body: string) =>
  call<number>(client, "send_message", { p_conversation_id: conversationId, p_body: body });

/**
 * Live updates: calls onMessage for each new message in the conversation.
 * Supabase only delivers messages the viewer is allowed to read. Returns a
 * function that stops listening.
 */
export function subscribeToMessages(
  client: SupabaseClient,
  conversationId: string,
  onMessage: (message: Message) => void,
): () => void {
  const channel = client
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const m = payload.new as Message & { conversation_id: string };
        onMessage({ id: m.id, sender_id: m.sender_id, body: m.body, sent_at: m.sent_at });
      },
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
