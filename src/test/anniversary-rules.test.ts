import {describe,it,expect,vi,afterEach} from 'vitest';
import {anniversaryClock,jakartaDay,tomorrow,requestSchema,validateMedia,TIME_OPTIONS} from '@/features/anniversary/rules';
afterEach(()=>vi.useRealTimers());
describe('Anniversary dates',()=>{
 it('counts down to 24 March 2027 in Jakarta',()=>{const value=anniversaryClock(new Date('2027-03-23T16:59:00Z'));expect(value.minutes).toBe(1);expect(value.nextYear).toBe(2027);expect(value.anniversary).toBe(false);});
 it('celebrates all of 24 March instead of a negative timer',()=>{const value=anniversaryClock(new Date('2027-03-24T16:59:59Z'));expect(value.anniversary).toBe(true);expect(value.duration).toEqual({years:7,months:0,days:0});});
 it('rolls automatically to the next year after the anniversary',()=>expect(anniversaryClock(new Date('2027-03-24T17:00:00Z')).nextYear).toBe(2028));
 it('calculates duration since 24 March 2020',()=>expect(anniversaryClock(new Date('2026-11-21T18:18:00Z')).duration).toEqual({years:6,months:7,days:29}));
 it('uses Jakarta midnight for tomorrow',()=>{expect(jakartaDay(new Date('2026-11-21T18:18:00Z'))).toBe('2026-11-22');expect(tomorrow(new Date('2026-11-21T18:18:00Z'))).toBe('2026-11-23');});
});
const base={id:'c32b12fe-19d1-4107-a07d-5e5291dc22d2',requested_date:'2027-03-25',time_category:'Evening',requested_time:'17:00',activity:'Movie Date',destination:'Cinema',additional_request:'',custom_activity:''};
describe('Date invitation rules',()=>{
 it('rejects today and past dates; accepts tomorrow with no maximum',()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2027-03-24T01:00:00Z'));expect(requestSchema.safeParse({...base,requested_date:'2027-03-24'}).success).toBe(false);expect(requestSchema.safeParse({...base,requested_date:'2027-03-23'}).success).toBe(false);expect(requestSchema.safeParse(base).success).toBe(true);expect(requestSchema.safeParse({...base,requested_date:'2099-12-31'}).success).toBe(true);});
 it('only permits the specified morning, evening and night times',()=>{expect(TIME_OPTIONS).toEqual({Morning:['08:00','09:00','10:00','11:00'],Evening:['16:00','17:00','18:00'],Night:['19:00','20:00','21:00']});expect(requestSchema.safeParse({...base,requested_date:'2099-01-01',requested_time:'19:00'}).success).toBe(false);});
 it('requires a custom idea for Other',()=>{expect(requestSchema.safeParse({...base,requested_date:'2099-01-01',activity:'Other',custom_activity:''}).success).toBe(false);expect(requestSchema.safeParse({...base,requested_date:'2099-01-01',activity:'Other',custom_activity:'Art gallery'}).success).toBe(true);});
 it('requires a destination while additional requests are optional',()=>{expect(requestSchema.safeParse({...base,requested_date:'2099-01-01',destination:' '}).success).toBe(false);expect(requestSchema.safeParse({...base,requested_date:'2099-01-01'}).success).toBe(true);});
});
describe('Original media limits',()=>{
 it('accepts exactly 20 MB photos and rejects larger photos',()=>{expect(validateMedia({size:20*1048576,type:'image/jpeg'})).toBeNull();expect(validateMedia({size:20*1048576+1,type:'image/jpeg'})).not.toBeNull();});
 it('accepts exactly 100 MB videos and rejects larger videos',()=>{expect(validateMedia({size:100*1048576,type:'video/mp4'})).toBeNull();expect(validateMedia({size:100*1048576+1,type:'video/mp4'})).not.toBeNull();});
 it('rejects unsupported files',()=>expect(validateMedia({size:100,type:'text/html'})).not.toBeNull());
});
