/* eslint-disable react/no-unescaped-entities -- marketing copy keeps its straight quotes and apostrophes */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EventForm } from "./event-form";
import { JoinForm } from "./join-form";

const VIEWS = ["home", "events", "players", "about", "faq", "join"] as const;
type View = (typeof VIEWS)[number];

// The current view comes from the address bar's #hash, so links like #events
// work, the back button works, and a view can be shared as a link.
function readView(): View {
  const name = window.location.hash.replace("#", "");
  return (VIEWS as readonly string[]).includes(name) ? (name as View) : "home";
}
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const NAV: { view: View; label: string }[] = [
  { view: "events", label: "Events" },
  { view: "about", label: "About us" },
  { view: "players", label: "Find players" },
];

const MARQUEE = [
  "Come solo, leave with friends",
  "Drop-in nights",
  "Social mixers",
  "Skills clinics",
  "Champion of the Court",
  "The Bink Open",
  "All levels welcome",
];

// The club mark: spaced BINK, a cartoon pickleball floating over the I, PICKLEBALL underneath.
function LogoMark() {
  return (
    <>
      <span className="lw">
        B
        <span className="li">
          I
          <svg className="pb" aria-hidden="true">
            <use href="#pickleball" />
          </svg>
        </span>
        NK
      </span>
      <span className="ls">PICKLEBALL</span>
    </>
  );
}

export function Site() {
  const view = useSyncExternalStore(subscribe, readView, () => "home" as View);
  const [introDone, setIntroDone] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const bigLogoRef = useRef<HTMLSpanElement>(null);
  const navLogoRef = useRef<HTMLAnchorElement>(null);

  // Intro: BINK rises, the ball drops onto the I, then the logo flies into the toolbar.
  useEffect(() => {
    const intro = introRef.current;
    const big = bigLogoRef.current;
    const small = navLogoRef.current;
    if (!intro || !big || !small) return;

    const timers: number[] = [];
    let flown = false;
    const finish = () => setIntroDone(true);
    const fly = () => {
      if (flown) return;
      flown = true;
      const a = big.getBoundingClientRect();
      const b = small.getBoundingClientRect();
      big.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.height / a.height})`;
      big.style.color = getComputedStyle(small).color;
      intro.classList.add("go");
      timers.push(window.setTimeout(finish, 950));
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      timers.push(window.setTimeout(finish, 0));
    } else {
      intro.addEventListener("click", fly);
      timers.push(window.setTimeout(fly, 2000));
      timers.push(window.setTimeout(finish, 3500));
    }
    return () => {
      intro.removeEventListener("click", fly);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={introDone ? "site" : "site intro-on"} data-view={view}>
      {/* The pickleball, drawn once and reused by both logos */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="pickleball" viewBox="0 0 40 40">
          <defs>
            <clipPath id="pb-clip">
              <circle cx="20" cy="20" r="17.5" />
            </clipPath>
          </defs>
          <g clipPath="url(#pb-clip)">
            <rect width="40" height="40" fill="#86c81f" />
            <circle cx="17.6" cy="17.4" r="16.2" fill="#b6f03c" />
          </g>
          <g fill="#121a21">
            <circle cx="20.4" cy="20.2" r="2.5" />
            <circle cx="28.4" cy="18.6" r="2.2" />
            <circle cx="12" cy="21.4" r="2.2" />
            <circle cx="24.6" cy="27.6" r="2.2" />
            <circle cx="16" cy="28.2" r="2.1" />
            <circle cx="23.4" cy="11.8" r="2.1" />
            <circle cx="14.8" cy="12.8" r="2" />
          </g>
          <path d="M8.6 15.2 Q10.4 9.6 16.4 7.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="8" cy="19.2" r="1.3" fill="#fff" />
          <circle cx="20" cy="20" r="17.5" fill="none" stroke="#121a21" strokeWidth="3" />
        </symbol>
      </svg>

      {!introDone && (
        <div id="intro" ref={introRef} aria-hidden="true">
          <span className="logo" ref={bigLogoRef}>
            <LogoMark />
          </span>
        </div>
      )}

      <nav className="nav" aria-label="Site">
        <div className="wrap">
          <div className="side l">
            {NAV.map((item) => (
              <a key={item.view} href={`#${item.view}`} aria-current={view === item.view ? "page" : undefined}>
                {item.label}
              </a>
            ))}
          </div>
          <a className="logo" href="#home" aria-label="Bink home" ref={navLogoRef}>
            <LogoMark />
          </a>
          <div className="side r">
            <a className="btn" href="#join">
              Join us
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* ===== HOME ===== */}
        <section className="view" id="home" aria-label="Home" hidden={view !== "home"}>
          <div className="slides" aria-hidden="true">
            <div className="slide" />
            <div className="slide" />
            <div className="slide" />
            <div className="slide" />
          </div>
          <div className="edge" aria-hidden="true" />
          <div className="wrap">
            <span className="pill">
              <i aria-hidden="true" />
              Victoria's pickleball community
            </span>
            <h1>
              More than a
              <br />
              <span className="hl">
                <span>game.</span>
              </span>
            </h1>
            <p className="promise">
              Join Victoria's <b>fastest growing</b> community.
            </p>
            <div className="ctas">
              <a className="btn" href="#join">
                Find people
              </a>
              <a className="btn ghost" href="#events">
                See what's on
              </a>
            </div>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="track">
              {[...MARQUEE, ...MARQUEE].map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== EVENTS ===== */}
        <section className="view" id="events" aria-label="Events" hidden={view !== "events"}>
          <div className="wrap">
            <div className="ev-wrap">
              <div className="ev-intro">
                <p className="kicker">Events</p>
                <h2>Where the community meets</h2>
                <p>
                  Drop-ins, clinics, socials and tournaments across Victoria, for every level. Tell us what you're after
                  and we'll get in touch.
                </p>
                <div className="ev-types" aria-label="Event types">
                  {["Drop-in nights", "Skills clinics", "Social mixers", "Champion of the Court", "The Bink Open", "Private & team events"].map(
                    (t) => (
                      <span className="tg" key={t}>
                        {t}
                      </span>
                    ),
                  )}
                </div>
                <div className="ev-note">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16v12H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                  <span>
                    <b>We'll reply personally.</b> Someone from the Bink team will reach out with dates, courts and next
                    steps.
                  </span>
                </div>
              </div>
              <EventForm />
            </div>
          </div>
        </section>

        {/* ===== FIND PLAYERS ===== */}
        <section className="view" id="players" aria-label="Find players" hidden={view !== "players"}>
          <div className="wrap">
            <p className="kicker">How it works</p>
            <h2>Find players at your level</h2>
            <div className="how">
              <div className="step">
                <div className="art" aria-hidden="true">
                  <span className="tg dark">3.5</span>
                  <span className="tg">Doubles</span>
                  <span className="tg">Social</span>
                  <span className="tg">Tue + Thu evenings</span>
                </div>
                <div className="txt">
                  <span className="n">STEP 1</span>
                  <h3>Tell us your game</h3>
                  <p>Your level, your style, and the nights you're free. Relaxed or competitive.</p>
                </div>
              </div>
              <div className="step">
                <div className="art" aria-hidden="true">
                  <span className="tg">Player match · 3.5</span>
                  <span className="tg">Tuesday drop-in</span>
                  <span className="tg ball">You're in</span>
                </div>
                <div className="txt">
                  <span className="n">STEP 2</span>
                  <h3>Match or join an event</h3>
                  <p>Meet players who fit, or grab a spot at a drop-in, clinic or mixer.</p>
                </div>
              </div>
              <div className="step">
                <div className="art" aria-hidden="true">
                  <span className="bubble">See you at 6?</span>
                  <span className="bubble me">I'll bring balls</span>
                </div>
                <div className="txt">
                  <span className="n">STEP 3</span>
                  <h3>Show up and play</h3>
                  <p>After the game, your AI coach asks how it went, so every match fits better.</p>
                </div>
              </div>
            </div>
            <p className="no" aria-label="No buried posts, no mismatched games, no waiting on the sidelines. Just pickleball.">
              <s>Buried posts</s>
              <s>Mismatched games</s>
              <s>Waiting on the sidelines</s>
              <b>Just pickleball.</b>
            </p>
            <div className="ctas" style={{ marginTop: "1.4rem" }}>
              <a className="btn" href="#join">
                Find people
              </a>
            </div>
          </div>
        </section>

        {/* ===== ABOUT US ===== */}
        <section className="view" id="about" aria-label="About us" hidden={view !== "about"}>
          <div className="wrap">
            <p className="kicker">About us</p>
            <h2>Made by Victoria players, for Victoria players</h2>
            <div className="voices">
              <figure>
                <Image src="/images/theo-young.jpg" alt="Theo Young" width={386} height={518} sizes="80px" />
                <div>
                  <blockquote>
                    "Bink made it effortless to find competition to improve my game, or a partner to complement it."
                  </blockquote>
                  <figcaption>Theo Young, semi-pro player</figcaption>
                </div>
              </figure>
              <figure>
                <Image src="/images/alex-and-johahn.jpg" alt="Alex and Johahn" width={900} height={675} sizes="80px" />
                <div>
                  <blockquote>
                    "I met Johahn using Bink. Since then we've become a dynamic duo that has won tournaments at the 4.5
                    level."
                  </blockquote>
                  <figcaption>Alex, with doubles partner Johahn</figcaption>
                </div>
              </figure>
            </div>
            <div className="promises">
              <div>
                <b>Fair games</b>
                <span>Matched by level, so every game is fun.</span>
              </div>
              <div>
                <b>People who show up</b>
                <span>Reviews after every game keep everyone honest.</span>
              </div>
              <div>
                <b>Safe to meet</b>
                <span>Chat first, play at public courts, report or block anyone.</span>
              </div>
            </div>
            <p className="faq-link">
              <a href="#faq">Questions? Read the FAQ</a>
            </p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="view" id="faq" aria-label="Questions" hidden={view !== "faq"}>
          <div className="wrap">
            <p className="kicker">FAQ</p>
            <h2>Questions? We've got you.</h2>
            <div className="qa">
              <div>
                <h3>Is Bink free?</h3>
                <p>Yes. Matching, chatting and the Bink Open are free for beta members.</p>
              </div>
              <div>
                <h3>What kind of events?</h3>
                <p>Drop-in nights, skills clinics, social mixers, Champion of the Court and tournaments, all sorted by level.</p>
              </div>
              <div>
                <h3>Can I come on my own?</h3>
                <p>Yes. Most people do. Events are built for meeting new players.</p>
              </div>
              <div>
                <h3>New, or unsure of my level?</h3>
                <p>Pick the level that feels closest. You can change it any time.</p>
              </div>
              <div>
                <h3>Can I find a coach?</h3>
                <p>Yes. Browse coaches near you, read reviews, and book lessons or a clinic.</p>
              </div>
              <div>
                <h3>Is it safe to meet people?</h3>
                <p>You choose who you play with and chat first. You can report or block anyone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== JOIN ===== */}
        <section className="view" id="join" aria-label="Join the beta" hidden={view !== "join"}>
          <div className="wrap">
            <h2>Come play with us.</h2>
            <p className="lead">
              Join Victoria's pickleball community. Beta members get first access to events and free entry to the Bink
              Open.
            </p>
            <JoinForm />
            <div className="join-tags" aria-hidden="true">
              <span className="tg">Free in beta</span>
              <span className="tg">All levels</span>
              <span className="tg">Come solo</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
