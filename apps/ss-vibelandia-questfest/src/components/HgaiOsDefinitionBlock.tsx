import { Link } from 'react-router-dom';
import {
  HGAI_OS_BOUNDARY_HEAD,
  HGAI_OS_BRIDGE_LINK_LABEL,
  HGAI_OS_DEFINITION,
  HGAI_OS_IS,
  HGAI_OS_IS_NOT,
  HGAI_OS_LAYERS,
  HGAI_OS_LAYERS_INTRO,
  HGAI_OS_TITLE,
} from '@/lib/goldilocksOsPlainSpeak';

type HgaiOsDefinitionBlockProps = {
  /** Listen footer — definition + layer summary; boundaries on Bridge only. */
  variant?: 'compact' | 'full';
};

export function HgaiOsDefinitionBlock({ variant = 'full' }: HgaiOsDefinitionBlockProps) {
  const compact = variant === 'compact';

  return (
    <section
      className={`jb-hgai-os${compact ? ' jb-hgai-os--compact' : ''}`}
      aria-label="Holographic Goldilocks AI OS definition"
      id="hgai-os-definition"
    >
      <h2 className="jb-hgai-os__title">{HGAI_OS_TITLE}</h2>
      <p className="jb-hgai-os__def">{HGAI_OS_DEFINITION}</p>

      <p className="jb-hgai-os__layers-intro">{HGAI_OS_LAYERS_INTRO}</p>
      <ul className="jb-hgai-os__layers">
        {HGAI_OS_LAYERS.map((layer) => (
          <li key={layer.id} className="jb-hgai-os__layer">
            <h3 className="jb-hgai-os__layer-label">{layer.label}</h3>
            <dl className="jb-hgai-os__layer-grid">
              <div>
                <dt>Holographic</dt>
                <dd>{layer.holographic}</dd>
              </div>
              <div>
                <dt>Goldilocks</dt>
                <dd>{layer.goldilocks}</dd>
              </div>
              <div>
                <dt>AI OS</dt>
                <dd>{layer.aiOs}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {!compact ? (
        <div className="jb-hgai-os__boundaries">
          <h3 className="jb-hgai-os__boundary-head">{HGAI_OS_BOUNDARY_HEAD}</h3>
          <div className="jb-hgai-os__boundary-cols">
            <div>
              <h4 className="jb-hgai-os__boundary-sub">Is</h4>
              <ul>
                {HGAI_OS_IS.map((line) => (
                  <li key={line.slice(0, 40)}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="jb-hgai-os__boundary-sub">Is not</h4>
              <ul>
                {HGAI_OS_IS_NOT.map((line) => (
                  <li key={line.slice(0, 40)}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="jb-hgai-os__bridge-link">
          <Link to="/bridge#hgai-os-definition">{HGAI_OS_BRIDGE_LINK_LABEL}</Link>
          {' — '}
          includes honesty boundaries.
        </p>
      )}
    </section>
  );
}
