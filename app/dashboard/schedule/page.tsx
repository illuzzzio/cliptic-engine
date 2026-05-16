"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SchedulePostDialog } from "@/components/dashboard/SchedulePostDialog";
import { format } from "date-fns";

type Day = {
  date: number | null;
  isCurrentMonth: boolean;
  fullDate?: Date;
};

export default function SchedulePage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Get number of days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = (date: Date): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(date);

    const days: Day[] = [];

    // Current month's days only
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);
  const monthName = format(currentDate, "MMMM yyyy");

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: Day) => {
    if (day.isCurrentMonth && day.fullDate) {
      setSelectedDate(day.fullDate);
      setIsDialogOpen(true);
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-2">
          Schedule Posts
        </h1>
        <p className="text-[#6B6B6B] text-sm">Plan and schedule your short clips across social media platforms</p>
      </div>

      {/* Calendar Card */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-[#7000FF] to-[#B026FF] px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">{monthName}</h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-bold text-white text-sm py-2">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Days */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative group cursor-pointer transition-all duration-200 ${
                  day.isCurrentMonth
                    ? isPastDate(day.fullDate)
                      ? "bg-[#0a0a0a] border-[#1a1a1a] text-[#555]"
                      : isToday(day.fullDate)
                        ? "bg-[#B026FF]/20 border-[#B026FF] shadow-[0_0_15px_rgba(176,38,255,0.3)]"
                        : "bg-[#0a0a0a] border-[#2a2a2a] text-[#ccc] hover:border-[#B026FF]/50 hover:bg-[#B026FF]/10"
                    : "bg-[#090909]/50 border-[#1a1a1a] text-[#444]"
                }`}
                onClick={() => handleDayClick(day)}
              >
                <span className="text-sm font-bold">{day.date}</span>
                
                {day.isCurrentMonth && !isPastDate(day.fullDate) && (
                  <button
                    className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    <Plus size={24} className="text-[#00E5FF]" />
                  </button>
                )}

                {isToday(day.fullDate) && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Post Dialog */}
      <SchedulePostDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Scheduled Posts",
            value: "0",
            color: "#B026FF",
            desc: "Total scheduled for this month",
          },
          {
            label: "Social Accounts",
            value: "0",
            color: "#00E5FF",
            desc: "Connected platforms ready to post",
          },
          {
            label: "Posted",
            value: "0",
            color: "#7000FF",
            desc: "Successfully published this month",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-[#B026FF]/30 hover:shadow-[0_0_30px_rgba(176,38,255,0.05)] hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: `${stat.color}20` }}
              />
            </div>
            <p className="text-sm font-medium text-[#6B6B6B] mb-2">{stat.label}</p>
            <p className="text-4xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-[#777] mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
