import React, { useContext, useEffect, useState } from "react";
import { Frame } from "src/components/widgets";
import SearchQasQuery from "./SearchQas.gql";
import { useLazyQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loader from "src/components/domains/ui/Loader";
import { deleteQas } from "src/data/client/fetches";
import { WidgetContext } from "../context/WidgetContext";

export default function ManageQas({ project }) {
  const { addWidget } = useContext(WidgetContext);

  let [status, setStatus] = useState();
  let [sourceName, setSourceName] = useState("");
  let [query, setQuery] = useState("");
  let [searchTerm, setSearchTerm] = useState("");
  let [qaSummaries, setQaSummaries] = useState([]);
  let [qas, setQas] = useState([]);

  const { id: projectId } = project;

  const [searchQasQuery, { loading }] = useLazyQuery(SearchQasQuery, {
    variables: { projectId, sourceName, query },
    onCompleted: async (data) => {
      const {
        projects: [
          {
            searchQas: { qaSummaries: fetchedQaSummaries, qas: fetchedQas },
          },
        ],
      } = data;

      setQas(fetchedQas);
      if (!sourceName) setQaSummaries(fetchedQaSummaries);
    },
  });

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setQuery(searchTerm);
  };

  const onSourceNameSelected = (e) => {
    e.preventDefault();
    setSourceName(e.target.value);
    searchQasQuery({
      variables: {
        sourceName: e.target.value,
      },
    });
  };

  const onDeleteQas = (e) => {
    e.preventDefault();
    setStatus("");
    deleteQas({
      project,
      sourceName,
      onSuccess: () => {
        setStatus("Qas successfully deleted");
        searchQasQuery();
      },
      onFailure: () => {},
    });
  };

  const onAddSource = (e) => {
    e.preventDefault();
    addWidget("new-qas-source", "NewQasSource", {
      title: "New Qas Source",
    });
  };

  useEffect(() => {
    searchQasQuery();
  }, [sourceName, query]);

  return (
    <Frame fullWidth>
      <div className="px-6 mt-4 mb-6 w-full">
        <h2 className="font-semibold text-lg">Knowledge Base</h2>
        {status && <div className="pb-4 text-green-500">{status}</div>}

        <form
          className="mt-4 mb-8 flex space-x-1 w-full"
          onSubmit={onSearchSubmit}
        >
          <div className="flex flex-col max-w-sm">
            <select
              name="source-name"
              onChange={onSourceNameSelected}
              value={sourceName}
            >
              <option value="">All Sources</option>
              {qaSummaries &&
                qaSummaries.map((qaSummary) => (
                  <option
                    key={qaSummary.sourceName}
                    value={qaSummary.sourceName}
                  >
                    {qaSummary.sourceName} ({qaSummary.count})
                  </option>
                ))}
            </select>
          </div>
          <div className="max-w-sm w-full">
            <input
              type="search"
              name="search-term"
              placeholder="Search Questions"
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="ml-4 !w-full"
              value={searchTerm}
            />
          </div>
          <div className="pl-4">
            <button
              type="submit"
              disabled={loading ? "disabled" : ""}
              className="btn ml-1"
            >
              {loading && <Loader className="text-white" />}
              {!loading && (
                <FontAwesomeIcon className="text-white" icon="search" />
              )}
            </button>
          </div>
        </form>

        <div className="flex">
          <div>
            <button className="btn-transparent border" onClick={onDeleteQas}>
              <FontAwesomeIcon className="mr-1 text-red-500" icon="trash" />
              Delete QAs from
              <span className="ml-1 rounded-full bg-cyan-600 px-2 py-1 text-white">
                {sourceName || "All sources"}
              </span>
            </button>
          </div>

          <div className="ml-8">
            <button className="btn-transparent border" onClick={onAddSource}>
              <FontAwesomeIcon className="mr-1" icon="plus" />
              Add new source
            </button>
          </div>
        </div>
        {loading && <Loader className="dark:text-white mt-8" />}
        {qas && qas.length > 0 && (
          <table className="w-full text-left table-auto mt-4">
            <thead>
              <tr>
                <th className="py-2 pr-4">Question</th>
                <th className="py-2 px-4">Answer</th>
                <th className="py-2 pr-4">Reference</th>
              </tr>
            </thead>
            <tbody>
              {qas.map((qa) => (
                <tr key={qa.id}>
                  <td className="py-2 px-4 border border-gray-500">
                    <code>{qa.question}</code>
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {qa.answer}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    <a href="#">{qa.sourceName}</a>
                    {qa.type === "web" && (
                      <a className="ml-2" href={qa.referenceUrl}>
                        <FontAwesomeIcon
                          className="mr-1"
                          icon="external-link"
                        />
                        {qa.referenceTitle}
                      </a>
                    )}

                    {qa.type === "conversations" && (
                      <a className="ml-2" href={qa.referenceUrl}>
                        <FontAwesomeIcon icon="external-link" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Frame>
  );
}
