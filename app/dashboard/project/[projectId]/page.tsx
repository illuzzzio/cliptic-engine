"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  cancelShortClipRender,
  getProjectPlaybackUrl,
  getProjectStatus,
  getShortClipRenderStatus,
  startShortClipDownload,
} from "@/lib/actions/project.actions";
import { AlertCircle, CheckCircle2, Download, Loader2, Mic, Sparkles, UploadCloud } from "lucide-react";
import { RemotionShortPlayer } from "@/components/dashboard/RemotionShortPlayer";
import { ShortClipEditorDialog } from "@/components/dashboard/ShortClipEditorDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type ProjectStatus = Awaited<ReturnType<typeof getProjectStatus>>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not load project status";
}

function downloadUrl(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ProjectProcessingPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [editorPreviewUrl, setEditorPreviewUrl] = useState<string | null>(null);
  const [renderDialogOpen, setRenderDialogOpen] = useState(false);
  const [renderingShortId, setRenderingShortId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderMessage, setRenderMessage] = useState("Preparing render");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isCancelingRender, setIsCancelingRender] = useState(false);

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

  const syncShortRenderState = useCallback((shortId: string, status: string, progress: number, exportUrl: string | null) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        shorts: prev.shorts.map((short) =>
          short.id === shortId
            ? {
                ...short,
                renderStatus: status,
                renderProgress: progress,
                exportUrl,
              }
            : short
        ),
      };
    });
  }, []);

  const handleDownload = useCallback(
    async (shortId: string) => {
      setRenderingShortId(shortId);
      setRenderError(null);
      setRenderProgress(0);
      setRenderMessage("Checking export status");

      try {
        const result = await startShortClipDownload(shortId);
        syncShortRenderState(shortId, result.status, result.progress, result.exportUrl);

        if (result.exportUrl) {
          downloadUrl(result.exportUrl);
          setRenderingShortId(null);
          return;
        }

        setRenderProgress(result.progress);
        setRenderMessage(result.message);
        setRenderDialogOpen(true);
      } catch (err: unknown) {
        setRenderDialogOpen(true);
        setRenderError(getErrorMessage(err));
        setRenderMessage("Render could not start");
      }
    },
    [syncShortRenderState]
  );

  const handleCancelRender = useCallback(async () => {
    if (!renderingShortId) {
      setRenderDialogOpen(false);
      return;
    }

    const shortId = renderingShortId;
    setIsCancelingRender(true);
    setRenderMessage("Canceling render");
    setRenderDialogOpen(false);
    setRenderingShortId(null);
    setRenderError(null);
    setRenderProgress(0);
    syncShortRenderState(shortId, "canceled", 0, null);

    try {
      const result = await cancelShortClipRender(shortId);
      syncShortRenderState(shortId, result.status, result.progress, result.exportUrl);
    } catch (err: unknown) {
      setRenderDialogOpen(true);
      setRenderingShortId(shortId);
      setRenderError(getErrorMessage(err));
    } finally {
      setIsCancelingRender(false);
    }
  }, [renderingShortId, syncShortRenderState]);

  useEffect(() => {
    if (!renderDialogOpen || !renderingShortId || renderError) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const result = await getShortClipRenderStatus(renderingShortId);
        if (cancelled) return;

        setRenderProgress(result.progress);
        setRenderMessage(result.message);
        syncShortRenderState(renderingShortId, result.status, result.progress, result.exportUrl);

        if (result.status === "completed" && result.exportUrl) {
          downloadUrl(result.exportUrl);
          setRenderMessage("Render complete. Starting download...");
          window.setTimeout(() => {
            if (!cancelled) {
              setRenderDialogOpen(false);
              setRenderingShortId(null);
            }
          }, 1200);
        }

        if (result.status === "failed") {
          setRenderError("Rendering failed. Please try again.");
        }
      } catch (err: unknown) {
        if (!cancelled) setRenderError(getErrorMessage(err));
      }
    };

    poll();
    const interval = window.setInterval(poll, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [renderDialogOpen, renderingShortId, renderError, syncShortRenderState]);

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
  const hasClips = project.status === "completed" && project.shorts.length > 0;
  const selectedClip = project.shorts.find((clip) => clip.id === selectedClipId) ?? null;

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF]" />

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">{project.title || "Processing video"}</h1>
            <p className="text-[#6B6B6B]">
              {hasClips ? "Your short clips are ready to review." : "Please wait while your video moves through the transcription and caption pipeline."}
            </p>
          </div>
          {hasClips && (
            <span className="rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-4 py-2 text-sm font-bold text-[#00E5FF]">
              {project.shorts.length} clips ready
            </span>
          )}
        </div>

        {!hasClips && (
          <>
        <div className="my-10">
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
          </>
        )}

        {project.status === "completed" && project.transcript && !hasClips && (
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

        {hasClips && (
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {project.shorts.map((clip) => {
              return (
                <div key={clip.id} className="flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#0c0c0c] overflow-hidden hover:border-[#B026FF]/50 transition-colors">
                  <div className="p-0 flex-shrink-0">
                    <RemotionShortPlayer
                      clip={{
                        id: clip.id,
                        projectId: clip.projectId,
                        title: clip.title,
                        startTime: clip.startTime,
                        endTime: clip.endTime,
                        duration: clip.duration,
                        captions: clip.captions,
                        captionStyleKey: clip.captionStyleKey,
                        captionFontFamily: clip.captionFontFamily,
                        captionSize: clip.captionSize,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3 p-4 flex-grow">
                    <div>
                      <h3 className="text-lg font-black text-white line-clamp-2 mb-2">{clip.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full border border-[#B026FF]/40 bg-[#B026FF]/10 px-2.5 py-1 text-xs font-bold text-[#B026FF]">
                          30S CLIP
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-2.5 py-1 text-xs font-bold text-[#00E5FF]">
                          SEO {clip.seoScore}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#2a2a2a] pt-3">
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6B6B6B]">⚡ Cliptic Reasoning</h4>
                      <p className="text-xs leading-relaxed text-[#a0a0a0] line-clamp-4">{clip.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setSelectedClipId(clip.id);
                        try {
                          const url = await getProjectPlaybackUrl(clip.projectId);
                          setEditorPreviewUrl(url);
                        } catch {
                          setEditorPreviewUrl(null);
                        }
                        setIsEditorOpen(true);
                      }}
                      className="mt-auto w-full rounded-xl border border-[#B026FF]/60 bg-[#B026FF]/15 px-4 py-2 text-sm font-bold text-[#EAC8FF] transition hover:border-[#00E5FF]/70 hover:bg-[#00E5FF]/15 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(clip.id)}
                      disabled={renderingShortId === clip.id}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#00E5FF]/60 bg-[#00E5FF]/10 px-4 py-2 text-sm font-bold text-[#BDF7FF] transition hover:border-[#B026FF]/70 hover:bg-[#B026FF]/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {renderingShortId === clip.id ? <Loader2 className="animate-[spin_2s_linear_infinite]" size={15} /> : <Download size={15} />}
                      {clip.exportUrl && clip.renderStatus === "completed" ? "Download" : "Render & Download"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ShortClipEditorDialog
          key={selectedClipId ?? "no-clip-selected"}
          open={isEditorOpen}
          onOpenChange={(open) => {
            setIsEditorOpen(open);
            if (!open) {
              setEditorPreviewUrl(null);
            }
          }}
          clip={
            selectedClip
              ? {
                  id: selectedClip.id,
                  projectId: selectedClip.projectId,
                  title: selectedClip.title,
                  startTime: selectedClip.startTime,
                  endTime: selectedClip.endTime,
                  duration: selectedClip.duration,
                  captions: selectedClip.captions,
                  captionStyleKey: selectedClip.captionStyleKey,
                  captionFontFamily: selectedClip.captionFontFamily,
                  captionSize: selectedClip.captionSize,
                }
              : null
          }
          previewVideoUrl={editorPreviewUrl}
          onSaved={({ shortId, captionStyleKey, captionFontFamily, captionSize }) => {
            setProject((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                shorts: prev.shorts.map((short) =>
                  short.id === shortId
                    ? {
                        ...short,
                        captionStyleKey,
                        captionFontFamily,
                        captionSize,
                        exportUrl: null,
                        renderId: null,
                        renderStatus: "idle",
                        renderProgress: 0,
                      }
                    : short
                ),
              };
            });
          }}
        />

        <Dialog
          open={renderDialogOpen}
          onOpenChange={(open) => {
            if (!open && renderingShortId && renderProgress < 100 && !renderError) {
              void handleCancelRender();
              return;
            }

            setRenderDialogOpen(open);
            if (!open) {
              setRenderingShortId(null);
              setRenderError(null);
            }
          }}
        >
          <DialogContent className="border border-white/10 bg-[#0a0a0a] text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Rendering Short Clip</DialogTitle>
              <DialogDescription className="text-[#8a8a8a]">
                Remotion Lambda is exporting the edited clip. The download will start automatically when it is ready.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#777]">
                <span>{renderError ? "Render failed" : renderMessage}</span>
                <span className="text-[#00E5FF]">{Math.min(renderProgress, 100)}%</span>
              </div>
              <Progress value={Math.min(renderProgress, 100)} className="[&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:bg-[#1a1a1a] [&_[data-slot=progress-track]]:border [&_[data-slot=progress-track]]:border-white/10 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#7000FF] [&_[data-slot=progress-indicator]]:via-[#B026FF] [&_[data-slot=progress-indicator]]:to-[#00E5FF]" />
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#aaa]">
                {renderError ? renderError : "You can keep this dialog open while the render is queued, encoded, and saved back to this clip."}
              </div>
              {!renderError && (
                <button
                  type="button"
                  onClick={() => void handleCancelRender()}
                  disabled={isCancelingRender}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#ddd] transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancelingRender ? "Canceling..." : "Cancel Render"}
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
