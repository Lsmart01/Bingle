/* eslint-disable react/no-unescaped-entities -- marketing copy keeps its straight quotes and apostrophes */
import type { Metadata } from "next";
import Image from "next/image";
import { preload } from "react-dom";
import { JoinForm } from "./_components/join-form";

export const metadata: Metadata = {
  title: "Bingle: Find pickleball players your level in Victoria",
};

export default function HomePage() {
  // The hero photo is a CSS background, so ask the browser to fetch it early.
  preload("/images/hero.jpg", { as: "image", fetchPriority: "high" });

  return (
    <>
      <header className="hero" style={{ padding: 0 }}>
        <div
          className="wrap"
          style={{
            display: "flex",
            gridTemplateColumns: "none",
            paddingTop: "1.1rem",
            paddingBottom: 0,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <a className="logo" href="#top">Bingle</a>
          <a href="#join" style={{ fontWeight: 600 }}>Join the beta</a>
        </div>
        <div className="wrap" id="top">
          <div>
            <h1>Play more pickleball with people at your level</h1>
            <p className="sub">Skip the buried posts and the mismatched games. Bingle matches you with Victoria players at your level, on the nights you're free. Want to level up? Find a coach too.</p>
            <a className="btn" href="#join">Join the Victoria Beta</a>
            <p className="note">Beta members play our first-ever tournament free, with cash prizes.</p>
          </div>
          <div className="mock" aria-label="Example Bingle player profile and match">
            <div className="pf">
              <Image src="/images/ben.jpg" alt="Ben" width={70} height={70} loading="eager" />
              <div>
                <div className="who"><span>Ben</span><span className="rt">3.5</span></div>
                <div className="meta">Victoria, 2 km away. 4.9 stars from 23 reviews.</div>
              </div>
            </div>
            <p className="bio">Started playing two summers ago and hasn't looked back. Loves a long dink rally and a good chat after the game. Looking for a steady doubles partner to cover the baseline.</p>
            <div className="stats">
              <div><b>42</b>games played</div>
              <div><b>61%</b>win rate</div>
              <div><b>98%</b>shows up</div>
            </div>
            <div className="tags">
              <span className="g">Strong: dinks</span>
              <span className="g">Strong: drops</span>
              <span className="b">Working on: backhand drive</span>
              <span>Doubles</span>
              <span>Tue and Thu evenings</span>
            </div>
            <div className="pop"><b>It's a match!</b>You both want doubles Thursday evening.</div>
            <div className="bubble">See you at 6?</div>
            <p className="fine">Sample profile and stats.</p>
          </div>
        </div>
      </header>

      <main>
        <section className="prob">
          <div className="wrap">
            <div className="rule" />
            <h2>Tired of asking "Anyone want to play?" and hearing nothing?</h2>
            <p>You post in a Facebook group. Your message gets buried. The evening slips away.</p>
            <p>Or you show up to open play and the games are full. When you do get in, the level is off. Nobody's really the level they say they are.</p>
            <ul className="symptoms">
              <li>You stand on the sidelines while your free night disappears.</li>
              <li>You drive across town, then wait for a court.</li>
              <li>You feel awkward asking strangers, "Can I join?"</li>
              <li>Your group needs a fourth, and nobody answers.</li>
            </ul>
            <p><b>You don't need more hassle. You just want to play.</b></p>
          </div>
        </section>

        <section className="sol">
          <div className="wrap two">
            <div>
              <h2>Meet Bingle: your shortcut to a game you'll love</h2>
              <p>Bingle is a Victoria-made app that finds local players who fit your level, your schedule, and your style. Want to improve faster? Find a coach on Bingle and get lessons. Coaches and players both have reviews, so you know who you're meeting.</p>
              <ol className="steps">
                <li>Tell us your level and when you're free.</li>
                <li>Browse nearby players, read their reviews, match, chat, and set the game. "See you at 6?"</li>
                <li>After you play, your built-in AI coach asks what went well and what didn't. Your answers sharpen your profile, so your next match fits even better.</li>
                <li>Want to level up? Find a coach and get lessons. Every coach has reviews.</li>
              </ol>
              <p>You do the playing. We do the hard part.</p>
            </div>
            <div className="ai" aria-label="Example of a Bingle AI match review">
              <div className="ai-h">
                <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" fill="#e6ef3d" />
                  <g fill="#07131c">
                    <circle cx="16" cy="8" r="2" />
                    <circle cx="9" cy="14" r="2" />
                    <circle cx="23" cy="14" r="2" />
                    <circle cx="16" cy="16" r="2" />
                    <circle cx="10" cy="22" r="2" />
                    <circle cx="22" cy="22" r="2" />
                  </g>
                </svg>
                <div><b>AI match review</b><small>Tuesday night, doubles</small></div>
                <span className="chip">Example</span>
              </div>
              <div className="grp">What went well</div>
              <div className="ck"><i aria-hidden="true">&#10003;</i>Dinks at the kitchen line</div>
              <div className="ck"><i aria-hidden="true">&#10003;</i>Third shot drops</div>
              <div className="ck"><i aria-hidden="true">&#10003;</i>Deep serves</div>
              <div className="grp">What to work on</div>
              <div className="ck bad"><i aria-hidden="true">&#10005;</i>Backhand drive when pulled wide</div>
              <div className="ck bad"><i aria-hidden="true">&#10005;</i>Resets under pressure</div>
              <div className="say">
                <p>Great session. Your dinks stayed low and patient all night, and your drops gave your partner time to get to the net.</p>
                <p>In game two, most of your lost points came from backhand drives that popped up when you were pulled wide. Try a soft reset to the middle there, and do 10 cross-court resets before your next game.</p>
              </div>
              <div className="upd">Profile updated. Bingle will now suggest partners who are steady on the backhand side.</div>
              <p className="fine">Example review with sample details, not a real player.</p>
            </div>
          </div>
        </section>

        <section className="ben">
          <div className="wrap">
            <h2>What you get when you play with Bingle</h2>
            <div className="three">
              <div><h3>Play with people at your level</h3><p>Set your rating and how you like to play, from relaxed to competitive. Bingle shows you players who fit, so every game feels fair and fun.</p></div>
              <div><h3>Find a partner who fits your game</h3><p>After each match, the AI coach asks what went well and what didn't. Your answers grow your profile, so you meet partners whose strengths cover your weak spots.</p></div>
              <div><h3>Get a game on the nights you're free</h3><p>Pick your open times, like Tuesday and Thursday evenings. Chat first and read reviews from other players. You choose who to match with, and you can report or block anyone.</p></div>
              <div><h3>Learn from coaches you can trust</h3><p>Find a coach near you and get lessons to sharpen your game. Coaches have reviews from real players, so you can pick with confidence.</p></div>
            </div>
          </div>
        </section>

        <section className="proof">
          <div className="wrap">
            <h2>Players like you are already finding their game</h2>
            <div className="quotes">
              <blockquote className="tcard">
                <Image src="/images/theo-young.jpg" alt="Theo Young hitting a forehand on a blue indoor pickleball court" width={386} height={518} sizes="(max-width: 760px) 100vw, 480px" />
                <p>"Bingle made it effortless to find competition to improve my game, or a partner to complement it. I would highly recommend this app to anyone in the pickleball community."</p>
                <cite>Theo Young, semi-pro player, Victoria, BC</cite>
              </blockquote>
              <blockquote className="tcard">
                <Image src="/images/alex-and-johahn.jpg" alt="Alex and Johahn smiling on an indoor pickleball court" width={900} height={675} sizes="(max-width: 760px) 100vw, 480px" />
                <p>"I met Johahn using Bingle. Since then we've become a dynamic duo that has won tournaments at the 4.5 level, thanks to Bingle's advanced analytics feature."</p>
                <cite>Alex, with doubles partner Johahn. Both are rated 4.5 on DUPR, and Johahn also coaches.</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="perk">
          <div className="wrap perkw">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#10202b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
              <path d="M20 10h24v14a12 12 0 0 1-24 0z" />
              <path d="M20 14H8c0 10 5 16 12 16M44 14h12c0 10-5 16-12 16" />
              <path d="M32 36v12M22 54h20" />
            </svg>
            <div>
              <h2>Join the beta and play our first tournament free</h2>
              <p>Every beta member gets free entry to Bingle's first-ever tournament. Cash prizes are on the line.</p>
            </div>
            <a className="btn dark" href="#join">Join the Victoria Beta</a>
          </div>
        </section>

        <section className="cta" id="join">
          <div className="wrap">
            <h2>Your next game is just one match away</h2>
            <p>Join the Victoria beta and get matched with players who fit your level and your schedule. Beta members also get free entry to our first-ever tournament, with cash prizes. Spots are limited while we grow city by city.</p>
            <JoinForm />
          </div>
        </section>

        <section className="faq">
          <div className="wrap">
            <h2>Questions? We've got you.</h2>
            <details><summary>Is Bingle free?</summary><p>Yes. Matching and chatting are free during the beta.</p></details>
            <details><summary>What is the tournament?</summary><p>Everyone who joins the beta gets free entry to Bingle's first-ever tournament, with cash prizes. We'll share the date and details with beta members.</p></details>
            <details><summary>Can I find a coach on Bingle?</summary><p>Yes. Browse coaches near you, read their reviews, and get lessons to improve your game. Players have reviews too.</p></details>
            <details><summary>What does the AI coach do?</summary><p>After each match, it asks what shots went well and what didn't. Your answers build your profile, so Bingle can suggest partners whose strengths cover your weak spots.</p></details>
            <details><summary>What if I'm new, or not sure of my level?</summary><p>Pick the level that feels closest. You can change it any time. Plenty of players here want a relaxed game.</p></details>
            <details><summary>Is it safe to meet new people?</summary><p>You pick who you match with and chat first. You can report or block anyone, and we suggest meeting at public courts.</p></details>
          </div>
        </section>
      </main>

      <footer><div className="wrap">Bingle. Made in Victoria, BC.</div></footer>
    </>
  );
}
