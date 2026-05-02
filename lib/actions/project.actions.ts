"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getProjectStatus(projectId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db.select().from(projects).where(eq(projects.id, projectId));
  
  if (!result.length) {
    throw new Error("Project not found");
  }

  const project = result[0];
  
  // Ensure user owns this project
  if (project.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  return {
    status: project.status,
    progress: parseInt(project.progress),
    videoUrl: project.videoUrl,
  };
}
