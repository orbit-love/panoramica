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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_auth_and_params_1 = require("./create-auth-and-params");
const create_connection_where_and_params_1 = __importDefault(require("./where/create-connection-where-and-params"));
const constants_1 = require("../constants");
const create_event_meta_1 = require("./subscriptions/create-event-meta");
const create_connection_event_meta_1 = require("./subscriptions/create-connection-event-meta");
const filter_meta_variable_1 = require("./subscriptions/filter-meta-variable");
const cypher_builder_1 = __importDefault(require("@neo4j/cypher-builder"));
const case_where_1 = require("../utils/case-where");
const create_authorization_before_and_params_1 = require("./authorization/compatibility/create-authorization-before-and-params");
const check_authentication_1 = require("./authorization/check-authentication");
function createDeleteAndParams({ deleteInput, varName, node, parentVar, chainStr, withVars, context, parameterPrefix, recursing, }) {
    (0, check_authentication_1.checkAuthentication)({ context, node, targetOperations: ["DELETE"] });
    function reducer(res, [key, value]) {
        (0, check_authentication_1.checkAuthentication)({ context, node, targetOperations: ["DELETE"], field: key });
        const relationField = node.relationFields.find((x) => key === x.fieldName);
        if (relationField) {
            const refNodes = [];
            const relationship = context.relationships.find((x) => x.properties === relationField.properties);
            if (relationField.union) {
                Object.keys(value).forEach((unionTypeName) => {
                    refNodes.push(context.nodes.find((x) => x.name === unionTypeName));
                });
            }
            else if (relationField.interface) {
                relationField.interface.implementations?.forEach((implementationName) => {
                    refNodes.push(context.nodes.find((x) => x.name === implementationName));
                });
            }
            else {
                refNodes.push(context.nodes.find((x) => x.name === relationField.typeMeta.name));
            }
            const inStr = relationField.direction === "IN" ? "<-" : "-";
            const outStr = relationField.direction === "OUT" ? "->" : "-";
            refNodes.forEach((refNode) => {
                (0, check_authentication_1.checkAuthentication)({ context, node: refNode, targetOperations: ["DELETE"] });
                const v = relationField.union ? value[refNode.name] : value;
                const deletes = relationField.typeMeta.array ? v : [v];
                deletes.forEach((d, index) => {
                    const variableName = chainStr
                        ? `${varName}${index}`
                        : `${varName}_${key}${relationField.union || relationField.interface ? `_${refNode.name}` : ""}${index}`;
                    const relationshipVariable = `${variableName}_relationship`;
                    const relTypeStr = `[${relationshipVariable}:${relationField.type}]`;
                    const withRelationshipStr = context.subscriptionsEnabled ? `, ${relationshipVariable}` : "";
                    if (withVars) {
                        res.strs.push(`WITH ${withVars.join(", ")}`);
                    }
                    const labels = refNode.getLabelString(context);
                    res.strs.push(`OPTIONAL MATCH (${parentVar})${inStr}${relTypeStr}${outStr}(${variableName}${labels})`);
                    const whereStrs = [];
                    let aggregationWhere = false;
                    if (d.where) {
                        try {
                            const { cypher: whereCypher, subquery: preComputedSubqueries, params: whereParams, } = (0, create_connection_where_and_params_1.default)({
                                nodeVariable: variableName,
                                whereInput: d.where,
                                node: refNode,
                                context,
                                relationshipVariable,
                                relationship,
                                parameterPrefix: `${parameterPrefix}${!recursing ? `.${key}` : ""}${relationField.union ? `.${refNode.name}` : ""}${relationField.typeMeta.array ? `[${index}]` : ""}.where`,
                            });
                            if (whereCypher) {
                                whereStrs.push(whereCypher);
                                res.params = { ...res.params, ...whereParams };
                                if (preComputedSubqueries) {
                                    res.strs.push(preComputedSubqueries);
                                    aggregationWhere = true;
                                }
                            }
                        }
                        catch {
                            return;
                        }
                    }
                    const authorizationAndParams = (0, create_authorization_before_and_params_1.createAuthorizationBeforeAndParams)({
                        context,
                        nodes: [
                            {
                                variable: variableName,
                                node: refNode,
                            },
                        ],
                        operations: ["DELETE"],
                    });
                    if (authorizationAndParams) {
                        const { cypher, params, subqueries } = authorizationAndParams;
                        whereStrs.push(cypher);
                        res.params = { ...res.params, ...params };
                        if (subqueries) {
                            res.strs.push(subqueries);
                        }
                    }
                    else {
                        // TODO: Authorization - delete for 4.0.0
                        const { cypher: authWhereCypher, params: authWhereParams } = (0, create_auth_and_params_1.createAuthAndParams)({
                            operations: "DELETE",
                            entity: refNode,
                            context,
                            where: { varName: variableName, node: refNode },
                        });
                        if (authWhereCypher) {
                            whereStrs.push(authWhereCypher);
                            res.params = { ...res.params, ...authWhereParams };
                        }
                    }
                    if (whereStrs.length) {
                        const predicate = `${whereStrs.join(" AND ")}`;
                        if (aggregationWhere) {
                            const columns = [
                                new cypher_builder_1.default.NamedVariable(relationshipVariable),
                                new cypher_builder_1.default.NamedVariable(variableName),
                            ];
                            const caseWhereClause = (0, case_where_1.caseWhere)(new cypher_builder_1.default.RawCypher(predicate), columns);
                            const { cypher } = caseWhereClause.build("aggregateWhereFilter");
                            res.strs.push(cypher);
                        }
                        else {
                            res.strs.push(`WHERE ${predicate}`);
                        }
                    }
                    // TODO: Authorization - delete for 4.0.0
                    if (!authorizationAndParams) {
                        const { cypher: authAllowCypher, params: authAllowParams } = (0, create_auth_and_params_1.createAuthAndParams)({
                            entity: refNode,
                            operations: "DELETE",
                            context,
                            allow: { node: refNode, varName: variableName },
                        });
                        if (authAllowCypher) {
                            res.strs.push(`WITH ${[...withVars, variableName].join(", ")}${withRelationshipStr}`);
                            res.strs.push(`CALL apoc.util.validate(NOT (${authAllowCypher}), "${constants_1.AUTH_FORBIDDEN_ERROR}", [0])`);
                            res.params = { ...res.params, ...authAllowParams };
                        }
                    }
                    if (d.delete) {
                        const nestedDeleteInput = Object.entries(d.delete)
                            .filter(([k]) => {
                            if (k === "_on") {
                                return false;
                            }
                            if (relationField.interface && d.delete?._on?.[refNode.name]) {
                                const onArray = Array.isArray(d.delete._on[refNode.name])
                                    ? d.delete._on[refNode.name]
                                    : [d.delete._on[refNode.name]];
                                if (onArray.some((onKey) => Object.prototype.hasOwnProperty.call(onKey, k))) {
                                    return false;
                                }
                            }
                            return true;
                        })
                            .reduce((d1, [k1, v1]) => ({ ...d1, [k1]: v1 }), {});
                        const innerWithVars = context.subscriptionsEnabled
                            ? [...withVars, variableName, relationshipVariable]
                            : [...withVars, variableName];
                        const deleteAndParams = createDeleteAndParams({
                            context,
                            node: refNode,
                            deleteInput: nestedDeleteInput,
                            varName: variableName,
                            withVars: innerWithVars,
                            parentVar: variableName,
                            parameterPrefix: `${parameterPrefix}${!recursing ? `.${key}` : ""}${relationField.union ? `.${refNode.name}` : ""}${relationField.typeMeta.array ? `[${index}]` : ""}.delete`,
                            recursing: false,
                        });
                        res.strs.push(deleteAndParams[0]);
                        res.params = { ...res.params, ...deleteAndParams[1] };
                        if (relationField.interface && d.delete?._on?.[refNode.name]) {
                            const onDeletes = Array.isArray(d.delete._on[refNode.name])
                                ? d.delete._on[refNode.name]
                                : [d.delete._on[refNode.name]];
                            onDeletes.forEach((onDelete, onDeleteIndex) => {
                                const onDeleteAndParams = createDeleteAndParams({
                                    context,
                                    node: refNode,
                                    deleteInput: onDelete,
                                    varName: variableName,
                                    withVars: innerWithVars,
                                    parentVar: variableName,
                                    parameterPrefix: `${parameterPrefix}${!recursing ? `.${key}` : ""}${relationField.union ? `.${refNode.name}` : ""}${relationField.typeMeta.array ? `[${index}]` : ""}.delete._on.${refNode.name}[${onDeleteIndex}]`,
                                    recursing: false,
                                });
                                res.strs.push(onDeleteAndParams[0]);
                                res.params = { ...res.params, ...onDeleteAndParams[1] };
                            });
                        }
                    }
                    const nodeToDelete = `${variableName}_to_delete`;
                    res.strs.push(`WITH ${[...withVars, `collect(DISTINCT ${variableName}) AS ${nodeToDelete}`].join(", ")}${withRelationshipStr}`);
                    /**
                     * This ORDER BY is required to prevent hitting the "Node with id 2 has been deleted in this transaction"
                     * bug. TODO - remove once the bug has bee fixed.
                     */
                    if (aggregationWhere)
                        res.strs.push(`ORDER BY ${nodeToDelete} DESC`);
                    if (context.subscriptionsEnabled) {
                        const metaObjectStr = (0, create_event_meta_1.createEventMetaObject)({
                            event: "delete",
                            nodeVariable: "n",
                            typename: refNode.name,
                        });
                        const [fromVariable, toVariable] = relationField.direction === "IN" ? ["n", parentVar] : [parentVar, "n"];
                        const [fromTypename, toTypename] = relationField.direction === "IN" ? [refNode.name, node.name] : [node.name, refNode.name];
                        const eventWithMetaStr = (0, create_connection_event_meta_1.createConnectionEventMetaObject)({
                            event: "delete_relationship",
                            relVariable: relationshipVariable,
                            fromVariable,
                            toVariable,
                            typename: relationField.type,
                            fromTypename,
                            toTypename,
                        });
                        const reduceStr = `REDUCE(m=${constants_1.META_CYPHER_VARIABLE}, n IN ${nodeToDelete} | m + ${metaObjectStr} + ${eventWithMetaStr}) AS ${constants_1.META_CYPHER_VARIABLE}`;
                        res.strs.push(`WITH ${[...(0, filter_meta_variable_1.filterMetaVariable)(withVars), nodeToDelete].join(", ")}, ${reduceStr}`);
                    }
                    res.strs.push("CALL {");
                    res.strs.push(`\tWITH ${variableName}_to_delete`);
                    res.strs.push(`\tUNWIND ${variableName}_to_delete AS x`);
                    res.strs.push(`  DETACH DELETE x`);
                    res.strs.push("\tRETURN count(*) AS _"); // Avoids CANNOT END WITH DETACH DELETE ERROR
                    res.strs.push("}");
                    // TODO - relationship validation
                    if (context.subscriptionsEnabled) {
                        // Fixes https://github.com/neo4j/graphql/issues/440
                        res.strs.push(`WITH ${(0, filter_meta_variable_1.filterMetaVariable)(withVars).join(", ")}, collect(distinct meta) AS update_meta`);
                        res.strs.push(`WITH ${(0, filter_meta_variable_1.filterMetaVariable)(withVars).join(", ")}, REDUCE(m=[], n IN update_meta | m + n) AS meta`);
                    }
                });
            });
            return res;
        }
        return res;
    }
    const { strs, params } = Object.entries(deleteInput).reduce(reducer, { strs: [], params: {} });
    return [strs.join("\n"), params];
}
exports.default = createDeleteAndParams;
//# sourceMappingURL=create-delete-and-params.js.map