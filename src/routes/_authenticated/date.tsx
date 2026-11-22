import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowRight, Check, LoaderCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shell } from '@/features/anniversary/Shell';
import { content, pageHead } from '@/features/anniversary/content';
import { membershipQuery } from '@/features/anniversary/queries';
import { TIME_OPTIONS, ACTIVITIES, tomorrow, requestSchema } from '@/features/anniversary/rules';
import { submitDate } from '@/features/anniversary/data.functions';
export const Route = createFileRoute('/_authenticated/date')({
  head: () => pageHead('Set Up Date', 'A little invitation to make another memory together.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(membershipQuery),
  component: DatePage,
});
function DatePage() {
  const { data: member } = useSuspenseQuery(membershipQuery);
  const send = useServerFn(submitDate);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<keyof typeof TIME_OPTIONS>('Evening');
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState<(typeof ACTIVITIES)[number]>('Movie Date');
  const [custom, setCustom] = useState('');
  const [destination, setDestination] = useState('');
  const [additional, setAdditional] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const id = requestId ?? crypto.randomUUID();
    const parsed = requestSchema.safeParse({
      id,
      requested_date: date,
      time_category: category,
      requested_time: time,
      activity,
      custom_activity: custom,
      destination,
      additional_request: additional,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check your invitation details.');
      return;
    }
    setRequestId(id);
    setLocked(true);
    setBusy(true);
    try {
      await send({ data: parsed.data });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your invitation could not be sent. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <main>
        <header className="page-heading">
          <div className="eyebrow">A little time. Just the two of us.</div>
          <h1>Set Up Date</h1>
          <p>No occasion needed. Being with you is reason enough.</p>
        </header>
        <div className="date-layout">
          <aside className="date-aside">
            <img
              src={content.photo}
              alt="The two of us, away from the everyday"
              className="date-photo"
            />
            <p className="date-note">Anywhere, as long as it’s with you.</p>
          </aside>
          {member.role !== 'partner' ? (
            <div className="success-state">
              <Mail className="mx-auto text-primary" size={30} strokeWidth={1} />
              <h2>An invitation from you.</h2>
              <p>
                This little page is for your partner to plan your next date.
                <br />
                Their invitation will arrive in your email.
              </p>
            </div>
          ) : success ? (
            <div className="success-state">
              <Check className="mx-auto text-primary" size={35} />
              <h2>It’s a date.</h2>
              <p role="status">Your date request has been sent!</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setRequestId(null);
                  setLocked(false);
                  setTime('');
                  setDate('');
                  setDestination('');
                  setAdditional('');
                  setCustom('');
                }}
              >
                Plan another date
                <ArrowRight />
              </Button>
            </div>
          ) : (
            <form className="date-form" onSubmit={submit}>
              <fieldset disabled={busy || locked}>
                <div className="field">
                  <label htmlFor="date">When shall we go?</label>
                  <input
                    id="date"
                    type="date"
                    min={tomorrow()}
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <fieldset>
                  <legend>A time of day</legend>
                  <div className="radio-group">
                    {(Object.keys(TIME_OPTIONS) as (keyof typeof TIME_OPTIONS)[]).map((c) => (
                      <label key={c}>
                        <input
                          type="radio"
                          name="category"
                          checked={category === c}
                          onChange={() => {
                            setCategory(c);
                            setTime('');
                          }}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                  <div className="radio-group mt-3">
                    {TIME_OPTIONS[category].map((t) => (
                      <label key={t}>
                        <input
                          type="radio"
                          name="time"
                          required
                          checked={time === t}
                          onChange={() => setTime(t)}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>What do you have in mind?</legend>
                  <div className="radio-group activity-options">
                    {ACTIVITIES.map((a) => (
                      <label key={a}>
                        <input
                          type="radio"
                          name="activity"
                          checked={activity === a}
                          onChange={() => setActivity(a)}
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {activity === 'Other' && (
                  <div className="field">
                    <label htmlFor="custom">Your idea</label>
                    <input
                      id="custom"
                      maxLength={300}
                      required
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="Tell me what you’re dreaming of"
                    />
                  </div>
                )}
                <div className="field">
                  <label htmlFor="destination">Where shall we meet?</label>
                  <input
                    id="destination"
                    maxLength={300}
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="A favorite place, or somewhere new"
                  />
                </div>
                <div className="field">
                  <label htmlFor="additional">
                    A little extra wish <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    id="additional"
                    maxLength={2000}
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                    placeholder="Anything else you’d love for our date…"
                  />
                </div>
              </fieldset>
              {error && (
                <p role="alert" className="form-message form-error">
                  {error}
                </p>
              )}
              <Button type="submit" className="login-submit" disabled={busy}>
                {busy ? (
                  <>
                    <span>Sending your invitation…</span>
                    <LoaderCircle className="animate-spin" />
                  </>
                ) : (
                  <>
                    <span>{locked ? 'Retry this invitation' : 'Send my invitation'}</span>
                    <ArrowRight />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </Shell>
  );
}
