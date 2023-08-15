import { graph } from "src/data/db";

export default class Connection {
  constructor() {
    this.driver = graph;
  }

  // don't share sessions to avoid transaction issues
  async run(query, params = {}) {
    // var id = this.newQueryId();
    var session = this.driver.session();
    // console.time(`Graph Query ${id}`);
    var result = await session.run(query, params);
    await session.close();
    // console.timeEnd(`Graph Query ${id}`);
    return result;
  }

  newQueryId() {
    return Math.floor(Math.random() * 1000);
  }

  async close() {}

  async closeDriver() {
    this.driver.close();
  }
}
