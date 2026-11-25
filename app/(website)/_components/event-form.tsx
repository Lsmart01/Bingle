"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "./contact";

// Event enquiry. Until Bink has a backend, it opens an email to the team
// with everything the visitor filled in, so the team can get back to them.
export function EventForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const subject = encodeURIComponent(`Event enquiry: ${field("interest")}`);
    const body = encodeURIComponent(
      [
        `Name: ${field("name")}`,
        `Email: ${field("email")}`,
        `Phone: ${field("phone") || "not given"}`,
        `Level: ${field("level")}`,
        `Interested in: ${field("interest")}`,
        "",
        field("message"),
      ].join("\n"),
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setOpened(true);
  }

  return (
    <form className="enquiry" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="ev-name">Name</label>
        <input id="ev-name" name="name" type="text" autoComplete="name" required placeholder="Your name" />
      </div>
      <div className="field">
        <label htmlFor="ev-email">Email</label>
        <input id="ev-email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
      </div>
      <div className="field">
        <label htmlFor="ev-phone">
          Phone <span>(optional)</span>
        </label>
        <input id="ev-phone" name="phone" type="tel" autoComplete="tel" placeholder="250 555 0123" />
      </div>
      <div className="field">
        <label htmlFor="ev-level">Your level</label>
        <select id="ev-level" name="level" defaultValue="3.0 to 3.5">
          <option>New to pickleball</option>
          <option>2.5 to 3.0</option>
          <option>3.0 to 3.5</option>
          <option>3.5 to 4.0</option>
          <option>4.0 and up</option>
          <option>Not sure</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="ev-type">I&apos;m interested in</label>
        <select id="ev-type" name="interest">
          <option>Drop-in nights</option>
          <option>Skills clinics</option>
          <option>Social mixers</option>
          <option>Champion of the Court</option>
          <option>The Bink Open (tournament)</option>
          <option>A private or team event</option>
          <option>Hosting an event with Bink</option>
          <option>Something else</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="ev-msg">
          Anything else? <span>(optional)</span>
        </label>
        <textarea id="ev-msg" name="message" placeholder="Days that suit you, group size, questions..." />
      </div>
      <div className="full send">
        <small>We only use this to get back to you.</small>
        <button className="btn solid" type="submit">
          Get in touch
        </button>
      </div>
      {opened && (
        <p className="sent" role="status">
          Your email app should open with your enquiry filled in. If it doesn&apos;t, email us at {CONTACT_EMAIL}.
        </p>
      )}
    </form>
  );
}
