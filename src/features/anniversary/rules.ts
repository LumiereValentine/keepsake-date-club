import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } from 'date-fns';
import { z } from 'zod';
export const TIME_OPTIONS = { Morning: ['08:00', '09:00', '10:00', '11:00'], Evening: ['16:00', '17:00', '18:00'], Night: ['19:00', '20:00', '21:00'] } as const;
export const ACTIVITIES = ['Movie Date', 'Park Date', 'Mall Date', 'Mukbang Date', 'House Date', 'Other'] as const;
export function jakartaDay(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function tomorrow(now = new Date()) { const d = new Date(`${jakartaDay(now)}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
export function anniversaryClock(now = new Date()) {
 const day = jakartaDay(now); const year = Number(day.slice(0, 4)); const anniversary = day.slice(5) === '03-24';
 const nextYear = day.slice(5) > '03-24' ? year + 1 : year;
 const target = new Date(`${nextYear}-03-24T00:00:00+07:00`);
 const seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
 const start = new Date('2020-03-24T00:00:00Z'); const today = new Date(`${day}T00:00:00Z`);
 const years = differenceInYears(today, start); const afterYears = addYears(start, years); const months = differenceInMonths(today, afterYears); const days = differenceInDays(today, addMonths(afterYears, months));
 return { anniversary, nextYear, days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60, duration: { years, months, days } };
}
export const requestSchema = z.object({ id: z.string().uuid(), requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time_category: z.enum(['Morning','Evening','Night']), requested_time: z.string(), activity: z.enum(ACTIVITIES), custom_activity: z.string().max(300).default(''), destination: z.string().trim().min(1, 'Add a destination.').max(300), additional_request: z.string().max(2000).default('') }).superRefine((v, ctx) => {
 if (v.requested_date < tomorrow() || Number.isNaN(Date.parse(v.requested_date)) || new Date(v.requested_date).toISOString().slice(0,10) !== v.requested_date) ctx.addIssue({code:'custom',path:['requested_date'],message:'Choose tomorrow or a later date.'});
 if (!(TIME_OPTIONS[v.time_category] as readonly string[]).includes(v.requested_time)) ctx.addIssue({code:'custom',path:['requested_time'],message:'Choose a time in your selected category.'});
 if (v.activity === 'Other' && !v.custom_activity.trim()) ctx.addIssue({code:'custom',path:['custom_activity'],message:'Tell us what you have in mind.'});
});
export type DateRequest = z.infer<typeof requestSchema>;
export function validateMedia(file: Pick<File,'size'|'type'>) {
 const photo = ['image/jpeg','image/png','image/webp','image/gif'].includes(file.type); const video = ['video/mp4','video/webm','video/quicktime'].includes(file.type);
 if (!photo && !video) return 'Choose a JPG, PNG, WebP, GIF, MP4, WebM or MOV file.';
 if (file.size <= 0) return 'This file is empty.';
 if (file.size > (photo ? 20 : 100) * 1024 * 1024) return `${photo ? 'Photos' : 'Videos'} must be ${photo ? 20 : 100} MB or smaller.`;
 return null;
}
export function formatDate(value: string) { return new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Jakarta', day:'numeric',month:'long',year:'numeric'}).format(new Date(value)); }
