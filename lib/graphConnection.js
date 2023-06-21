import { graph } from "lib/db";

export default class GraphConnection {
  constructor() {
    this.driver = graph;
    this.session = this.driver.session();
  }

  async run(query, params = {}) {
    console.time("Graph Query Timer");
    var result = await this.session.run(query, params);
    console.timeEnd("Graph Query Timer");
    return result;
  }

  async runInNewSession(query, params = {}) {
    var session = this.driver.session();
    console.time("Graph Query Timer");
    var result = await session.run(query, params);
    session.close();
    console.timeEnd("Graph Query Timer");
    return result;
  }

  async close() {
    await this.session.close();
  }

  async closeDriver() {
    this.driver.close();
  }
}
