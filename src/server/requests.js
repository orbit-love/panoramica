import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { checkApp, authorizeProject } from "src/auth";

export const processRequest = async ({ params }, callback) => {
  var project,
    user = await checkApp();
  if (user) {
    var { id } = params;
    project = await authorizeProject({ id, user, allowPublic: true });
    if (!project || user.fake) {
      return redirect("/");
    }
  }

  try {
    var result = await callback({ project, params, user });
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
