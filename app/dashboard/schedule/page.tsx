"use client";

import React, { useState, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  setHours,
  setMinutes
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Share2, 
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getScheduledPosts, schedulePost, generateAIContent, cancelScheduledPost } from "@/lib/actions/schedule.actions";
import { getMyVideos } from "@/lib/actions/videos.actions";
import { getConnectedAccounts } from "@/app/api/zernio/accounts/route"; // Wait, this is a GET route, I'll fetch it via API
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  
  // Management State
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);

  // Form State
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [time, setTime] = useState("12:00");
  const [ampm, setAmpm] = useState("PM");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const posts = await getScheduledPosts(startDate, endDate);
      setScheduledPosts(posts);
      
      const videos = await getMyVideos();
      setMyVideos(videos);

      const accountsRes = await fetch("/api/zernio/accounts");
      const accountsData = await accountsRes.json();
      setSocialAccounts(accountsData.accounts || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load scheduling data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddPost = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
    // Reset form
    setSelectedVideoId("");
    setSelectedAccountIds([]);
    setCaption("");
    setTitle("");
  };

  const handlePostClick = (post: any) => {
    setActivePost(post);
    setIsManageDialogOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!selectedVideoId) {
      toast.error("Please select a video first");
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateAIContent(selectedVideoId, title);
      setCaption(result.caption + "\n\n" + (result.hashtags?.map((h: string) => `#${h}`).join(" ") || ""));
      if (!title) setTitle(result.title);
      toast.success("AI generated your caption!");
    } catch (error) {
      toast.error("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideoId || selectedAccountIds.length === 0 || !selectedDate) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let [hours, minutes] = time.split(":").map(Number);
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const scheduledTime = setMinutes(setHours(selectedDate, hours), minutes);

      await schedulePost({
        shortId: selectedVideoId,
        socialAccountIds: selectedAccountIds,
        scheduledDate: scheduledTime,
        metadata: { caption, title }
      });

      toast.success(`Successfully scheduled for ${selectedAccountIds.length} accounts!`);
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to schedule post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAccount = (id: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Scrollbar Styles
  const scrollbarStyles = `
    .stylish-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .stylish-scrollbar::-webkit-scrollbar-track {
      background: #090909;
      border-radius: 10px;
    }
    .stylish-scrollbar::-webkit-scrollbar-thumb {
      background: #2a2a2a;
      border-radius: 10px;
    }
    .stylish-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #B026FF;
    }
  `;

  const handleCancelPost = async (id: string) => {
    if (!id) return;
    try {
      // 1. Optimistic UI update
      setScheduledPosts(prev => prev.filter(p => p.id !== id));
      setIsManageDialogOpen(false);
      
      // 2. Perform server action
      const res = await cancelScheduledPost(id);
      
      if (res.success) {
        toast.success("Post successfully cancelled");
      } else {
        throw new Error("Failed to delete");
      }
      
      // 3. Final data sync
      await fetchData();
    } catch (error) {
      console.error("Cancellation Error:", error);
      toast.error("Failed to cancel post. Please try again.");
      fetchData(); // Rollback on error
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-2 uppercase tracking-tighter">
            Post Scheduler
          </h1>
          <p className="text-[#6B6B6B] font-medium italic">Plan your viral takeover with the cliptic calendar.</p>
        </div>

        <div className="flex items-center bg-[#111111] border border-[#2a2a2a] rounded-2xl p-2 shadow-xl">
          <button onClick={handlePrevMonth} className="p-2.5 hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#6B6B6B] hover:text-white">
            <ChevronLeft size={22} />
          </button>
          <div className="px-8 py-1 text-sm font-black uppercase tracking-widest text-[#F8F8F8]">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <button onClick={handleNextMonth} className="p-2.5 hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#6B6B6B] hover:text-white">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#2a2a2a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-[#0c0c0c] py-5 text-center text-[11px] font-black uppercase tracking-widest text-[#444] border-b border-[#1a1a1a]">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, i) => {
          const dayPosts = scheduledPosts.filter(p => isSameDay(new Date(p.scheduledDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={i} 
              className={`min-h-[150px] bg-[#0c0c0c] p-4 transition-colors relative group border-b border-r border-[#1a1a1a] ${
                !isCurrentMonth ? "opacity-10 pointer-events-none" : "hover:bg-[#0f0f0f]"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-sm font-black ${isToday(day) ? "text-[#00E5FF] bg-[#00E5FF]/10 w-8 h-8 flex items-center justify-center rounded-xl border border-[#00E5FF]/30" : "text-[#333]"}`}>
                  {format(day, "d")}
                </span>
                
                <button 
                  onClick={() => handleAddPost(day)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-[#B026FF] text-white rounded-xl transition-all hover:scale-110 shadow-lg shadow-[#B026FF]/30 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                {dayPosts.map((post) => (
                  <button 
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className={`w-full p-2 rounded-xl border flex items-center gap-2 group/post transition-all hover:translate-x-1 ${
                      post.status === "completed" 
                      ? "bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                      : post.status === "failed"
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-[#161616] border-white/5 shadow-inner"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      post.status === "completed" ? "bg-white shadow-[0_0_8px_white]" : 
                      post.status === "failed" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                      "bg-[#B026FF] shadow-[0_0_8px_rgba(176,38,255,0.4)]"
                    }`} />
                    <span className={`text-[10px] font-bold truncate ${post.status === "completed" ? "text-white" : "text-[#F8F8F8]"}`}>
                      {post.shortTitle || "Untitled"}
                    </span>
                    <span className={`ml-auto text-[8px] font-black uppercase ${post.status === "completed" ? "text-white/70" : "text-[#444]"}`}>
                      {post.platform}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Dialog - Clean max-w-2xl */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0c0c0c] border-[#2a2a2a] text-white max-w-2xl p-0 overflow-hidden rounded-3xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#B026FF] to-[#00E5FF]" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                <CalendarIcon size={24} className="text-[#00E5FF]" />
                Schedule Post
                <span className="text-[#6B6B6B] text-sm ml-2 font-medium">/ {selectedDate && format(selectedDate, "MMM do")}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">1. Select Video</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-1 stylish-scrollbar pr-2">
                    {myVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideoId(video.id)}
                        className={`group relative p-2 rounded-2xl border transition-all ${
                          selectedVideoId === video.id 
                          ? "bg-[#B026FF]/10 border-[#B026FF]" 
                          : "bg-[#090909] border-[#2a2a2a] hover:border-[#B026FF]/40"
                        }`}
                      >
                        <div className="aspect-video bg-[#1a1a1a] rounded-xl mb-2 flex items-center justify-center text-[#3a3a3a] relative overflow-hidden">
                          {video.exportedUrl ? (
                            <video 
                              src={video.exportedUrl} 
                              muted 
                              playsInline 
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <Video size={24} className={selectedVideoId === video.id ? "text-[#B026FF]" : ""} />
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-[#F8F8F8] line-clamp-1">{video.title || "Untitled"}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">2. Platforms</label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 stylish-scrollbar">
                    {socialAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => toggleAccount(acc.id)}
                        className={`w-full p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                          selectedAccountIds.includes(acc.id)
                          ? "bg-[#00E5FF]/10 border-[#00E5FF]" 
                          : "bg-[#111111] border-[#2a2a2a] hover:border-[#00E5FF]/40"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E5FF]">
                          <Share2 size={14} />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-xs font-bold text-[#F8F8F8]">{acc.accountName}</p>
                          <p className="text-[9px] font-black text-[#6B6B6B] uppercase">{acc.platform}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-lg border flex items-center justify-center ${selectedAccountIds.includes(acc.id) ? "bg-[#00E5FF] border-[#00E5FF] text-black" : "border-[#2a2a2a] bg-black"}`}>
                          {selectedAccountIds.includes(acc.id) && <CheckCircle2 size={12} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">3. AI Content</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Hook/Title..."
                    className="bg-[#111111] border-[#2a2a2a] focus:border-[#00E5FF]/50 h-10 rounded-xl text-xs"
                  />
                  <div className="relative">
                    <Textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Caption..."
                      className="bg-[#111111] border-[#2a2a2a] focus:border-[#B026FF]/50 h-[100px] text-xs resize-none rounded-2xl p-4 stylish-scrollbar"
                    />
                    <button 
                      onClick={handleGenerateAI}
                      disabled={aiLoading || !selectedVideoId}
                      className="absolute bottom-3 right-3 text-[9px] font-black text-[#B026FF] hover:text-[#00E5FF] transition-colors"
                    >
                      {aiLoading ? "Generating..." : "AI ASSIST"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">4. Schedule Time</label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-[120px]">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={14} />
                      <Input 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="pl-8 bg-[#111111] border-[#2a2a2a] h-11 rounded-xl text-xs w-full"
                      />
                    </div>
                    <div className="flex bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden p-1 h-11 flex-1">
                      {["AM", "PM"].map(m => (
                        <button
                          key={m}
                          onClick={() => setAmpm(m)}
                          className={`flex-1 text-[10px] font-black transition-all rounded-lg ${
                            ampm === m 
                            ? "bg-[#00E5FF] text-black shadow-lg" 
                            : "text-[#6B6B6B] hover:text-white"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-[#2a2a2a] flex gap-3">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 text-[#6B6B6B] font-bold h-11">
                Discard
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedVideoId || selectedAccountIds.length === 0}
                className="flex-[2] bg-[#B026FF] text-white font-black rounded-xl h-11 shadow-[0_0_20px_rgba(176,38,255,0.2)]"
              >
                {isSubmitting ? "Scheduling..." : "CONFIRM SCHEDULE"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Post Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="bg-[#0c0c0c] border-[#2a2a2a] text-white max-w-md p-8 rounded-3xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-xl font-black text-[#00E5FF] uppercase tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                 <Video size={20} />
              </div>
              Manage Schedule
            </DialogTitle>
          </DialogHeader>
          
          {activePost && (
            <div className="space-y-8">
              <div className="bg-[#111111] p-5 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#090909] flex items-center justify-center text-[#B026FF] border border-white/5 shadow-lg">
                    <Video size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-white">{activePost.shortTitle}</h4>
                    <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest mt-1">
                      {activePost.platform} / {activePost.accountName}
                    </p>
                  </div>
                  <div className={`ml-auto px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                    activePost.status === 'completed' ? 'bg-green-500 text-white' : 
                    activePost.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-blue-500/10 text-[#00E5FF]'
                  }`}>
                    {activePost.status}
                  </div>
                </div>
                
                {activePost.status === 'failed' && activePost.errorMessage && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Error Details</p>
                    <p className="text-[11px] text-red-200 leading-relaxed">{activePost.errorMessage}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#111111] p-4 rounded-2xl border border-white/5 space-y-1">
                    <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest">Date</p>
                    <p className="font-bold text-sm">{format(new Date(activePost.scheduledDate), "MMM do, yyyy")}</p>
                 </div>
                 <div className="bg-[#111111] p-4 rounded-2xl border border-white/5 space-y-1">
                    <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest">Time</p>
                    <p className="font-bold text-sm">{format(new Date(activePost.scheduledDate), "p")}</p>
                 </div>
              </div>

              {(activePost.status === 'scheduled' || activePost.status === 'failed') && (
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full font-black uppercase tracking-[0.2em] py-8 rounded-2xl shadow-2xl shadow-red-500/20 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 h-14"
                    onClick={() => handleCancelPost(activePost.id)}
                  >
                    {activePost.status === 'failed' ? 'Clear & Retry' : 'Delete Schedule'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
