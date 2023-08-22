"use strict";
/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exists = void 0;
const CypherASTNode_1 = require("../../CypherASTNode");
const pad_block_1 = require("../../utils/pad-block");
function transformCypherQuery(cypherFragment) {
  // Remove the word "MATCH" and any preceding whitespace
  const strippedMatch = cypherFragment.replace(/^\s*MATCH\s+/i, "");

  // Extract the property conditions from the WHERE clause using regex
  const whereRegEx = /WHERE\s+\(?(.*?)\)?$/i;
  const whereMatch = strippedMatch.match(whereRegEx);

  if (!whereMatch) {
    throw new Error("No WHERE clause found.");
  }

  const conditions = whereMatch[1].split(/\s+AND\s+/i).map((condition) => {
    const [key, value] = condition.split(/\s*=\s*/);
    // Strip off any node prefix (like "this3.") from the key
    const strippedKey = key.split(".").pop();
    return { [strippedKey]: value };
  });

  // Create the properties string for the node
  const properties = conditions
    .map((cond) => {
      const key = Object.keys(cond)[0];
      return `${key}: ${cond[key]}`;
    })
    .join(", ");

  // Replace the WHERE clause with the properties string
  let transformed = strippedMatch
    .replace(whereRegEx, "")
    .replace(/:(\w+|`[^`]+`)\s*(?=\))/, `$&{ ${properties} }`);

  // Remove the variable name inside node parentheses
  // transformed = transformed.replace(/\(\w+/g, "(");
  transformed = transformed.replace(/\(\w+(:)/g, "($1");

  return transformed;
}

/**
 * @see [Cypher Documentation](https://neo4j.com/docs/cypher-manual/current/syntax/expressions/#existential-subqueries)
 * @group Other
 */
class Exists extends CypherASTNode_1.CypherASTNode {
  constructor(subQuery) {
    super();
    const rootQuery = subQuery.getRoot();
    this.addChildren(rootQuery);
    this.subQuery = rootQuery;
  }
  /**
   * @internal
   */
  getCypher(env) {
    const subQueryStr = this.subQuery.getCypher(env);
    const paddedSubQuery = (0, pad_block_1.padBlock)(subQueryStr);
    const transformedSubQuery = transformCypherQuery(paddedSubQuery);
    return `EXISTS (\n${transformedSubQuery}\n)`;
  }
}
exports.Exists = Exists;
