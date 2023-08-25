import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "src/auth";
import { searchProjectConversations } from "src/integrations/typesense";

export async function GET(request, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;
  var q = request.nextUrl.searchParams.get("q");

  try {
    var project = await authorizeProject({ id, user, allowPublic: true });
    if (!project) {
      return NextResponse.json(
        {
          message: "Could not perform search",
        },
        { status: 401 }
      );
    }

    const result = await searchProjectConversations({
      project,
      searchRequest: {
        q,
        query_by: "body,embedding",
        limit: 25,
      },
    });

    return NextResponse.json({
      result,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Could not perform search",
      },
      { status: 500 }
    );
  }
}
