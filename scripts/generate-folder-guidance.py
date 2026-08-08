from pathlib import Path

ROOT = Path('/Users/4d/HermesWorkspace/psw.vibelandia.sing13')
EXCLUDED = {'.git', 'node_modules', '.vite', '.vite-temp', '__pycache__', 'output', 'dist', 'build', '.cache'}

PROJECT_AGENTS = '''# Repository guidance

This directory is part of the SING13 Edge repository. Preserve the repository's Seed:Edge separation, honesty boundaries, and no-secret policy. Read the nearest parent guidance before editing. Keep generated artifacts reproducible and do not modify unrelated files.
'''
PROJECT_README = '''# Directory guide

This directory is part of the SING13 Edge repository. See the nearest `README.md` and `AGENTS.md` for local conventions. Source files should remain small, reproducible, and aligned with the repository's existing architecture.
'''


def skip(path: Path) -> bool:
    return any(part in EXCLUDED for part in path.parts)


def content_for(directory: Path) -> tuple[str, str]:
    rel = directory.relative_to(ROOT).as_posix() if directory != ROOT else '.'
    if rel == '.':
        return ('# SING13 Edge repository guidance\n\nThis root contains the SING13 Edge source, interfaces, research suites, documentation, data, and verification assets. Preserve existing architecture and read `AGENTS.md` before editing.\n', '# SING13 Edge\n\nSING13 Edge is a lite-edge Sonic Singularity project containing Lattice Chat, Questfest interfaces, research suites, protocols, and reproducible verification artifacts. Start with `AGENTS.md`, `README.md`, and `docs/README.md`.\n')
    return (PROJECT_AGENTS.replace('This directory', f'This `{rel}` directory'), PROJECT_README.replace('This directory', f'This `{rel}` directory'))

for directory in [ROOT] + sorted(p for p in ROOT.rglob('*') if p.is_dir() and not skip(p)):
    agents, readme = content_for(directory)
    if not (directory / 'AGENTS.md').exists():
        (directory / 'AGENTS.md').write_text(agents)
    if not (directory / 'README.md').exists():
        (directory / 'README.md').write_text(readme)

# Replace generic docs subfolder guides with useful local navigation.
docs = ROOT / 'docs'
local = {
    'architecture': ('# Architecture documents\n\nSystem architecture, Lattice topology, nested-agent design, and Syntheverse architecture documents.\n', '# Architecture\n\nDocuments describing the repository architecture, Lattice layers, nested agents, and system composition.\n'),
    'research': ('# Research documents\n\nResearch documentation is grouped by empirical family. See `synthobs/`, `digital-pru/`, and `turner/`.\n', '# Research documentation\n\nResearch source notes and publication-facing documents are organized by research family.\n'),
    'research/synthobs': ('# SynthOBS guidance\n\nSynthOBS documents describe empirical experiment families, formal claims, protocols, and limitations. Pair each document with its corresponding `research/synthobs-*` source suite when available.\n', '# SynthOBS documents\n\nOrganized SynthOBS research documents. Experimental source, data, and scripts live under the matching `research/synthobs-*` directory.\n'),
    'research/digital-pru': ('# Digital PRU guidance\n\nDigital PRU and FractAI technical documents. Preserve explicit claim boundaries and distinguish protocol proposals from measured results.\n', '# Digital PRU documents\n\nDigital PRU, EGS, DPH, and FractAI technical documentation.\n'),
    'research/turner': ('# Turner research guidance\n\nTurner, geomagnetic, bison, and related research documents. Preserve source provenance and conservative interpretation.\n', '# Turner documents\n\nTurner and geomagnetic research notes and whitepapers.\n'),
    'product': ('# Product documentation guidance\n\nProduct, surface, share-pack, and launch-facing documents. Keep product claims consistent with implemented interfaces.\n', '# Product documents\n\nProduct surfaces, share packs, launch briefs, and related public-facing documentation.\n'),
    'operations': ('# Operations documentation guidance\n\nRunbooks, honesty standards, reviews, and operational notes. Never place credentials or connection strings in documentation.\n', '# Operations documents\n\nRunbooks, review records, honesty standards, and operational guidance.\n'),
    'archive': ('# Archive guidance\n\nHistorical or uncategorized documents retained for provenance. Prefer adding new documents to a specific topical folder.\n', '# Archive\n\nHistorical documents retained for provenance and backward reference.\n'),
    'manuscript': ('# Manuscript guidance\n\nThe manuscript is a modular IMRAD document. Ordered Markdown sections, generated variables, figures, and renderer outputs are kept together. Run the template renderer from the template repository.\n', '# Manuscript\n\nModular IMRAD manuscript source, generated variables, figures, and render outputs.\n'),
}
for rel, (agents, readme) in local.items():
    directory = docs / rel
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'AGENTS.md').write_text(agents)
    (directory / 'README.md').write_text(readme)
print('guidance generated')
