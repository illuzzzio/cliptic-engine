"use server";

import { db } from "@/lib/db";
import { generatedShorts, projects } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
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

  const shorts = await db.select()
    .from(generatedShorts)
    .where(eq(generatedShorts.projectId, projectId))
    .orderBy(asc(generatedShorts.orderIndex));

  return {
    id: project.id,
    title: project.title,
    status: project.status,
    progress: parseInt(project.progress),
    videoUrl: project.videoUrl,
    transcript: project.transcript,
    captions: project.captions,
    shorts,
  };
}
