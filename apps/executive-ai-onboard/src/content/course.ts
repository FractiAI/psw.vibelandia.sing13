export type LearnerPath = 'executive' | 'technical' | 'familiar' | 'curious';

export type ModuleId =
  | 'welcome'
  | 'm1-history'
  | 'm2-stack'
  | 'm3-ml'
  | 'm4-tradeoffs'
  | 'm5-fractal-holo'
  | 'm6-compare'
  | 'm7-axes'
  | 'm8-enterprise'
  | 'completion';

export interface CourseModule {
  id: ModuleId;
  title: string;
  subtitle: string;
  minutes: number;
  objectives: string[];
}

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    subtitle: 'Set the frame',
    minutes: 3,
    objectives: ['Meet the experience', 'Choose your lens', 'Preview the journey'],
  },
  {
    id: 'm1-history',
    title: 'Why AI Looks the Way It Does',
    subtitle: 'Historical evolution',
    minutes: 6,
    objectives: ['Trace AI eras', 'Place today in context', 'Recognize paradigm shifts'],
  },
  {
    id: 'm2-stack',
    title: "Today's AI Technology Stack",
    subtitle: 'End-to-end architecture',
    minutes: 8,
    objectives: ['Map the full pipeline', 'Understand data → inference', 'Connect layers to products'],
  },
  {
    id: 'm3-ml',
    title: 'Machine Learning Under the Hood',
    subtitle: 'How models learn',
    minutes: 8,
    objectives: ['Compare learning paradigms', 'Grasp neural mechanics', 'See optimization in action'],
  },
  {
    id: 'm4-tradeoffs',
    title: 'Strengths & Struggles',
    subtitle: 'Enterprise reality',
    minutes: 8,
    objectives: ['Name current capabilities', 'Identify bottlenecks', 'Evaluate tradeoffs'],
  },
  {
    id: 'm5-fractal-holo',
    title: 'Fractal-Holographic Foundations',
    subtitle: 'Proposed architecture',
    minutes: 8,
    objectives: ['Understand fractal organization', 'Grasp holographic encoding', 'Separate science from proposal'],
  },
  {
    id: 'm6-compare',
    title: 'Paradigm Comparison',
    subtitle: 'Current vs proposed',
    minutes: 8,
    objectives: ['Contrast architectures', 'Explore implications', 'Build mental models'],
  },
  {
    id: 'm7-axes',
    title: 'Three Axes of Intelligence',
    subtitle: 'Data · Fractal · Holographic',
    minutes: 8,
    objectives: ['See intelligence as layered', 'Connect axes to emergence', 'Inspect relationships'],
  },
  {
    id: 'm8-enterprise',
    title: 'Enterprise Implications',
    subtitle: 'Strategy & governance',
    minutes: 5,
    objectives: ['Explore use cases', 'Plan AI-native orgs', 'Ground responsible AI'],
  },
  {
    id: 'completion',
    title: 'Executive Summary',
    subtitle: 'Synthesis & next steps',
    minutes: 4,
    objectives: ['Recap key ideas', 'Visualize the shift', 'Choose your next module'],
  },
];

export const TOTAL_MINUTES = COURSE_MODULES.reduce((s, m) => s + m.minutes, 0);

export const MODULE_ORDER: ModuleId[] = COURSE_MODULES.map((m) => m.id);

export function moduleIndex(id: ModuleId): number {
  return MODULE_ORDER.indexOf(id);
}

export function moduleAt(index: number): CourseModule | undefined {
  return COURSE_MODULES[index];
}

export const GLOSSARY: Record<string, string> = {
  Transformer:
    'Neural architecture using self-attention to model relationships across sequences — foundation of modern LLMs.',
  Embedding:
    'Dense vector representation capturing semantic meaning; enables similarity search and model input.',
  RAG: 'Retrieval-Augmented Generation — fetch relevant documents at inference time to ground responses.',
  'Foundation Model':
    'Large pre-trained model adapted via fine-tuning or prompting for many downstream tasks.',
  Hallucination:
    'Confident but incorrect model output — a key limitation of probabilistic generation.',
  Fractal:
    'Self-similar recursive structure — patterns repeat at multiple scales (proposed organizational principle).',
  Holographic:
    'Distributed encoding where parts contain information about the whole (proposed representation principle).',
  MCP: 'Model Context Protocol — standard for connecting AI models to tools and data sources.',
  'Fine-tuning': 'Additional training on domain data to specialize a foundation model.',
  'Vector database': 'Storage optimized for similarity search over embeddings.',
};

export const NEXT_COURSE = {
  title: 'Fractal-Holographic Intelligence 201',
  subtitle: 'Mathematical Foundations',
  status: 'Coming soon',
};
