import type { ScheduleEvent } from '../types';

function unescapeICS(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\');
}

function parseICSDate(value: string): string | null {
  // Handles YYYYMMDDTHHMMSS and YYYYMMDDTHHMMSSZ
  const cleaned = value.replace(/[^0-9T]/g, '').replace('T', '');
  if (cleaned.length < 8) return null;

  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);

  if (cleaned.length >= 14) {
    const hour = cleaned.substring(8, 10);
    const min = cleaned.substring(10, 12);
    const sec = cleaned.substring(12, 14);
    return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
  }

  return `${year}-${month}-${day}T00:00:00`;
}

function extractProperty(block: string, prop: string): string | null {
  // Match property, possibly with parameters (e.g., DTSTART;TZID=...)
  const regex = new RegExp(`^${prop}[;:](.*)$`, 'mi');
  const match = block.match(regex);
  if (!match) return null;

  let value = match[1];
  // If there were parameters (;), the actual value is after the last ':'
  if (match[0].includes(';') && value.includes(':')) {
    value = value.substring(value.lastIndexOf(':') + 1);
  }

  return unescapeICS(value.trim());
}

export function parseICS(content: string): Partial<ScheduleEvent>[] {
  const events: Partial<ScheduleEvent>[] = [];

  // Split by VEVENT blocks
  const blocks = content.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];

    const summary = extractProperty(block, 'SUMMARY');
    const location = extractProperty(block, 'LOCATION');
    const dtstart = extractProperty(block, 'DTSTART');
    const dtend = extractProperty(block, 'DTEND');
    const rrule = extractProperty(block, 'RRULE');

    const startTime = dtstart ? parseICSDate(dtstart) : null;
    const endTime = dtend ? parseICSDate(dtend) : null;

    if (summary && startTime && endTime) {
      events.push({
        title: summary,
        location: location || null,
        start_time: startTime,
        end_time: endTime,
        recurrence_rule: rrule || null,
      });
    }
  }

  return events;
}
