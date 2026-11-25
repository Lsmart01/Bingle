import { describe, expect, test } from "vitest";
import {
  agePoints, formatPoints, gameTimePoints, genderFitFor, placePoints, playTimePoints, scoreSubject, skillPoints,
  stylePoints, type ScoringSubject, type ScoringViewer,
} from "./score";

const OAK_BAY = "court-oak-bay";
const TOPAZ = "court-topaz";

// The viewer from the design doc's worked example.
const viewer: ScoringViewer = {
  skill: 3.5,
  style: "competitive",
  formats: ["doubles", "mixed"],
  playTimes: ["tue_evening", "thu_evening"],
  homeCourtId: OAK_BAY,
  courtIds: [OAK_BAY],
  area: "Oak Bay",
  prefAgeMin: null,
  prefAgeMax: null,
  prefGender: null,
};

function subject(overrides: Partial<ScoringSubject> = {}): ScoringSubject {
  return {
    skill: 3.5,
    style: "competitive",
    formats: ["doubles", "mixed"],
    playTimes: ["tue_evening", "thu_evening"],
    homeCourtId: OAK_BAY,
    courtIds: [OAK_BAY],
    area: "Oak Bay",
    daysInactive: 0,
    age: 30,
    genders: ["woman"],
    hasHillStreakAtViewerCourt: false,
    ...overrides,
  };
}

describe("the design doc's worked example", () => {
  test("Player A scores 80", () => {
    const a = scoreSubject(viewer, subject({
      skill: 3.5,
      style: "competitive",
      formats: ["doubles"],
      playTimes: ["thu_evening"],
      homeCourtId: TOPAZ, // plays at Oak Bay, but it isn't their home court
      courtIds: [TOPAZ, OAK_BAY],
      daysInactive: 3,
    }));
    expect(a).toMatchObject({ skill: 25, time: 10, place: 10, style: 15, format: 5, activity: 10, age: 5, hill: 0 });
    expect(a.total).toBe(80);
    expect(a.dealbreakers).toEqual([]);
  });

  test("Player B scores 75", () => {
    const b = scoreSubject(viewer, subject({
      skill: 4.0,
      style: "social",
      formats: ["doubles", "mixed"],
      playTimes: ["tue_evening", "thu_evening"],
      homeCourtId: OAK_BAY,
      courtIds: [OAK_BAY],
      daysInactive: 20,
    }));
    expect(b).toMatchObject({ skill: 12, time: 20, place: 15, style: 7, format: 10, activity: 6, age: 5 });
    expect(b.total).toBe(75);
  });
});

describe("each metric", () => {
  test("skill steps by gap", () => {
    expect([0, 0.25, 0.5, 0.75, 0.76, 1.5].map((g) => skillPoints(g))).toEqual([25, 20, 12, 5, 0, 0]);
  });

  test("skill gaps aren't thrown off by float noise", () => {
    expect(scoreSubject(viewer, subject({ skill: 3.75 })).skill).toBe(20);
    expect(scoreSubject(viewer, subject({ skill: 3.25 })).skill).toBe(20);
  });

  test("play times: share of the viewer's slots; half if either side hasn't set any", () => {
    expect(playTimePoints(["tue_evening", "thu_evening"], ["thu_evening"])).toBe(10);
    expect(playTimePoints(["tue_evening", "thu_evening"], ["sat_morning"])).toBe(0);
    expect(playTimePoints([], ["sat_morning"])).toBe(10);
    expect(playTimePoints(["tue_evening"], [])).toBe(10);
  });

  test("game time fit: same slot 20, same day 10, otherwise 0", () => {
    expect(gameTimePoints(["thu_evening"], { day: "thu", part: "evening" })).toBe(20);
    expect(gameTimePoints(["thu_evening"], { day: "thu", part: "morning" })).toBe(10);
    expect(gameTimePoints(["thu_evening"], { day: "sat", part: "evening" })).toBe(0);
    expect(gameTimePoints([], { day: "sat", part: "evening" })).toBe(10);
  });

  test("place: home 15, shared court 10, same area 5, else 0; unknown half", () => {
    const v = { homeCourtId: OAK_BAY, courtIds: [OAK_BAY], area: "Oak Bay" };
    expect(placePoints(v, { homeCourtId: OAK_BAY, courtIds: [OAK_BAY], area: "Oak Bay" })).toBe(15);
    expect(placePoints(v, { homeCourtId: TOPAZ, courtIds: [TOPAZ, OAK_BAY], area: "Victoria" })).toBe(10);
    expect(placePoints(v, { homeCourtId: "other", courtIds: ["other"], area: "Oak Bay" })).toBe(5);
    expect(placePoints(v, { homeCourtId: TOPAZ, courtIds: [TOPAZ], area: "Victoria" })).toBe(0);
    expect(placePoints(v, { homeCourtId: null, courtIds: [], area: null })).toBe(7.5);
  });

  test("style: same 15, one step 7, fun vs competitive 0, unset half", () => {
    expect(stylePoints("competitive", "competitive")).toBe(15);
    expect(stylePoints("social", "fun")).toBe(7);
    expect(stylePoints("fun", "competitive")).toBe(0);
    expect(stylePoints("fun", null)).toBe(7.5);
  });

  test("format: all of the viewer's 10, some 5, none 0", () => {
    expect(formatPoints(["doubles", "mixed"], ["doubles", "mixed", "singles"])).toBe(10);
    expect(formatPoints(["doubles", "mixed"], ["doubles"])).toBe(5);
    expect(formatPoints(["doubles"], ["singles"])).toBe(0);
  });

  test("activity: 7 days 10, 30 days 6, 60 days 2, older 0", () => {
    expect([0, 7, 8, 30, 31, 60, 61].map((d) => scoreSubject(viewer, subject({ daysInactive: d })).activity))
      .toEqual([10, 10, 6, 6, 2, 2, 0]);
    expect(scoreSubject(viewer, subject({ daysInactive: null })).activity).toBe(10); // games
  });

  test("age: in range 5, outside 0, no preference 5, unknown 2.5", () => {
    const pref = { prefAgeMin: 25, prefAgeMax: 40 };
    expect(agePoints(pref, 30)).toBe(5);
    expect(agePoints(pref, 41)).toBe(0);
    expect(agePoints(pref, 24)).toBe(0);
    expect(agePoints({ prefAgeMin: null, prefAgeMax: null }, 70)).toBe(5);
    expect(agePoints(pref, null)).toBe(2.5);
    expect(agePoints({ prefAgeMin: 30, prefAgeMax: null }, 60)).toBe(5);
  });

  test("hill bonus only for competitive viewers", () => {
    expect(scoreSubject(viewer, subject({ hasHillStreakAtViewerCourt: true })).hill).toBe(5);
    expect(scoreSubject({ ...viewer, style: "social" }, subject({ hasHillStreakAtViewerCourt: true })).hill).toBe(0);
  });

  test("a perfect match scores 100, plus the hill bonus", () => {
    expect(scoreSubject(viewer, subject()).total).toBe(100);
    expect(scoreSubject(viewer, subject({ hasHillStreakAtViewerCourt: true })).total).toBe(105);
  });
});

describe("dealbreakers", () => {
  test("skill gap over 1.0", () => {
    expect(scoreSubject(viewer, subject({ skill: 4.5 })).dealbreakers).toEqual([]);
    expect(scoreSubject(viewer, subject({ skill: 4.75 })).dealbreakers).toEqual(["skill_gap"]);
  });

  test("no shared format", () => {
    expect(scoreSubject(viewer, subject({ formats: ["singles"] })).dealbreakers).toEqual(["no_shared_format"]);
  });

  test("inactive over 60 days", () => {
    expect(scoreSubject(viewer, subject({ daysInactive: 61 })).dealbreakers).toEqual(["inactive"]);
  });

  test("outside the gender preference, only when the viewer set one", () => {
    const picky = { ...viewer, prefGender: ["woman" as const] };
    expect(scoreSubject(picky, subject({ genders: ["man"] })).dealbreakers).toEqual(["gender"]);
    expect(scoreSubject(viewer, subject({ genders: ["man"] })).dealbreakers).toEqual([]);
  });

  test("missing info is never a dealbreaker", () => {
    const picky = { ...viewer, prefGender: ["woman" as const], prefAgeMin: 25 };
    const r = scoreSubject(picky, subject({ genders: [null], age: null, playTimes: [] }));
    expect(r.dealbreakers).toEqual([]);
    expect(r.genderFit).toBe("unknown");
  });
});

describe("gender fit", () => {
  test("players", () => {
    expect(genderFitFor(null, ["man"])).toBe("no_preference");
    expect(genderFitFor(["woman"], ["woman"])).toBe("match");
    expect(genderFitFor(["woman"], ["man"])).toBe("mismatch");
    expect(genderFitFor(["woman"], ["prefer_not_to_say"])).toBe("unknown");
    expect(genderFitFor(["woman"], [null])).toBe("unknown");
  });

  test("a crew matches only if every member does", () => {
    expect(genderFitFor(["woman", "non_binary"], ["woman", "non_binary"])).toBe("match");
    expect(genderFitFor(["woman"], ["woman", "man"])).toBe("mismatch");
    expect(genderFitFor(["woman"], ["woman", "prefer_not_to_say"])).toBe("unknown");
    expect(genderFitFor(["woman"], ["prefer_not_to_say", "man"])).toBe("mismatch");
  });
});
