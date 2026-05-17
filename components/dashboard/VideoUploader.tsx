"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileVideo, X, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Dashboard3D } from "./Dashboard3D";
import { useRouter } from "next/navigation";

const MIN_VIDEO_DURATION_SECONDS = 60;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to start processing";
}

async function readApiResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as { error?: string; details?: string; message?: string };
  } catch {
    return { details: text };
  }
}

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "selected" | "uploading" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [projectIdState, setProjectIdState] = useState<string | null>(null);
  const [s3KeyState, setS3KeyState] = useState<string | null>(null);
  const [isStartingProcess, setIsStartingProcess] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const router = useRouter();

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStatus("selected");
      setDurationError(null);
      setVideoDuration(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const reset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus("idle");
    setProgress(0);
    setProjectIdState(null);
    setS3KeyState(null);
    setProcessError(null);
    setIsStartingProcess(false);
    setDurationError(null);
    setVideoDuration(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRealUpload = async () => {
    if (!file || durationError) return;
    setStatus("uploading");
    setProgress(0);

    try {
      // 1. Get Secure Upload URL from Server
      const urlRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const urlData = await urlRes.json();
      
      if (!urlRes.ok) throw new Error(urlData.details || "Failed to get upload URL");
      
      const { uploadUrl, projectId, s3Key } = urlData;

      // 2. Secure Upload to Cliptic Cloud
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Uploading is 0-90% of the UI
          const percent = Math.round((event.loaded / event.total) * 90);
          setProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setProgress(100);
          setProjectIdState(projectId);
          setS3KeyState(s3Key);
          setProcessError(null);
          setStatus("success");
        } else {
          console.error("S3 Upload failed with status:", xhr.status, xhr.responseText);
          setStatus("idle");
        }
      };

      xhr.onerror = () => {
        console.error("Network error occurred during upload.");
        setStatus("idle");
      };

      xhr.onabort = () => {
        console.log("Upload cancelled by user.");
        setStatus("idle");
        setProgress(0);
      };

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (err: unknown) {
      console.error("Upload initiation failed:", err);
      setStatus("idle");
    }
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full relative mt-8">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        accept="video/*" 
        className="hidden" 
      />

      {status === "idle" && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#2a2a2a] border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden group cursor-pointer transition-colors hover:border-[#B026FF]/50 hover:bg-[#1a1a1a]/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Dashboard3D />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay z-0" />
          
          <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(176,38,255,0.2)] group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#B026FF] to-[#00E5FF] opacity-20 blur-xl" />
            <UploadCloud size={40} className="text-[#00E5FF] relative z-10" />
          </div>
          
          <h3 className="text-3xl font-black text-[#F8F8F8] mb-4 relative z-10 drop-shadow-lg">Upload Long Video</h3>
          <p className="text-[#a0a0a0] max-w-lg mx-auto mb-10 relative z-10 text-base leading-relaxed drop-shadow-md font-medium">
            Drag and drop your podcast, stream, or interview here, or click to browse. We support MP4, MOV, and AVI up to 4 hours.
          </p>
          
          <button className="relative z-10 flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm transition-all duration-300 bg-black/50 backdrop-blur-md border border-[#B026FF]/50 text-[#00E5FF] shadow-[0_0_20px_rgba(176,38,255,0.2)] hover:bg-[#B026FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] focus:outline-none hover:-translate-y-1">
            Select Video File
          </button>
        </div>
      )}

      {(status === "selected" || status === "uploading" || status === "success") && file && previewUrl && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF]" />
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Preview */}
            <div className="w-full lg:w-2/3 bg-black rounded-2xl overflow-hidden border border-[#2a2a2a] relative group aspect-video">
              <video 
                src={previewUrl} 
                controls={status === "selected"} 
                onLoadedMetadata={(event) => {
                  const duration = event.currentTarget.duration;
                  setVideoDuration(duration);
                  setDurationError(
                    duration < MIN_VIDEO_DURATION_SECONDS
                      ? "Please upload a video that is at least 1 minute long."
                      : null
                  );
                }}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
              
              {/* Overlay during upload/success */}
              {(status === "uploading" || status === "success") && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-500">
                  {status === "uploading" && (
                    <div className="w-24 h-24 rounded-full border-4 border-t-[#00E5FF] border-r-[#B026FF] border-b-transparent border-l-transparent animate-[spin_4s_linear_infinite]" />
                  )}
                  {status === "success" && (
                    <div className="w-24 h-24 rounded-full bg-[#00E5FF]/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all duration-1000 scale-100 animate-pulse">
                      <CheckCircle2 size={48} className="text-[#00E5FF]" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Right Panel based on Status */}
            <div className="w-full lg:w-1/3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#B026FF]/10 border border-[#B026FF]/20 text-[#B026FF]">
                      <FileVideo size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white truncate max-w-[200px]" title={file.name}>{file.name}</h4>
                      <p className="text-sm text-[#6B6B6B]">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {status === "selected" && (
                    <button onClick={reset} className="p-2 rounded-lg text-[#6B6B6B] hover:text-white hover:bg-[#1a1a1a] transition-colors" title="Remove file">
                      <X size={20} />
                    </button>
                  )}
                </div>

                {/* State: SELECTED */}
                {status === "selected" && (
                  <div className="space-y-4 mb-8">
                    <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[#6B6B6B]">Format</span>
                        <span className="font-bold text-white">Secure Cliptic Upload</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Max Size</span>
                        <span className="font-bold text-[#00E5FF]">Unlimited (2GB+)</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Minimum Length</span>
                        <span className="font-bold text-[#00E5FF]">1 minute</span>
                      </div>
                    </div>
                    {durationError && (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {durationError}
                      </p>
                    )}
                    {!durationError && videoDuration !== null && (
                      <p className="rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-3 text-sm text-[#00E5FF]">
                        Video length looks good.
                      </p>
                    )}
                  </div>
                )}

                {/* State: UPLOADING */}
                {status === "uploading" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-white mb-2">Uploading...</h3>
                    <p className="text-[#6B6B6B] text-sm mb-6">Please don&apos;t close this tab while your video is securely transferring to Cliptic Cloud.</p>
                    
                    <div className="w-full bg-[#1a1a1a] rounded-full h-3 mb-3 border border-[#2a2a2a] overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF] transition-all duration-300 relative"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 mix-blend-overlay animate-[slide_1s_linear_infinite]" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold text-[#a0a0a0]">
                      <span>{progress < 100 ? "Uploading to Cloud..." : "Finalizing..."}</span>
                      <span className="text-[#00E5FF]">{Math.min(progress, 100)}%</span>
                    </div>
                  </div>
                )}

                {/* State: SUCCESS */}
                {status === "success" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-[#00E5FF] mb-2">Upload Successful!</h3>
                    <p className="text-[#6B6B6B] text-sm mb-6">Your video is securely stored and ready for our AI processing engine.</p>
                    {processError && (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {processError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {status === "selected" && (
                <button 
                  onClick={handleRealUpload}
                  disabled={Boolean(durationError) || videoDuration === null}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-[#090909] transition-all duration-300 bg-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:bg-white hover:-translate-y-1 group disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#00E5FF]"
                >
                  <UploadCloud size={18} className="group-hover:animate-bounce" />
                  Upload Video
                </button>
              )}

              {status === "uploading" && (
                <button 
                  onClick={cancelUpload}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-[#6B6B6B] transition-all duration-300 bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:text-white"
                >
                  Cancel Upload
                </button>
              )}

              {status === "success" && (
                <button 
                  onClick={async () => {
                    if (!projectIdState || !s3KeyState || !file || isStartingProcess) return;
                    setIsStartingProcess(true);
                    setProcessError(null);
                    
                    try {
                      const res = await fetch("/api/process", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ projectId: projectIdState, s3Key: s3KeyState, fileName: file.name }),
                      });
                      const data = await readApiResponse(res);

                      if (!res.ok) {
                        const message = data?.details || data?.error || data?.message || "Failed to start processing";
                        console.error("Failed to queue video processing", {
                          status: res.status,
                          message,
                        });
                        throw new Error(`${message} (HTTP ${res.status})`);
                      }

                      router.push(`/dashboard/project/${projectIdState}`);
                    } catch (err: unknown) {
                      setProcessError(getErrorMessage(err));
                      setIsStartingProcess(false);
                    }
                  }}
                  disabled={isStartingProcess}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-white transition-all duration-300 bg-gradient-to-r from-[#7000FF] to-[#B026FF] shadow-[0_0_20px_rgba(176,38,255,0.3)] hover:shadow-[0_0_35px_rgba(176,38,255,0.5)] hover:-translate-y-1 group"
                >
                  {isStartingProcess ? (
                    <Loader2 size={18} className="animate-[spin_2s_linear_infinite] text-[#00E5FF]" />
                  ) : (
                    <Sparkles size={18} className="text-[#00E5FF] group-hover:animate-pulse" />
                  )}
                  {isStartingProcess ? "Starting AI Processing..." : "Turn into Viral Shorts"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
