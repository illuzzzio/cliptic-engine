"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectStatus } from "@/lib/actions/project.actions";
import { AlertCircle, Clock, Loader2, Mic, Play, Sparkles, CheckCircle2, UploadCloud } from "lucide-react";

type ProjectStatus = Awaited<ReturnType<typeof getProjectStatus>>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not load project status";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function ProjectProcessingPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const interval = setInterval(async () => {
      try {
        const data = await getProjectStatus(projectId);
        setProject(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    }, 2000);

    // Initial fetch
    getProjectStatus(projectId).then(setProject).catch((err: unknown) => setError(getErrorMessage(err)));

    return () => clearInterval(interval);
  }, [projectId]);

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-[spin_2s_linear_infinite] text-[#00E5FF]" /></div>;
  }

  const statusStep: Record<string, number> = {
    uploading: 1,
    queued: 1,
    transcribing: 2,
    generating_captions: 3,
    generating_shorts: 4,
    completed: 4,
    failed: 4,
  };
  const currentStep = statusStep[project.status] || 1;

  const steps = [
    { id: 1, title: "Starting Processing", icon: <UploadCloud size={20} />, description: "Your uploaded video is queued" },
    { id: 2, title: "Transcribing Audio", icon: <Mic size={20} />, description: "Deepgram is reading the complete video" },
    { id: 3, title: "Generating Captions", icon: <Sparkles size={20} />, description: "Building word-level caption data" },
    { id: 4, title: "Finding Shorts", icon: <CheckCircle2 size={20} />, description: "Gemini is selecting high-retention clips" },
  ];
  const hasNoSpeech = project.status === "completed" && project.transcript?.startsWith("No speech was detected");

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF]" />

        <h1 className="text-3xl font-black text-white mb-2">{project.title || "Processing video"}</h1>
        <p className="text-[#6B6B6B] mb-6">Please wait while your video moves through the transcription and caption pipeline.</p>

        <div className="mb-12">
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#6B6B6B]">
            <span>{project.status?.replace("_", " ") || "processing"}</span>
            <span className="text-[#00E5FF]">{project.progress || 0}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
            <div
              className="h-full bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF] transition-all duration-500"
              style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-8 relative">
          {/* Connecting line */}
          <div className="absolute left-[28px] top-[40px] bottom-[40px] w-0.5 bg-[#2a2a2a] z-0" />

          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isFailed = project.status === "failed" && step.id === currentStep;
            const isPast = (currentStep > step.id || project.status === "completed") && !isFailed;

            return (
              <div key={step.id} className="relative z-10 flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isPast
                    ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                    : isActive
                      ? "bg-[#1a1a1a] border-[#B026FF] text-[#B026FF] shadow-[0_0_20px_rgba(176,38,255,0.4)]"
                      : "bg-[#111111] border-[#2a2a2a] text-[#6B6B6B]"
                  }`}>
                  {isPast ? <CheckCircle2 size={24} /> : isFailed ? <AlertCircle size={24} /> : isActive ? <Loader2 className="animate-[spin_2s_linear_infinite]" size={24} /> : step.icon}
                </div>

                <div>
                  <h3 className={`text-xl font-bold transition-colors ${isActive || isPast ? "text-white" : "text-[#6B6B6B]"}`}>
                    {step.title}
                  </h3>
                  <p className="text-[#6B6B6B] text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {project.status === "completed" && project.transcript && (
          <div className="mt-12 p-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-inner">
            <h4 className="font-bold text-[#00E5FF] mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              {hasNoSpeech ? "Caption Status" : "Transcription Sample"}
            </h4>
            <p className="text-sm text-[#a0a0a0] leading-relaxed italic line-clamp-3 bg-black/50 p-4 rounded-xl">
              <span>&ldquo;{project.transcript}&rdquo;</span>
            </p>
            <button className="mt-6 px-6 py-3 bg-[#B026FF] hover:bg-[#7000FF] text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(176,38,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50" disabled={hasNoSpeech}>
              Enter Video Editor
            </button>
          </div>
        )}

        {project.status === "completed" && project.shorts.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Generated Clips</h2>
              <span className="rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1 text-sm font-bold text-[#00E5FF]">
                {project.shorts.length} clips
              </span>
            </div>

            <div className="grid gap-4">
              {project.shorts.map((clip) => {
                const captions = Array.isArray(clip.captions) ? clip.captions : [];
                const captionPreview = captions
                  .slice(0, 18)
                  .map((caption) => {
                    if (caption && typeof caption === "object" && "text" in caption) {
                      return String(caption.text);
                    }

                    return "";
                  })
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div key={clip.id} className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#00E5FF]">
                          <Play size={16} />
                          Clip {clip.orderIndex}
                        </div>
                        <h3 className="text-lg font-black text-white">{clip.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-black/40 px-3 py-1 text-sm font-bold text-[#a0a0a0]">
                          <Clock size={14} />
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </span>
                        <span className="rounded-full border border-[#B026FF]/30 bg-[#B026FF]/10 px-3 py-1 text-sm font-bold text-[#B026FF]">
                          SEO {clip.seoScore}/100
                        </span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-[#a0a0a0]">{clip.reason}</p>

                    {captionPreview && (
                      <p className="rounded-xl bg-black/50 p-4 text-sm leading-relaxed text-[#d0d0d0]">
                        {captionPreview}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {project.status === "failed" && (
          <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h4 className="mb-3 flex items-center gap-2 font-bold text-red-300">
              <AlertCircle size={16} /> Processing failed
            </h4>
            <p className="text-sm leading-relaxed text-red-200">
              {project.transcript || "The transcription job failed before it could return a result."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
