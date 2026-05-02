"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileVideo, X, Sparkles, Film, CheckCircle2 } from "lucide-react";
import { Dashboard3D } from "./Dashboard3D";
import { getProjectStatus } from "@/lib/actions/project.actions";

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "selected" | "uploading" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRealUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);

    try {
      // 1. Get Presigned Upload URL from Server
      const urlRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const urlData = await urlRes.json();
      
      if (!urlRes.ok) throw new Error(urlData.details || "Failed to get upload URL");
      
      const { uploadUrl, projectId, s3Key } = urlData;

      // 2. Upload directly to AWS S3
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
          setStatus("success");
          
          // 3. Tell server to process the uploaded file via Inngest in the background
          fetch("/api/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, s3Key, fileName: file.name }),
          }).catch(err => console.error("Background AI trigger failed:", err));
          
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
    } catch (err: any) {
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

      {status === "selected" && file && previewUrl && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF]" />
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Preview */}
            <div className="w-full lg:w-2/3 bg-black rounded-2xl overflow-hidden border border-[#2a2a2a] relative group aspect-video">
              <video 
                src={previewUrl} 
                controls 
                className="w-full h-full object-contain"
                poster=""
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Video Details & Actions */}
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
                  <button onClick={reset} className="p-2 rounded-lg text-[#6B6B6B] hover:text-white hover:bg-[#1a1a1a] transition-colors" title="Remove file">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#6B6B6B]">Estimated Output</span>
                      <span className="font-bold text-white">~15-20 Shorts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#6B6B6B]">Auto Captions</span>
                      <span className="font-bold text-[#00E5FF]">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B6B6B]">Format</span>
                      <span className="font-bold text-white">9:16 Vertical</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleRealUpload}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-white transition-all duration-300 bg-gradient-to-r from-[#7000FF] to-[#B026FF] shadow-[0_0_20px_rgba(176,38,255,0.3)] hover:shadow-[0_0_35px_rgba(176,38,255,0.5)] hover:-translate-y-1 group"
              >
                <Sparkles size={18} className="text-[#00E5FF] group-hover:animate-pulse" />
                Generate Viral Shorts
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="bg-[#111111] border border-[#B026FF]/30 rounded-3xl p-12 text-center shadow-[0_0_50px_rgba(176,38,255,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,38,255,0.15)_0%,transparent_70%)]" />
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-[#00E5FF] border-l-[#B026FF] animate-spin" />
              <Film size={32} className="text-[#B026FF] animate-pulse" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2">Uploading & Analyzing...</h3>
            <p className="text-[#6B6B6B] text-sm mb-10">Our AI is scanning your video for high-engagement moments. Please don't close this tab.</p>
            
            <div className="flex items-center gap-4 mt-8">
              <button 
                onClick={cancelUpload}
                className="w-1/3 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-[#6B6B6B] transition-all duration-300 bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:text-white"
              >
                Cancel
              </button>
              <div className="w-2/3">
                <div className="w-full bg-[#1a1a1a] rounded-full h-3 mb-3 border border-[#2a2a2a] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7000FF] via-[#B026FF] to-[#00E5FF] transition-all duration-300 relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 mix-blend-overlay animate-[slide_1s_linear_infinite]" />
                  </div>
                </div>
                
                <div className="flex justify-between text-xs font-bold text-[#a0a0a0]">
                  <span>{progress < 95 ? "Uploading to Cloud..." : "Processing with AI..."}</span>
                  <span className="text-[#00E5FF]">{Math.min(progress, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="bg-[#111111] border border-[#00E5FF]/30 rounded-3xl p-12 text-center shadow-[0_0_50px_rgba(0,229,255,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.15)_0%,transparent_70%)]" />
          
          <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mb-6 text-[#00E5FF]">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Analysis Complete!</h3>
            <p className="text-[#6B6B6B] mb-8">We found 18 potential viral clips. You can now review, edit, and export them in your workspace.</p>
            <button 
              onClick={reset}
              className="px-8 py-4 rounded-xl font-bold text-[#090909] bg-[#00E5FF] hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              Go to Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
