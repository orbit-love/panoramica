import { makeRequest } from "src/data/client/fetches";

export async function getPrompts({ project, type, setLoading, onSuccess }) {
  makeRequest({
    url: `/api/projects/${project.id}/prompts${type ? `?type=${type}` : ""}`,
    onSuccess,
    setLoading,
  });
}

export async function putUpdatePrompts({
  project,
  prompts,
  setLoading,
  onSuccess,
}) {
  makeRequest({
    url: `/api/projects/${project.id}/prompts`,
    body: JSON.stringify({ prompts }),
    method: "PUT",
    onSuccess,
    setLoading,
  });
}
