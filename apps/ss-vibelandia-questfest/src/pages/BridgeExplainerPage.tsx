import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BRIDGE_CTA_LISTEN,
  BRIDGE_CTA_UPLOAD,
  BRIDGE_HONESTY_NOTE,
  BRIDGE_PAGE_EYEBROW,
  BRIDGE_PAGE_LEAD,
  BRIDGE_PAGE_TITLE,
  BRIDGE_SECTIONS,
} from '@/lib/sonicBridgeCopy';
import { HgaiOsDefinitionBlock } from '@/components/HgaiOsDefinitionBlock';
import { SONIC_SINGULARITY_HERO_SRC, SONIC_SINGULARITY_TAGLINE } from '@/lib/sonicCatalogCopy';

export function BridgeExplainerPage() {
  useEffect(() => {
    document.documentElement.classList.add('jb-bridge-page');
    return () => document.documentElement.classList.remove('jb-bridge-page');
  }, []);

  return (
    <div className="jb-bridge">
      <header className="jb-top jb-top--slim">
        <nav className="jb-nav" aria-label="Site">
          <a href="/questfest" className="jb-nav__link">
            Bridge
          </a>
          <span aria-hidden="true">·</span>
          <a href="/about/reno-holographic-swamp-beats-caliente" className="jb-nav__link">
            About
          </a>
          <span aria-hidden="true">·</span>
          <Link to="/listen">Jukebox</Link>
          <span aria-hidden="true">·</span>
          <Link to="/dj">DJ</Link>
        </nav>
        <p className="jb-eyebrow">{BRIDGE_PAGE_EYEBROW}</p>
        <p className="jb-tagline jb-tagline--slim">{SONIC_SINGULARITY_TAGLINE}</p>
      </header>

      <main className="jb-bridge__main">
        <div className="jb-bridge__hero">
          <img
            src={SONIC_SINGULARITY_HERO_SRC}
            alt="Sonic Singularity nesting poster — Holographic Goldilocks Sonic Ship"
            width={1200}
            height={675}
            decoding="async"
          />
        </div>

        <h1 className="jb-bridge__title">{BRIDGE_PAGE_TITLE}</h1>
        <p className="jb-bridge__lead">{BRIDGE_PAGE_LEAD}</p>

        <HgaiOsDefinitionBlock variant="full" />

        {BRIDGE_SECTIONS.map((section) => (
          <section key={section.id} className="jb-bridge__section" id={section.id}>
            <h2 className="jb-bridge__section-title">{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="jb-bridge__p">
                {p}
              </p>
            ))}
          </section>
        ))}

        <p className="jb-bridge__honesty">{BRIDGE_HONESTY_NOTE}</p>

        <div className="jb-bridge__cta">
          <Link to="/listen" className="jb-link-btn jb-link-btn--primary">
            {BRIDGE_CTA_LISTEN}
          </Link>
          <Link to="/dj" className="jb-link-btn">
            {BRIDGE_CTA_UPLOAD}
          </Link>
          <a href="/lattice-chat?nest=octave99" className="jb-link-btn">
            99 Octave Lattice Chat Agent
          </a>
          <a href="/octave99-bridge" className="jb-link-btn">
            Omni-Lattice Bridge
          </a>
          <a href="/octave99-chart" className="jb-link-btn">
            99 Octave Chart
          </a>
          <a href="/whitepaper/synthobs-99-octave-digits-master" className="jb-link-btn">
            99 Octave Master Treatise
          </a>
        </div>
      </main>
    </div>
  );
}
