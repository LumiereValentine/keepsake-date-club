import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requestSchema } from './rules';
export const getMembership = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const {data,error} = await context.supabase.from('user_roles').select('role').eq('user_id',context.userId).maybeSingle();
 if(error) throw new Error(error.message); if(!data) throw new Error('This account is not a member of this private space.'); return data;
});
export const listMedia = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const {data:member} = await context.supabase.from('user_roles').select('role').eq('user_id',context.userId).maybeSingle(); if(!member) throw new Error('This space is private.');
 const rows = []; let offset = 0;
 while(true) { const {data,error} = await context.supabase.from('media').select('*').order('created_at',{ascending:false}).range(offset,offset+999); if(error) throw new Error(error.message); rows.push(...data); if(data.length < 1000) break; offset+=1000; }
 const signed = await Promise.all(rows.map(async row => { const bucket = row.media_type==='photo'?'photos':'videos'; const {data,error} = await context.supabase.storage.from(row.thumbnail_path ? 'thumbnails':bucket).createSignedUrl(row.thumbnail_path ?? row.storage_path,3600); if(error) throw new Error(error.message); return {...row, preview:data.signedUrl}; }));
 return signed;
});
export const submitDate = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>requestSchema.parse(input)).handler(async ({data,context}) => {
 const {data:member} = await context.supabase.from('user_roles').select('role').eq('user_id',context.userId).maybeSingle(); if(member?.role!=='partner') throw new Error('Only the partner can send a date request.');
 const {data:existing,error:readError}=await context.supabase.from('date_requests').select('*').eq('id',data.id).maybeSingle(); if(readError) throw new Error(readError.message);
 if(existing?.email_status==='sent') return {sent:true};
 let row=existing;
 if(!row) { const {data:inserted,error}=await context.supabase.from('date_requests').insert({...data,submitted_by:context.userId}).select().single(); if(error) { if(error.code==='23505') throw new Error('This request is already being submitted. Please retry shortly.'); throw new Error(error.message); } row=inserted; }
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 if(row.email_status==='sending' && row.email_claimed_at && Date.now()-Date.parse(row.email_claimed_at)<120000) throw new Error('Your request is already being sent. Please wait before retrying.');
 // Resend retains idempotency keys for 24 hours. Never retry an ambiguous send beyond that window.
 if(row.email_claimed_at && Date.now()-Date.parse(row.email_claimed_at)>23*3600000) throw new Error('Your request is saved, but delivery needs to be checked before it can be retried.');
 const {data:claimed,error:claimError}=await supabaseAdmin.from('date_requests').update({email_status:'sending',email_claimed_at:row.email_claimed_at ?? new Date().toISOString()}).eq('id',row.id).eq('email_status',row.email_status).select().maybeSingle(); if(claimError) throw new Error(claimError.message); if(!claimed) throw new Error('Your request is already being sent.');
 try {
 const key=process.env['RESEND_API_KEY']; const gatewayKey=process.env['LOVABLE_API_KEY']; if(!key || !gatewayKey) throw new Error('Your request is saved, but email delivery is not configured yet.');
 const {data:owner,error:ownerError}=await supabaseAdmin.from('user_roles').select('user_id').eq('role','owner').single(); if(ownerError || !owner) throw new Error('Your request is saved. The owner account must be configured before email can be sent.');
 const {data:ownerUser,error:userError}=await supabaseAdmin.auth.admin.getUserById(owner.user_id); const email=ownerUser.user?.email; if(userError || !email) throw new Error('The owner email address is not available.');
 const text=`A little time for us.\n\nDate: ${row.requested_date}\nTime: ${row.time_category}, ${row.requested_time}\nActivity: ${row.activity==='Other'?row.custom_activity:row.activity}\nDestination: ${row.destination}\nAdditional request: ${row.additional_request || 'None'}\n\nAlways, Us`;
 const response=await fetch('https://connector-gateway.lovable.dev/resend/emails',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${gatewayKey}`,'X-Connection-Api-Key':key,'Idempotency-Key':`anniversary-date-${row.id}`},body:JSON.stringify({from:process.env['RESEND_FROM'] || 'Always, Us <onboarding@resend.dev>',to:[email],subject:'A date with you · Always, Us',text})});
 if(!response.ok){const body=await response.text(); console.error(`Resend failed [${response.status}]: ${body}`); throw new Error(`Your request is saved, but email failed [${response.status}]: ${body}`);}
 const {error}=await supabaseAdmin.from('date_requests').update({email_status:'sent'}).eq('id',row.id); if(error) throw new Error('Email was accepted; delivery confirmation could not be saved. Retrying will not duplicate the email.'); return {sent:true};
 } catch(error) { await supabaseAdmin.from('date_requests').update({email_status:'failed'}).eq('id',row.id); throw error; }
});
