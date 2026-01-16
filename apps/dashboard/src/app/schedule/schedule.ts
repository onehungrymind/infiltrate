import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView, CalendarEvent, DateAdapter, CalendarUtils, CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addDays, addHours, startOfDay, isSameDay, isSameMonth } from 'date-fns';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    CalendarEventTitleFormatter,
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
  viewDate = signal<Date>(new Date());
  view = signal<CalendarView>(CalendarView.Month);
  activeDayIsOpen = false;
  CalendarView = CalendarView;

  // Sample events - these would come from UserProgress/SM-2 data in production
  events = signal<CalendarEvent[]>([
    {
      start: startOfDay(new Date()),
      title: 'React Fundamentals Review',
      color: { primary: '#3b82f6', secondary: '#dbeafe' },
      meta: { type: 'review', count: 12 },
    },
    {
      start: addDays(new Date(), 1),
      title: 'TypeScript Generics Quiz',
      color: { primary: '#8b5cf6', secondary: '#ede9fe' },
      meta: { type: 'quiz', count: 8 },
    },
    {
      start: addDays(new Date(), 2),
      title: 'ML Pipeline Project Due',
      color: { primary: '#ef4444', secondary: '#fee2e2' },
      meta: { type: 'project' },
    },
    {
      start: addDays(new Date(), 3),
      title: 'State Management Review',
      color: { primary: '#3b82f6', secondary: '#dbeafe' },
      meta: { type: 'review', count: 5 },
    },
    {
      start: addDays(new Date(), 5),
      title: 'API Design Challenge',
      color: { primary: '#f59e0b', secondary: '#fef3c7' },
      meta: { type: 'challenge' },
    },
    {
      start: addHours(startOfDay(addDays(new Date(), 7)), 10),
      end: addHours(startOfDay(addDays(new Date(), 7)), 12),
      title: 'Mentor Session',
      color: { primary: '#22c55e', secondary: '#dcfce7' },
      meta: { type: 'mentor' },
    },
  ]);

  // Stats computed from events
  reviewsDueToday = computed(() => {
    const today = startOfDay(new Date());
    return this.events().filter(
      (e) => e.meta?.type === 'review' && startOfDay(e.start).getTime() === today.getTime()
    ).length;
  });

  upcomingDeadlines = computed(() => {
    return this.events().filter(
      (e) => e.meta?.type === 'project' || e.meta?.type === 'challenge'
    ).length;
  });

  setView(view: CalendarView) {
    this.view.set(view);
    this.activeDayIsOpen = false;
  }

  navigateToday() {
    this.viewDate.set(new Date());
    this.activeDayIsOpen = false;
  }

  navigatePrevious() {
    const current = this.viewDate();
    const view = this.view();
    if (view === CalendarView.Month) {
      this.viewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    } else if (view === CalendarView.Week) {
      this.viewDate.set(addDays(current, -7));
    } else {
      this.viewDate.set(addDays(current, -1));
    }
    this.activeDayIsOpen = false;
  }

  navigateNext() {
    const current = this.viewDate();
    const view = this.view();
    if (view === CalendarView.Month) {
      this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    } else if (view === CalendarView.Week) {
      this.viewDate.set(addDays(current, 7));
    } else {
      this.viewDate.set(addDays(current, 1));
    }
    this.activeDayIsOpen = false;
  }

  onEventClicked(event: CalendarEvent) {
    console.log('Event clicked:', event);
    // TODO: Navigate to relevant page based on event type
  }

  onDayClicked({ date, events }: { date: Date; events: CalendarEvent[] }) {
    if (isSameMonth(date, this.viewDate())) {
      if (
        (isSameDay(this.viewDate(), date) && this.activeDayIsOpen) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate.set(date);
    }
  }

  formatViewTitle(): string {
    const date = this.viewDate();
    const view = this.view();
    if (view === CalendarView.Month) {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === CalendarView.Week) {
      const weekStart = addDays(date, -date.getDay());
      const weekEnd = addDays(weekStart, 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  }
}
