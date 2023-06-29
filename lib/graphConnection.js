import { graph } from "lib/db";

export default class GraphConnection {
  constructor() {
    this.driver = graph;
    this.session = this.driver.session();
  }

  async run(query, params = {}) {
    var id = this.newQueryId();
    console.time(`Graph Query ${id}`);
    var result = await this.session.run(query, params);
    console.timeEnd(`Graph Query ${id}`);
    return result;
  }

  async runInNewSession(query, params = {}) {
    var id = this.newQueryId();
    var session = this.driver.session();
    console.time(`Graph Query ${id}`);
    var result = await session.run(query, params);
    session.close();
    console.timeEnd(`Graph Query ${id}`);
    return result;
  }

  newQueryId() {
    return Math.floor(Math.random() * 1000);
  }

  async close() {
    await this.session.close();
  }

  async closeDriver() {
    this.driver.close();
  }
}
