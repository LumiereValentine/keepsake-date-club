// import couple from '@/assets/couple.asset.json';
// export const content = { name: 'Always, Us', monogram: 'Y & M', coupleNames: 'You & Me', photo: couple.url, heading: 'Every day. Every version. Always, us.', story: 'Some stories are written in grand gestures. Ours lives in the little things — conversations that last a little longer, familiar laughter, and the quiet comfort of being together. Since 24 March 2020, we have been writing our story, one ordinary, extraordinary day at a time.', closing: 'Of all the places life could take us, my favorite will always be beside you.' };
// export function pageHead(title: string, description: string) { return { meta: [{title: `${title} · Always, Us`}, {name:'description',content:description}, {property:'og:title',content:`${title} · Always, Us`}, {property:'og:description',content:description}, {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary_large_image'}, {name:'robots',content:'noindex, nofollow'}] }; }

export const content = {
  name: 'Always, Us',
  monogram: 'G & N',
  coupleNames: 'You & Me',
  loginPhoto: '/images/Login.jpg',
  photo: '/__l5e/assets-v1/b3fd1331-c4bd-433e-99ae-a702336c2ffe/anniversary-couple.jpg',
  heading: 'Every day. Every version. Always, us.',
  story:
    'Some stories are written in grand gestures. Ours lives in the little things — conversations that last a little longer, familiar laughter, and the quiet comfort of being together. Since 24 March 2020, we have been writing our story, one ordinary, extraordinary day at a time.',
  closing: 'Of all the places life could take us, my favorite will always be beside you.',
};

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} · Always, Us` },
      { name: 'description', content: description },
      { property: 'og:title', content: `${title} · Always, Us` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  };
}
