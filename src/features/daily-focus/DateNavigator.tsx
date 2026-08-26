'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface DateNavigatorProps {
  selectedDate: string
  onDateChange: (newDate: string) => void
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const todayStr = new Date().toISOString().split('T')[0]
  const [viewDate, setViewDate] = useState(selectedDate)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

  // Keep viewDate synced if selectedDate is changed externally (e.g. initial load or reset)
  useEffect(() => {
    setViewDate(selectedDate)
  }, [selectedDate])

  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const formatDateToString = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Generate 5 days centered around viewDate (-2, -1, 0, +1, +2)
  const baseDate = parseDate(viewDate)
  const visibleDates = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + offset)
    const dateStr = formatDateToString(d)
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNumber = d.getDate()
    const isToday = dateStr === todayStr
    const isSelected = dateStr === selectedDate

    return {
      dateStr,
      dayOfWeek,
      dayNumber,
      isToday,
      isSelected,
    }
  })

  // Shift visible window WITHOUT changing selectedDate
  const shiftWindow = (days: number, direction: 'left' | 'right') => {
    const d = parseDate(viewDate)
    d.setDate(d.getDate() + days)
    setSlideDirection(direction)
    setViewDate(formatDateToString(d))
  }

  const handleSelectDate = (dateStr: string) => {
    setViewDate(dateStr)
    onDateChange(dateStr)
  }

  const handleJumpToToday = () => {
    setViewDate(todayStr)
    onDateChange(todayStr)
    setSlideDirection(null)
  }

  const selectedMonthYear = parseDate(viewDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3">
      {/* Top Bar: Month/Year + Jump to Today + Calendar picker */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#111111] tracking-tight uppercase">
            {selectedMonthYear}
          </span>
          {selectedDate === todayStr && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111111] text-white">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedDate !== todayStr && (
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-[11px] font-bold text-[#111111] bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-lg transition-all duration-200 ease-out active:scale-95 cursor-pointer animate-fadeIn"
            >
              Jump to Today
            </button>
          )}

          <label className="relative flex items-center p-1.5 rounded-lg hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-all duration-200 ease-out active:scale-95 cursor-pointer">
            <CalendarIcon className="w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && handleSelectDate(e.target.value)}
              className="absolute opacity-0 inset-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 5-Day Horizontal Strip with Carousel Sliding Animation */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Arrow (Slide visible dates backward by 1 day) */}
        <button
          aria-label="Previous Days"
          onClick={() => shiftWindow(-1, 'right')}
          className="p-2 rounded-xl hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-all duration-200 ease-out active:scale-90 cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 5 Date Pills with smooth slide animation */}
        <div
          key={viewDate}
          className={`grid grid-cols-5 gap-1.5 sm:gap-2.5 flex-1 ${
            slideDirection === 'left'
              ? 'animate-slide-left'
              : slideDirection === 'right'
              ? 'animate-slide-right'
              : 'animate-fadeIn'
          }`}
        >
          {visibleDates.map((item) => (
            <button
              key={item.dateStr}
              data-date={item.dateStr}
              onClick={() => handleSelectDate(item.dateStr)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 ease-out active:scale-95 cursor-pointer relative ${
                item.isSelected
                  ? 'bg-[#111111] text-white shadow-md scale-[1.03]'
                  : 'bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[#111111] border border-[#E4E4E7]/60 hover:border-[#111111]/30'
              }`}
            >
              {/* Today Dot Indicator */}
              {item.isToday && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 transition-colors ${
                    item.isSelected ? 'bg-white' : 'bg-[#111111]'
                  }`}
                  title="Today"
                />
              )}

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  item.isSelected ? 'text-zinc-300' : 'text-[#71717A]'
                }`}
              >
                {item.dayOfWeek}
              </span>
              <span
                className={`text-sm sm:text-base font-extrabold tracking-tight mt-0.5 transition-all ${
                  item.isSelected ? 'text-white' : 'text-[#111111]'
                }`}
              >
                {item.dayNumber}
              </span>
            </button>
          ))}
        </div>

        {/* Right Arrow (Slide visible dates forward by 1 day) */}
        <button
          aria-label="Next Days"
          onClick={() => shiftWindow(1, 'left')}
          className="p-2 rounded-xl hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-all duration-200 ease-out active:scale-90 cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
