import neo4j from "neo4j-driver";

export default class GraphConnection {
  constructor() {
    this.uri = process.env.MEMGRAPH_URI;
    this.username = process.env.MEMGRAPH_USERNAME;
    this.password = process.env.MEMGRAPH_PASSWORD;

    this.driver = neo4j.driver(
      this.uri,
      neo4j.auth.basic(this.username, this.password)
    );
  }

  async run(query, params = {}) {
    this.session ||= this.driver.session();
    return await this.session.run(query, params);
  }

  async close() {
    if (this.session) {
      await this.session.close();
      await this.driver.close();
    }
  }
}
