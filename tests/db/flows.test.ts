// End-to-end: the app's TypeScript data functions calling the real database
// functions, as different signed-in players.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  askToJoinCrew, askToJoinGame, askToPlay, blockPlayer, cancelGame, cancelRequest, createCrew, createGame,
  getCrew, getForYou, getGame, getMyRequests, getPlayerProfile, leaveCrew, leaveGame, markActive,
  respondToRequest, setCrewOpen, unblockPlayer,
} from "@/features/matching/data";
import { getConversations, getMessages, sendMessage } from "@/features/matching/chat";
import { getCourtDetail, getCourts } from "@/features/events-map/data";
import { addCourt, addPlayer, createTestDb, uid, type TestDb } from "./harness";

let db: TestDb;
let courtId: string;
const HOST = uid(1);
const P2 = uid(2);
const P3 = uid(3);
const P4 = uid(4);
const P5 = uid(5);
const tomorrow = () => new Date(Date.now() + 86_400_000);

beforeAll(async () => {
  db = await createTestDb();
  await addCourt(db, "carnarvon", "Oak Bay", "Carnarvon Park");
  courtId = (await db.pg.query<{ id: string }>(`select id from public.courts`)).rows[0].id;
  for (const [id, name] of [[HOST, "Host"], [P2, "Two"], [P3, "Three"], [P4, "Four"], [P5, "Five"]]) {
    await addPlayer(db, { id, name, homeCourtSlug: "carnarvon", playTimes: ["thu_evening"] });
  }
});
afterAll(() => db.close());

describe("games", () => {
  let gameId: string;

  test("anyone can post a game; it shows in other players' strip and on the court", async () => {
    gameId = await createGame(db.as(HOST), {
      courtId, startsAt: tomorrow(), format: "doubles", targetLevel: 3.5, note: "Lights on at 6", guestCount: 1,
    });
    const forYou = await getForYou(db.as(P2));
    expect(forYou.games.map((g) => g.id)).toEqual([gameId]);
    expect(forYou.games[0]).toMatchObject({ needs: 2, total_players: 4, note: "Lights on at 6" });

    // ...but not in the host's own strip.
    expect((await getForYou(db.as(HOST))).games).toEqual([]);

    const court = await getCourtDetail(db.as(null), courtId);
    expect(court!.games.map((g) => g.id)).toEqual([gameId]);
    expect(court!.players).toHaveLength(5);
    expect((await getCourts(db.as(null)))[0]).toMatchObject({ name: "Carnarvon Park", open_game_count: 1 });

    // Signed-out visitors can open the game, but see no requests or chat.
    const anon = await getGame(db.as(null), gameId);
    expect(anon).toMatchObject({ needs: 2, my_request_status: null, blocked_player_names: [] });
    expect(anon!.players.map((p) => p.name)).toEqual(["Host"]);
  });

  test("ask to join → host accepts → you're in the game and its chat", async () => {
    const requestId = await askToJoinGame(db.as(P2), gameId);
    expect(await askToJoinGame(db.as(P2), gameId)).toBe(requestId); // asking twice is harmless

    const { incoming } = await getMyRequests(db.as(HOST));
    expect(incoming).toEqual([expect.objectContaining({ id: requestId, target_kind: "game", game_id: gameId })]);
    expect(incoming[0].requester.name).toBe("Two");

    // Only the host can answer.
    await expect(respondToRequest(db.as(P3), requestId, true)).rejects.toThrow(/can't answer/);

    const conversationId = await respondToRequest(db.as(HOST), requestId, true);
    const game = await getGame(db.as(P3), gameId);
    expect(game!.players.map((p) => [p.name, p.is_host])).toEqual([["Host", true], ["Two", false]]);
    expect(game!.needs).toBe(1);

    await sendMessage(db.as(P2), conversationId!, "See you there!");
    const messages = await getMessages(db.as(HOST), conversationId!);
    expect(messages.map((m) => m.body)).toEqual(["See you there!"]);
    // Not in the game, not in the chat.
    await expect(sendMessage(db.as(P3), conversationId!, "hi")).rejects.toThrow(/row-level security/);
    expect(await getMessages(db.as(P3), conversationId!)).toEqual([]);
  });

  test("a game can't be overfilled", async () => {
    const r3 = await askToJoinGame(db.as(P3), gameId);
    const r4 = await askToJoinGame(db.as(P4), gameId);
    await respondToRequest(db.as(HOST), r3, true);
    await expect(respondToRequest(db.as(HOST), r4, true)).rejects.toThrow(/already full/);
    await expect(askToJoinGame(db.as(P5), gameId)).rejects.toThrow(/full/);
    expect((await getForYou(db.as(P5))).games).toEqual([]); // full games aren't listed
  });

  test("leaving a game frees the spot and removes you from its chat", async () => {
    await leaveGame(db.as(P3), gameId);
    const game = await getGame(db.as(HOST), gameId);
    expect(game!.needs).toBe(1);
    const convs = await getConversations(db.as(P3));
    expect(convs.find((c) => c.game_id === gameId)).toBeUndefined();
    await expect(leaveGame(db.as(HOST), gameId)).rejects.toThrow(/Cancel it instead/);
  });

  test("cancelling makes the chat read-only and declines waiting requests", async () => {
    const pending = await askToJoinGame(db.as(P5), gameId);
    await expect(cancelGame(db.as(P2), gameId)).rejects.toThrow(/Only the host/);
    await cancelGame(db.as(HOST), gameId);

    const chat = (await getConversations(db.as(P2))).find((c) => c.game_id === gameId)!;
    expect(chat.can_post).toBe(false);
    await expect(sendMessage(db.as(P2), chat.id, "still on?")).rejects.toThrow(/row-level security/);
    expect((await getMessages(db.as(P2), chat.id)).map((m) => m.body)).toEqual(["See you there!"]);

    const { outgoing } = await getMyRequests(db.as(P5));
    expect(outgoing.find((r) => r.id === pending)!.status).toBe("declined");
    expect(await getGame(db.as(null), gameId)).toBeNull(); // gone for outsiders
  });

  test("bad games are refused", async () => {
    await expect(createGame(db.as(HOST), { courtId, startsAt: new Date(Date.now() - 1000), format: "doubles" }))
      .rejects.toThrow(/future/);
    await expect(createGame(db.as(HOST), { courtId, startsAt: tomorrow(), format: "singles", guestCount: 1 }))
      .rejects.toThrow(/already full/);
    await expect(createGame(db.as(null), { courtId, startsAt: tomorrow(), format: "doubles" }))
      .rejects.toThrow(/permission denied/);
  });
});

describe("crews", () => {
  let crewId: string;

  test("a crew starts with 2–3 people and shows in the directory", async () => {
    expect(await getPlayerProfile(db.as(null), HOST)).toMatchObject({ name: "Host", my_request_status: null });
    await expect(createCrew(db.as(HOST), { name: "Solo", homeCourtId: courtId, format: "doubles", playStyle: "social", guestCount: 0 }))
      .rejects.toThrow(/2 or 3/);
    crewId = await createCrew(db.as(HOST), {
      name: "Thursday crew", homeCourtId: courtId, format: "doubles", playStyle: "social",
      playTimes: ["thu_evening"], guestCount: 1,
    });
    const forYou = await getForYou(db.as(P2));
    const crew = [...forYou.best_matches, ...forYou.everyone_else].find((e) => e.id === crewId);
    expect(crew).toMatchObject({ kind: "crew", needs: 2, name: "Thursday crew" });
  });

  test("any member can accept; a full crew stops looking", async () => {
    await respondToRequest(db.as(HOST), await askToJoinCrew(db.as(P2), crewId), true);
    const r3 = await askToJoinCrew(db.as(P3), crewId);
    const r4 = await askToJoinCrew(db.as(P4), crewId);
    await expect(respondToRequest(db.as(P5), r3, true)).rejects.toThrow(/can.t answer/); // not a member
    await respondToRequest(db.as(P2), r3, true); // P2 is a member now, so P2 can accept

    const crew = await getCrew(db.as(P4), crewId);
    expect(crew).toMatchObject({ is_open: false, needs: 0 });
    expect(crew!.members.map((m) => m.name)).toEqual(["Host", "Two", "Three"]);
    await expect(respondToRequest(db.as(HOST), r4, true)).rejects.toThrow(/already full/);

    const forYou = await getForYou(db.as(P5));
    expect([...forYou.best_matches, ...forYou.everyone_else].some((e) => e.id === crewId)).toBe(false);
  });

  test("leaving reopens a spot; the last member leaving ends the crew", async () => {
    await leaveCrew(db.as(P3), crewId);
    await setCrewOpen(db.as(P2), crewId, true);
    expect(await getCrew(db.as(P5), crewId)).toMatchObject({ is_open: true, needs: 1 });
    await expect(setCrewOpen(db.as(P5), crewId, false)).rejects.toThrow(/Only crew members/);

    await leaveCrew(db.as(HOST), crewId);
    await leaveCrew(db.as(P2), crewId);
    expect(await getCrew(db.as(P5), crewId)).toBeNull();
  });
});

describe("play requests, chat and blocking", () => {
  let chatId: string;

  test("Ask to play → accept opens a one-to-one chat", async () => {
    const requestId = await askToPlay(db.as(P4), P5);
    expect((await getPlayerProfile(db.as(P4), P5))!.my_request_status).toBe("pending");
    chatId = (await respondToRequest(db.as(P5), requestId, true))!;

    await sendMessage(db.as(P4), chatId, "Thursday?");
    await sendMessage(db.as(P5), chatId, "Yes! 6pm at Carnarvon.");
    expect((await getMessages(db.as(P4), chatId)).map((m) => m.body)).toEqual(["Thursday?", "Yes! 6pm at Carnarvon."]);

    const [conv] = (await getConversations(db.as(P5))).filter((c) => c.kind === "direct");
    expect(conv).toMatchObject({ id: chatId, can_post: true });
    expect(conv.last_message!.body).toBe("Yes! 6pm at Carnarvon.");

    // Asking again later reuses the same chat.
    expect(await respondToRequest(db.as(P4), await askToPlay(db.as(P5), P4), true)).toBe(chatId);
  });

  test("a request can be withdrawn before it's answered", async () => {
    const id = await askToPlay(db.as(P2), P3);
    expect(await cancelRequest(db.as(P2), id)).toBe(true);
    expect((await getMyRequests(db.as(P3))).incoming).toEqual([]);
  });

  test("blocking ends the one-to-one chat and hides each from the other", async () => {
    await blockPlayer(db.as(P5), P4);

    expect((await getConversations(db.as(P4))).find((c) => c.id === chatId)!.can_post).toBe(false);
    await expect(sendMessage(db.as(P4), chatId, "hello?")).rejects.toThrow(/row-level security/);
    await expect(sendMessage(db.as(P5), chatId, "bye")).rejects.toThrow(/row-level security/);
    // The blocker no longer sees the blocked person's messages.
    expect((await getMessages(db.as(P5), chatId)).map((m) => m.body)).toEqual(["Yes! 6pm at Carnarvon."]);

    const ids = (f: Awaited<ReturnType<typeof getForYou>>) =>
      [...f.best_matches, ...f.everyone_else, ...f.not_looking].map((e) => e.id);
    expect(ids(await getForYou(db.as(P4)))).not.toContain(P5);
    expect(ids(await getForYou(db.as(P5)))).not.toContain(P4);
    expect(await getPlayerProfile(db.as(P4), P5)).toBeNull();
    expect((await getCourtDetail(db.as(P4), courtId))!.players.map((p) => p.id)).not.toContain(P5);
  });

  test("a play request to someone who blocked you is declined, without saying why", async () => {
    const id = await askToPlay(db.as(P4), P5);
    const { outgoing } = await getMyRequests(db.as(P4));
    expect(outgoing.find((r) => r.id === id)!.status).toBe("declined");
    expect((await getMyRequests(db.as(P5))).incoming).toEqual([]);
    await expect(askToPlay(db.as(P5), P4)).rejects.toThrow(/Unblock/);
  });

  test("a game with someone you blocked still shows, and only the blocker is warned", async () => {
    const gameId = await createGame(db.as(P4), { courtId, startsAt: tomorrow(), format: "doubles" });

    const forBlocker = await getForYou(db.as(P5));
    expect(forBlocker.games.find((g) => g.id === gameId)!.has_blocked_player).toBe(true);
    expect((await getGame(db.as(P5), gameId))!.blocked_player_names).toEqual(["Four"]);
    expect((await getGame(db.as(P2), gameId))!.blocked_player_names).toEqual([]);

    // The blocker can still ask to join (after the warning)...
    const fromBlocker = await askToJoinGame(db.as(P5), gameId);
    expect((await getMyRequests(db.as(P4))).incoming.map((r) => r.id)).toContain(fromBlocker);

    // ...but the blocked person's requests to the blocker's own games are declined silently.
    const blockerGame = await createGame(db.as(P5), { courtId, startsAt: tomorrow(), format: "doubles" });
    const fromBlocked = await askToJoinGame(db.as(P4), blockerGame);
    expect((await getMyRequests(db.as(P4))).outgoing.find((r) => r.id === fromBlocked)!.status).toBe("declined");
    expect((await getGame(db.as(P4), blockerGame))!.blocked_player_names).toEqual([]); // never told
  });

  test("unblocking restores the directory", async () => {
    await unblockPlayer(db.as(P5), P4);
    expect(await getPlayerProfile(db.as(P4), P5)).not.toBeNull();
  });
});

test("markActive updates last-active day", async () => {
  await db.pg.query(`update public.players set last_active_at = now() - interval '90 days' where id = $1`, [P2]);
  await markActive(db.as(P2));
  const [card] = await db.as(P3).sql<{ last_active_on: string | Date }>(
    `select last_active_on from public.player_cards where id = $1`, [P2]);
  expect(new Date(card.last_active_on).getTime()).toBeGreaterThan(Date.now() - 2 * 86_400_000);
});
