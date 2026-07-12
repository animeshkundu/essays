import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Paper / ink palette — kept in lockstep with src/styles/global.css (light theme).
const PAPER = '#F7F3EC';
const INK = '#1B1B18';
const MUTED = '#6B6459';
const ACCENT = '#A8462E';
const LINE = '#E4DCCB';

const WIDTH = 1200;
const HEIGHT = 630;

const require = createRequire(import.meta.url);

function fontFile(pkgFile: string) {
  return readFileSync(require.resolve(pkgFile));
}

type OgFont = { name: string; data: Buffer; weight: 400 | 600; style: 'normal' };

// Loaded once per build, reused across every generated card.
let fontsCache: OgFont[] | undefined;
function fonts(): OgFont[] {
  if (!fontsCache) {
    fontsCache = [
      { name: 'Newsreader', data: fontFile('@fontsource/newsreader/files/newsreader-latin-400-normal.woff'), weight: 400, style: 'normal' },
      { name: 'Newsreader', data: fontFile('@fontsource/newsreader/files/newsreader-latin-600-normal.woff'), weight: 600, style: 'normal' },
      { name: 'Inter', data: fontFile('@fontsource/inter/files/inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
    ];
  }
  return fontsCache;
}

export interface OgCard {
  kicker: string;
  title: string;
  meta: string;
}

// A plain-object element tree (satori's no-JSX form).
function node(type: string, style: Record<string, unknown>, children?: unknown) {
  return { type, props: { style, ...(children !== undefined ? { children } : {}) } };
}

function template({ kicker, title, meta }: OgCard) {
  return node(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '84px 96px',
      backgroundColor: PAPER,
      backgroundImage: `radial-gradient(1100px circle at 0% 0%, ${LINE} 0%, rgba(228,220,203,0) 46%)`,
      fontFamily: 'Newsreader',
      color: INK,
    },
    [
      // Kicker: a short rust rule above a letterspaced label.
      node('div', { display: 'flex', flexDirection: 'column' }, [
        node('div', { width: 68, height: 3, backgroundColor: ACCENT, marginBottom: 26 }),
        node(
          'div',
          {
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: MUTED,
          },
          kicker,
        ),
      ]),
      // Title.
      node(
        'div',
        {
          display: 'flex',
          fontSize: 74,
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: INK,
          maxWidth: 940,
        },
        title,
      ),
      // Footer: wordmark + meta, over a hairline.
      node(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderTop: `1px solid ${LINE}`,
          paddingTop: 30,
        },
        [
          node('div', { fontFamily: 'Newsreader', fontSize: 30, fontWeight: 400, color: INK }, 'Animesh Kundu'),
          node('div', { fontFamily: 'Inter', fontSize: 22, fontWeight: 600, letterSpacing: '0.02em', color: MUTED }, meta),
        ],
      ),
    ],
  );
}

export async function renderOgPng(card: OgCard): Promise<Buffer> {
  const svg = await satori(template(card) as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts(),
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}
