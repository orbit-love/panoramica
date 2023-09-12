import { redirect } from "next/navigation";
import { checkApp, authorizeProject } from "src/auth";
import { graph } from "src/data/db";
import { clearProject } from "src/data/graph/mutations";

export async function DELETE(request) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  const { id } = request.query;
  const session = graph.session();
  try {
    var project = await authorizeProject({ id, user });
    if (!project) {
      return NextResponse.json(
        {
          message: "You are not allowed to perform this action",
        },
        {
          status: 401,
        }
      );
    }

    await session.writeTransaction(async (tx) => {
      await clearProject({ project, tx });
    });

    return NextResponse.json({ result: { status: "cleared" } });
  } catch (err) {
    console.log("Could not clear project", err);
    console.log(err);
    return NextResponse.json(
      {
        message:
          "Sorry we couldn't process your request due to an unexpected error.",
      },
      {
        status: 500,
      }
    );
  } finally {
    session.close();
  }
}
