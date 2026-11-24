// Every number the "for you" ranking uses, in one place. Changing how Bink
// ranks people should be a one-line edit here.
// The full reasoning is in docs/superpowers/specs/2026-11-24-matchmaking-design.md.

export const MATCH_SETTINGS = {
  /**
   * Launch mode (false): nobody is hidden. A dealbreaker only keeps someone out
   * of "Best matches". Strict mode (true): dealbreaker hits are hidden.
   * Switch on once a typical player has 30+ people scoring 60 or more.
   */
  strictMode: false,

  /** Minimum score to appear in "Best matches". */
  bestMatchMinScore: 60,
  /** Entries within this many points of each other are shuffled (fixed per viewer per day). */
  shuffleWithinPoints: 3,
  /** Games show up to this many days ahead. */
  gameWindowDays: 7,
  /** Crews aim for this many players. */
  crewSize: 4,
  /** Victoria's time zone: used for "today", game days and parts of the day. */
  timeZone: "America/Vancouver",
  /** Hour (24h, local) at which afternoon and evening start. */
  afternoonStartsAt: 12,
  eveningStartsAt: 17,

  skill: {
    max: 25,
    /** [largest gap, points], checked in order. A bigger gap scores 0. */
    steps: [
      [0, 25],
      [0.25, 20],
      [0.5, 12],
      [0.75, 5],
    ] as ReadonlyArray<readonly [number, number]>,
    /** A bigger gap than this is a dealbreaker. */
    dealbreakerGap: 1.0,
  },
  playTimes: {
    max: 20,
    /** Games: on one of the viewer's slots scores max; on one of their days at another time scores this. */
    gameSameDayOtherTime: 10,
  },
  place: { sameHomeCourt: 15, sharedCourt: 10, sameArea: 5, max: 15 },
  style: { same: 15, oneStep: 7, max: 15 },
  format: { all: 10, some: 5, max: 10 },
  activity: {
    max: 10,
    /** [within this many days, points], checked in order. Older scores 0. */
    steps: [
      [7, 10],
      [30, 6],
      [60, 2],
    ] as ReadonlyArray<readonly [number, number]>,
    /** Inactive for longer than this is a dealbreaker. */
    dealbreakerDays: 60,
  },
  age: { max: 5 },
  /** Bonus for competitive viewers: a current hill streak at one of their courts. */
  hillBonus: 5,
};

export type MatchSettings = typeof MATCH_SETTINGS;
