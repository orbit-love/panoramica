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
  setLoading,
}) => {
  setLoading && setLoading(true);
  return fetch(url, {
    method,
    headers,
    body,
  })
    .then((res) => res.json())
    .then(handleResult({ onSuccess, setLoading }));
};

const handleResult =
  ({ onSuccess, setLoading }) =>
  async ({ result, message }) => {
    if (message) {
      console.log(message);
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

export async function putProjectImport({ project, onSuccess, setLoading }) {
  makeRequest({
    url: `/api/projects/${project.id}/import`,
    method: "PUT",
    onSuccess,
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

export async function getSimilarConversations({
  project,
  activityId,
  setLoading,
  onSuccess,
}) {
  if (aiReady(project)) {
    makeRequest({
      url: `/api/projects/${project.id}/${activityId}/similar`,
      method: "GET",
      onSuccess,
      setLoading,
    });
  }
}
