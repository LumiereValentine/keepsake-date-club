import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shell } from '@/features/anniversary/Shell';
import { content, pageHead } from '@/features/anniversary/content';
import { anniversaryClock } from '@/features/anniversary/rules';
import { membershipQuery, mediaQuery } from '@/features/anniversary/queries';
import { MediaViewer } from '@/features/anniversary/MediaViewer';
export const Route = createFileRoute('/_authenticated/home')({
  head: () =>
    pageHead('Our story', 'Our anniversary, our memories, and all the days still to come.'),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membershipQuery);
    await context.queryClient.ensureQueryData(mediaQuery);
  },
  component: Home,
});
function Home() {
  const { data: media } = useSuspenseQuery(mediaQuery);
  const [clock, setClock] = useState(() => anniversaryClock());
  const [viewer, setViewer] = useState<string | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setClock(anniversaryClock()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Shell>
      <main>
        <section className="home-hero">
          <img src={content.photo} alt="A quiet moment together beside the sea" />
          <div>
            <div className="eyebrow">You &amp; me · Since 2020</div>
            <h1>{content.heading}</h1>
            <p className="hero-date">Our story began on 24 March 2020.</p>
            {clock.anniversary ? (
              <p className="signature">Happy anniversary, my love.</p>
            ) : (
              <>
                <p className="eyebrow mt-8">Until our next chapter · 24 March {clock.nextYear}</p>
                <div className="clock">
                  {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                    <div key={unit}>
                      <strong>{String(clock[unit]).padStart(2, '0')}</strong>
                      <span>{unit}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="duration">
              {clock.duration.years} years, {clock.duration.months} months &amp;{' '}
              {clock.duration.days} days of choosing each other.
            </p>
          </div>
        </section>
        <section className="section-inner story-layout">
          <img
            className="story-photo"
            src={content.photo}
            alt="Together, overlooking the coastline"
            loading="lazy"
          />
          <div>
            <div className="eyebrow">01 / The beginning of everything</div>
            <h2 className="section-title">Our Story</h2>
            <div className="eyebrow mb-6">24 March 2020</div>
            <p className="story-body">{content.story}</p>
            <p className="signature">And I’d choose you, all over again.</p>
          </div>
        </section>
        <section className="memories-band">
          <div className="section-inner">
            <div className="section-heading">
              <div>
                <div className="eyebrow">02 / Little moments, forever memories</div>
                <h2 className="section-title mb-0">Pictures &amp; Videos</h2>
              </div>
              <Button variant="link" asChild>
                <Link to="/gallery">
                  View All Memories
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            {media.length ? (
              <>
                <div id="home-memories" className="preview-scroll">
                  {media.slice(0, 8).map((m) => (
                    <Button
                      key={m.id}
                      variant="ghost"
                      className="preview-item p-0 h-auto"
                      onClick={() => setViewer(m.id)}
                    >
                      {m.media_type === 'video' && !m.thumbnail_path ? (
                        <video src={m.preview} preload="metadata" />
                      ) : (
                        <img src={m.preview} alt={m.caption || 'Our memory'} loading="lazy" />
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous memories"
                    onClick={() =>
                      document
                        .getElementById('home-memories')
                        ?.scrollBy({ left: -300, behavior: 'smooth' })
                    }
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next memories"
                    onClick={() =>
                      document
                        .getElementById('home-memories')
                        ?.scrollBy({ left: 300, behavior: 'smooth' })
                    }
                  >
                    <ArrowRight />
                  </Button>
                </div>
              </>
            ) : (
              <div className="preview-scroll">
                <img
                  src={content.photo}
                  alt="A photograph to begin our story"
                  className="h-72 w-60 object-cover"
                  loading="lazy"
                />
                <div className="self-center p-8">
                  <h3 className="text-3xl">A home for our memories.</h3>
                  <p className="text-muted-foreground mt-4 text-sm">
                    Our first memory is waiting to be added.
                  </p>
                  <Button asChild variant="link" className="px-0 mt-4">
                    <Link to="/gallery">
                      Add our first memory
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="invitation">
          <img src={content.photo} alt="An evening together at the coast" loading="lazy" />
          <div>
            <div className="eyebrow text-champagne">03 / Make time for us</div>
            <h2>
              My favorite plan?
              <br />
              You.
            </h2>
            <p>A little adventure. A familiar place. Another memory together.</p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/date">
                Plan Our Date
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      {viewer && <MediaViewer items={media} id={viewer} onClose={() => setViewer(null)} />}
    </Shell>
  );
}
