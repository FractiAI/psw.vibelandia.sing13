from pathlib import Path
import os
import re
import shutil

root = Path('/Users/4d/HermesWorkspace/psw.vibelandia.sing13/docs')
fixed = {'README.md','INDEX_BY_TOPIC.md','INDEX_BY_LIFECYCLE.md','LEGACY_INDEX.md','OPENROUTER_LATTICE_EXPERIMENT.md'}

def category(name):
    if name in fixed:
        return None
    if name.startswith(('ARCHITECTURE_', 'LATTICE_NOAHS_', 'LATTICE_OMNI_', 'SYNTHEVERSE_')):
        return 'architecture'
    if name.startswith(('SYNTHOBS_', 'GOLDILOCKS_', 'RECURSIVE_ATTENTION_', 'LATTICE_TOKEN_REDUCTION_')):
        return 'research/synthobs'
    if name.startswith(('DIGITAL_PRU_', 'DPH_', 'FRACTIAI_', 'EGS_')):
        return 'research/digital-pru'
    if name.startswith(('TURNER_', 'GEOMAGNETIC_')):
        return 'research/turner'
    if name.startswith(('KING_', 'SURFACE_', 'LATTICE_VIBE_', 'HHF_')):
        return 'product'
    if name.startswith(('VERCEL_', 'COHERENCE_', 'AWARENESS_', 'JJ_')):
        return 'operations'
    return 'archive'

files = [p for p in root.glob('*.md') if p.name not in fixed]
mapping = {p.relative_to(root).as_posix(): (Path(category(p.name)) / p.name).as_posix() for p in files}
link_re = re.compile(r'(\]\()([^)#][^)]*)(\))')
for p in files + [root / n for n in fixed if (root / n).exists()]:
    old_rel = p.relative_to(root).as_posix()
    new_rel = mapping.get(old_rel, old_rel)
    text = p.read_text(encoding='utf-8')
    source_dir = Path(new_rel).parent
    def repl(m):
        target = m.group(2)
        if target.startswith(('http://','https://','mailto:','/')):
            return m.group(0)
        if '#' in target:
            target_path, suffix = target.split('#', 1)
        else:
            target_path, suffix = target, ''
        if target_path.startswith(('../','./')) or target_path.endswith('.md'):
            resolved = (p.parent / target_path).resolve()
            try:
                old_target = resolved.relative_to(root.resolve()).as_posix()
            except ValueError:
                return m.group(0)
            if old_target in mapping:
                rewritten = Path(mapping[old_target])
                rel = Path(os.path.relpath(rewritten, source_dir)).as_posix()
                if not rel.startswith('.'):
                    rel = './' + rel
                if suffix:
                    rel += '#' + suffix
                return m.group(1) + rel + m.group(3)
        return m.group(0)
    updated = link_re.sub(repl, text)
    if updated != text:
        p.write_text(updated, encoding='utf-8')

for old, new in mapping.items():
    src, dst = root / old, root / new
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(src, dst)

print(f'moved={len(mapping)}')
for k in sorted(set(Path(v).parent.as_posix() for v in mapping.values())):
    print(k)
