import { makeRequest } from "src/data/client/fetches";

export async function getBookmarks({ project, setLoading, onSuccess }) {
  makeRequest({
    url: `/api/projects/${project.id}/bookmarks`,
    onSuccess,
    setLoading,
  });
}

export async function postCreateBookmark({
  project,
  activity,
  setLoading,
  onSuccess,
}) {
  makeRequest({
    url: `/api/projects/${project.id}/${activity.id}/bookmarks`,
    method: "POST",
    onSuccess,
    setLoading,
  });
}

export async function deleteBookmark({
  project,
  activity,
  setLoading,
  onSuccess,
}) {
  makeRequest({
    url: `/api/projects/${project.id}/${activity.id}/bookmarks`,
    method: "DELETE",
    onSuccess,
    setLoading,
  });
}
