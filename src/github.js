class GitHub {
  #token = null;
  #lastEventId = null;
  #apiBase = "https://api.github.com";

  constructor(token) {
    this.#token = token;
  }

  async fetchFollowers() {
    const response = await fetch(`${this.#apiBase}/user/followers`, {
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
    });

    return await response.json();
  }

  async fetchEventsOfUser(username) {
    const response = await fetch(`${this.#apiBase}/users/${username}/events`);

    if (response.status === 403) {
      const resetTime = response.headers.get("X-RateLimit-Reset");
      const currentTime = Math.floor(Date.now() / 1000);
      const waitTime = resetTime - currentTime;

      throw new Error(
        `Rate limit exceeded. Try again in ${waitTime} seconds.`,
        { cause: "wait-time" }
      );
    }

    return await response.json();
  }

  filterRepoCreationEvents(events) {
    return events.filter(
      (event) =>
        event.type === "CreateEvent" &&
        event.payload.ref_type === "repository" &&
        (!this.#lastEventId || event.id > this.#lastEventId)
    );
  }

  async retrieveNewReposOfUser(username) {
    const events = await this.fetchEventsOfUser(username);
    return this.filterRepoCreationEvents(events);
  }

  isTokenAvailable() {
    return this.#token !== null || this.#token !== undefined;
  }

  updateLastEventId(eventId) {
    this.#lastEventId = eventId;
  }
}

export default GitHub;
