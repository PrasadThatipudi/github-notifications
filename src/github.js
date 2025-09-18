class GitHub {
  constructor() {
    this.token = null;
    this.apiBase = "https://api.github.com";
    this.lastEventId = null;
    this.lastEventTimestamp = null;
  }

  async fetchFollowers() {
    const response = await fetch(`${this.apiBase}/user/followers`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return await response.json();
  }

  async fetchEventsOfUser(username) {
    const response = await fetch(`${this.apiBase}/users/${username}/events`);

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
        (!this.lastEventId || event.id > this.lastEventId)
    );
  }

  async retrieveNewReposOfUser(username) {
    const events = await this.fetchEventsOfUser(username);
    return this.filterRepoCreationEvents(events);
  }

  updateLastEventId(eventId) {
    this.lastEventId = eventId;
  }

  registerToken(token) {
    this.token = token;
  }
}

export default GitHub;
