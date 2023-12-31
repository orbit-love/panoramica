import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function List({ projects, projectUrl }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col items-baseline space-y-2">
      <div className="flex items-baseline space-x-2">
        <div className="text-lg font-bold">Choose a Project</div>
      </div>
      {projects.length === 0 && <div>None</div>}
      {projects.map((project) => (
        <div className="flex space-x-2 w-full" key={project.id}>
          <Link
            prefetch={false}
            className="underline"
            href={projectUrl(project)}
          >
            <span>{project.name}</span>
          </Link>
          <div className="grow" />
          {user.admin && (
            <div className="flex space-x-4">
              <span>{`${project.prismaUser.email}`}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
