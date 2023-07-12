const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function getProject({ project, onSuccess, setLoading }) {
  setLoading(true);
  fetch(`/api/projects/${project.id}`)
    .then((res) => res.json())
    .then(handleResult({ onSuccess, setLoading }));
}

export async function putProjectImport({ project, onSuccess, setLoading }) {
  setLoading(true);
  return fetch(`/api/projects/${project.id}/import`, {
    method: "PUT",
    headers,
  })
    .then((res) => res.json())
    .then(handleResult({ onSuccess, setLoading }));
}

export async function putProjectProcess({ project, onSuccess, setLoading }) {
  setLoading(true);
  return fetch(`/api/projects/${project.id}/process`, {
    method: "PUT",
    headers,
  })
    .then((res) => res.json())
    .then(handleResult({ onSuccess, setLoading }));
}

export async function putProjectRefresh({ project, setLoading, onSuccess }) {
  try {
    return fetch(`/api/projects/${project.id}/refresh`, {
      method: "PUT",
      headers,
    })
      .then((res) => res.json())
      .then(handleResult({ onSuccess, setLoading }));
  } catch (e) {
    // just catch and log exceptions for now, this happens when 2 refreshes
    // end up firing at the same time and causing a transaction collision;
    // real solution eventually needed
    console.log("Refresh transaction failed ", e);
  }
}

export async function postEmbeddings({ project, setLoading, onSuccess }) {
  setLoading(true);
  return fetch(`/api/projects/${project.id}/embeddings/create`, {
    method: "POST",
    headers,
  })
    .then((res) => res.json())
    .then(handleResult({ onSuccess, setLoading }));
}

var handleResult =
  ({ onSuccess, setLoading }) =>
  async ({ result, message }) => {
    if (message) {
      console.log(message);
    } else {
      await onSuccess({ result });
    }
    setLoading && setLoading(false);
  };
