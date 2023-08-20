import { aiReady, orbitImportReady } from "src/integrations/ready";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const makeRequest = ({
  url,
  method = "GET",
  body,
  onSuccess,
  onFailure,
  setLoading,
}) => {
  setLoading && setLoading(true);
  return fetch(url, {
    method,
    headers,
    body,
  })
    .then((res) => res.json())
    .then(handleResult({ onSuccess, onFailure, setLoading }));
};

const handleResult =
  ({ onSuccess, onFailure, setLoading }) =>
  async ({ result, message }) => {
    if (message) {
      console.log(message);
      onFailure && onFailure({ message });
    } else {
      await onSuccess({ result });
    }
    setLoading && setLoading(false);
  };

export async function getProject({ project, onSuccess, setLoading }) {
  makeRequest({ url: `/api/projects/${project.id}`, onSuccess, setLoading });
}

export async function getJWT({ onSuccess, setLoading }) {
  makeRequest({ url: `/api/user/jwt`, onSuccess, setLoading });
}

export async function putProjectImport({
  project,
  onSuccess,
  onFailure,
  setLoading,
}) {
  makeRequest({
    url: `/api/projects/${project.id}/import`,
    method: "PUT",
    onSuccess,
    onFailure,
    setLoading,
  });
}

export async function putProjectRefresh({ project, setLoading, onSuccess }) {
  if (orbitImportReady(project)) {
    makeRequest({
      url: `/api/projects/${project.id}/refresh`,
      method: "PUT",
      onSuccess,
      setLoading,
    });
  }
}

export async function postEmbeddings({ project, setLoading, onSuccess }) {
  if (aiReady(project)) {
    makeRequest({
      url: `/api/projects/${project.id}/embeddings/create`,
      method: "POST",
      onSuccess,
      setLoading,
    });
  }
}

export async function putDocumentation({
  project,
  body,
  setLoading,
  onSuccess,
}) {
  if (aiReady(project)) {
    makeRequest({
      url: `/api/projects/${project.id}/documentation/update`,
      method: "PUT",
      body,
      onSuccess,
      setLoading,
    });
  }
}

export async function deleteDocumentation({ project, setLoading, onSuccess }) {
  if (aiReady(project)) {
    makeRequest({
      url: `/api/projects/${project.id}/documentation/delete`,
      method: "DELETE",
      onSuccess,
      setLoading,
    });
  }
}

export async function postCreateActivitiesProperties({ project, body }) {
  const url = `/api/projects/${project.id}/activities/properties`;
  return fetch(url, {
    method: "POST",
    headers,
    body,
  });
}
