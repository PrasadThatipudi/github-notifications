class GitHub {
  constructor() {
    this.token = null;
    this.apiBase = "https://api.github.com";
    this.lastEventTimestamp = Date.now();
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

    return await response.json();
  }

  filterRepoCreationEvents(events) {
    return events.filter(
      (event) =>
        event.type === "CreateEvent" &&
        event.payload.ref_type === "repository" &&
        new Date(event.created_at).getTime() > this.lastEventTimestamp
    );
  }

  updateLastEventTimestamp() {
    this.lastEventTimestamp = Date.now();
  }

  registerToken(token) {
    this.token = token;
  }
}

export default GitHub;
