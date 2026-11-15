"use client";

import type { FormEvent } from "react";

// Beta sign-up. Until Bingle has a backend, it opens an email to the team
// with the player's address filled in.
export function JoinForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    const subject = encodeURIComponent("Bingle beta spot");
    const body = encodeURIComponent(`Please add me to the Victoria beta. My email: ${email}`);
    window.location.href = `mailto:hello@bingle.app?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="em" style={{ position: "absolute", left: "-9999px" }}>
        Email
      </label>
      <input id="em" name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
      <button className="btn" type="submit">
        Join the Victoria Beta
      </button>
    </form>
  );
}
