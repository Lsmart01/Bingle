"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "./contact";

// Beta sign-up. Until Bink has a backend, it opens an email to the team
// with the player's address filled in.
export function JoinForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    const subject = encodeURIComponent("Bink beta spot");
    const body = encodeURIComponent(`Please add me to the Victoria beta. My email: ${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setOpened(true);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className="sr" htmlFor="em">
          Email
        </label>
        <input id="em" name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
        <button className="btn" type="submit">
          Find people
        </button>
      </form>
      {opened && (
        <p className="thanks" role="status">
          Your email app should open with this filled in. If it doesn&apos;t, email us at {CONTACT_EMAIL}.
        </p>
      )}
    </>
  );
}
