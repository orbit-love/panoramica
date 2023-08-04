import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { checkApp, authorizeProject } from "src/auth";

export const processPublicRequest = async ({ body, params }, callback) => {
  return processRequest({ body, params }, callback, true);
};

export const processRestrictedRequest = async ({ body, params }, callback) => {
  return processRequest({ body, params }, callback, false);
};

const processRequest = async ({ body, params }, callback, allowPublic) => {
  var user = await checkApp();
  var project = await getProject({ user, params, allowPublic });
  if (!project) {
    return redirect("/");
  }

  try {
    var result = await callback({ project, body, params, user });
    return NextResponse.json({ result });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Update failed" },
      {
        status: 500,
      }
    );
  }
};

const getProject = async ({ user, params, allowPublic }) => {
  if (user) {
    var { id } = params;
    return await authorizeProject({ id, user, allowPublic });
  }
};
