"use client";

import React, { useEffect, useState } from "react";
import { getMyVideos, deleteVideo } from "@/lib/actions/videos.actions";
import { 
  Download, 
  Trash2, 
  ExternalLink, 
  Video as VideoIcon, 
  Loader2, 
  AlertTriangle,
  Search,
  Grid,
  List as ListIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MyVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await getMyVideos();
      setVideos(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async () => {
    if (confirmText !== "cliptic delete") {
      toast.error("Please type 'cliptic delete' exactly to confirm");
      return;
    }

    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete);
      toast.success("Video deleted successfully");
      setVideos(videos.filter(v => v.id !== videoToDelete));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
      setConfirmText("");
      setVideoToDelete(null);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-2">
            My Rendered Videos
          </h1>
          <p className="text-[#6B6B6B]">Your library of ready-to-post viral clips.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] transition-colors group-focus-within:text-[#00E5FF]" size={18} />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-xl text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all w-full md:w-[300px]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
          <p className="text-[#6B6B6B] animate-pulse">Retrieving your library...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-[#2a2a2a] border-dashed rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-[#6B6B6B] mb-4">
            <VideoIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No videos found</h3>
          <p className="text-[#6B6B6B] text-center max-w-md px-6">
            {searchQuery ? "No matches for your search." : "You haven't rendered any clips yet. Head back to your projects to start rendering!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="group relative flex flex-col bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#B026FF]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(176,38,255,0.08)]"
            >
              <div className="aspect-[9/16] relative bg-black flex items-center justify-center overflow-hidden">
                {/* Fallback to simple icon since we don't have true thumbnails generated yet */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#2a2a2a] group-hover:text-[#B026FF]/30 transition-colors">
                  <VideoIcon size={64} />
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2">Cliptic Render</span>
                </div>
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a 
                    href={video.exportUrl} 
                    target="_blank"
                    className="w-12 h-12 rounded-full bg-[#B026FF] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg group/play"
                  >
                    <VideoIcon size={20} className="fill-current" />
                  </a>
                  <a 
                    href={video.exportUrl} 
                    download 
                    className="w-12 h-12 rounded-full bg-[#00E5FF] text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Download size={20} />
                  </a>
                  <button 
                    onClick={() => {
                      setVideoToDelete(video.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/80 border border-white/10 text-[10px] font-black text-[#00E5FF] uppercase tracking-tighter">
                  9:16 HD
                </div>
              </div>

              <div className="p-4 border-t border-[#2a2a2a]">
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-3 h-10">{video.title || "Untitled Short"}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#6B6B6B]">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-black text-green-500 uppercase">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0c0c0c] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={20} />
              Delete Permanently?
            </DialogTitle>
            <DialogDescription className="text-[#6B6B6B]">
              This will permanently remove the video from your library and our servers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-sm mb-4">
              To confirm deletion, please type <span className="text-white font-mono bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a]">cliptic delete</span> below:
            </p>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type confirmation here..."
              className="bg-[#111111] border-[#2a2a2a] focus:border-red-500/50 transition-all"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText("");
              }}
              className="bg-transparent border-[#2a2a2a] text-[#6B6B6B] hover:bg-[#1a1a1a] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={confirmText !== "cliptic delete" || isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Delete Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
