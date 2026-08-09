# Manuscript Preamble

```latex
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amsfonts}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{array}
\usepackage{graphicx}
\usepackage[margin=0.55in]{geometry}
\usepackage{float}
\usepackage{xcolor}
\usepackage{microtype}
\usepackage{etoolbox}
\AtBeginEnvironment{longtable}{\scriptsize}
\usepackage{hyperref}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric,fit,calc}
\definecolor{latticeblue}{HTML}{2563EB}
\definecolor{standardorange}{HTML}{EA580C}
\definecolor{naivegreen}{HTML}{16A34A}
```

The manuscript uses Mermaid source blocks for architecture diagrams and repository-relative SVG figures for measured results. The rendering infrastructure may convert Mermaid blocks according to its configured filter set; the static SVG files are the authoritative empirical figures.
