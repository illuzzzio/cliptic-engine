"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectStatus } from "@/lib/actions/project.actions";
import { Loader2, Mic, Sparkles, Scissors, CheckCircle2 } from "lucide-react";

export default function ProjectProcessingPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<any>(null);
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
      } catch (err: any) {
        setError(err.message);
      }
    }, 2000);

    // Initial fetch
    getProjectStatus(projectId).then(setProject).catch(e => setError(e.message));

    return () => clearInterval(interval);
  }, [projectId]);

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>;
  }

  // Determine active step based on status
  // Our Inngest function goes: "transcribing" (deepgram) -> "completed"
  // We simulate the other steps for the beautiful UI
  let currentStep = 1;
  if (project.status === "transcribing") currentStep = 1;
  if (project.status === "completed") currentStep = 4;

  const steps = [
    { id: 1, title: "Transcribing Audio", icon: <Mic size={20} />, description: "Using Deepgram Nova-2" },
    { id: 2, title: "Generating Captions", icon: <Sparkles size={20} />, description: "Word-level timestamps" },
    { id: 3, title: "Finding Viral Hooks", icon: <Scissors size={20} />, description: "AI clip selection" },
    { id: 4, title: "Ready for Export", icon: <CheckCircle2 size={20} />, description: "Processing complete" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF]" />

        <h1 className="text-3xl font-black text-white mb-2">{project.title}</h1>
        <p className="text-[#6B6B6B] mb-12">Please wait while our AI engine processes your video.</p>

        <div className="space-y-8 relative">
          {/* Connecting line */}
          <div className="absolute left-[28px] top-[40px] bottom-[40px] w-0.5 bg-[#2a2a2a] z-0" />

          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id || project.status === "completed";

            return (
              <div key={step.id} className="relative z-10 flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isPast
                    ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                    : isActive
                      ? "bg-[#1a1a1a] border-[#B026FF] text-[#B026FF] shadow-[0_0_20px_rgba(176,38,255,0.4)]"
                      : "bg-[#111111] border-[#2a2a2a] text-[#6B6B6B]"
                  }`}>
                  {isPast ? <CheckCircle2 size={24} /> : isActive ? <Loader2 className="animate-[spin_2s_linear_infinite]" size={24} /> : step.icon}
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
            <h4 className="font-bold text-[#00E5FF] mb-3 flex items-center gap-2"><Sparkles size={16} /> Transcription Sample</h4>
            <p className="text-sm text-[#a0a0a0] leading-relaxed italic line-clamp-3 bg-black/50 p-4 rounded-xl">
              "{project.transcript}"
            </p>
            <button className="mt-6 px-6 py-3 bg-[#B026FF] hover:bg-[#7000FF] text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(176,38,255,0.3)]">
              Enter Video Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
