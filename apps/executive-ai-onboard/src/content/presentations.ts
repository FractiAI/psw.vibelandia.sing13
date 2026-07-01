import type { ModuleId } from './course';

export interface DetailCardData {
  id: string;
  title: string;
  summary: string;
  detail: string;
  bullets?: string[];
  tier?: 'verified' | 'operational' | 'proposed';
}

export interface PresentationSection {
  id: string;
  title: string;
  narrative: string;
  cards: DetailCardData[];
  insight?: string;
}

export interface ModulePresentation {
  moduleId: ModuleId;
  presentationMinutes: number;
  opening: string;
  closing: string;
  sections: PresentationSection[];
}

export const MODULE_PRESENTATIONS: Record<string, ModulePresentation> = {
  'm1-history': {
    moduleId: 'm1-history',
    presentationMinutes: 7,
    opening:
      'Modern AI did not appear overnight. It is the product of seven overlapping waves — each solving the failure mode of the last. This presentation gives you the causal chain executives use when evaluating hype, risk, and timing.',
    closing:
      'You now have the historical spine. The practice quiz reinforces era order and the strategic inflection points that still shape vendor roadmaps today.',
    sections: [
      {
        id: 'm1-s1',
        title: 'From rules to data',
        narrative:
          'Early AI tried to encode human knowledge as explicit rules. It worked in narrow domains but collapsed under real-world ambiguity. The industry then shifted from "tell the machine what to think" to "show the machine what happened."',
        cards: [
          {
            id: 'm1-c-symbolic',
            title: 'Symbolic AI & expert systems',
            summary: 'Logic, hand-written rules, and knowledge bases (1950s–1980s).',
            detail:
              'Symbolic systems represented knowledge as if-then rules and ontologies. They were interpretable and auditable — valuable in regulated workflows — but brittle: every edge case required another rule, and maintenance cost grew faster than capability.',
            bullets: [
              'Strength: transparency and deterministic behavior in closed domains',
              'Weakness: poor generalization; knowledge engineering bottleneck',
              'Legacy footprint: rules engines still appear in underwriting and compliance',
            ],
            tier: 'verified',
          },
          {
            id: 'm1-c-stat',
            title: 'Statistical learning rise',
            summary: 'Probability replaces pure logic (1990s).',
            detail:
              'Instead of encoding all knowledge, systems learned distributions from data. Spam filters, speech recognition prototypes, and early recommender systems demonstrated that data scale could beat handcrafted rule sets for messy real-world inputs.',
            bullets: [
              'Key shift: optimize likelihood, not logical completeness',
              'Enabler: digitization of records and falling storage cost',
              'Executive signal: data assets became as important as algorithms',
            ],
            tier: 'verified',
          },
        ],
        insight: 'The first strategic pivot: competitive advantage moved from rule craftsmanship to data access and labeling discipline.',
      },
      {
        id: 'm1-s2',
        title: 'Learning machines take over',
        narrative:
          'Machine learning formalized the idea that performance improves with experience. Deep learning later showed that representation learning could be stacked — the machine discovers features instead of humans engineering them.',
        cards: [
          {
            id: 'm1-c-ml',
            title: 'Machine learning era',
            summary: 'Algorithms that improve with examples (2000s).',
            detail:
              'Supervised learning dominated enterprise adoption: classify, predict, rank. Organizations built ML teams, feature stores, and offline training pipelines. Success depended on problem framing, label quality, and deployment monitoring.',
            tier: 'verified',
          },
          {
            id: 'm1-c-deep',
            title: 'Deep learning breakthrough',
            summary: 'Multi-layer networks + GPUs reshape vision and speech (2012+).',
            detail:
              'Deep networks learned hierarchical representations — edges → shapes → objects. GPU parallelism made training feasible. ImageNet-scale benchmarks proved sudden capability jumps, triggering massive investment in neural approaches across industries.',
            bullets: [
              'Convolutional networks transformed vision-heavy industries',
              'Recurrent networks advanced sequence modeling before transformers',
              'Lesson: architecture + compute + data together create phase shifts',
            ],
            tier: 'verified',
          },
        ],
      },
      {
        id: 'm1-s3',
        title: 'The transformer era',
        narrative:
          'Transformers replaced sequential recurrence with attention — every token can directly reference every other token. At sufficient scale, this architecture became the foundation for general-purpose language and multimodal systems.',
        cards: [
          {
            id: 'm1-c-transformer',
            title: 'Transformers (2017)',
            summary: 'Attention is all you need — parallelizable sequence modeling.',
            detail:
              'Self-attention computes relationships across an entire context window simultaneously. This enabled better long-range dependency modeling and efficient training on large corpora. The same core block now powers text, code, image, and audio models.',
            bullets: [
              'Attention maps: which inputs matter for each output',
              'Training scale: billions of parameters became normal',
              'Implication: pre-training cost is front-loaded; inference becomes product margin question',
            ],
            tier: 'verified',
          },
          {
            id: 'm1-c-foundation',
            title: 'Foundation models',
            summary: 'Pre-train once, adapt many ways (2020s).',
            detail:
              'Foundation models are large models trained on broad data, then specialized via fine-tuning, retrieval, or prompting. They shift AI from bespoke per-task models to a platform layer — but introduce dependency on model providers, eval discipline, and safety guardrails.',
            tier: 'operational',
          },
          {
            id: 'm1-c-genai',
            title: 'Generative AI in production',
            summary: 'Creation, not just classification — text, image, code, agents.',
            detail:
              'Generative AI places probabilistic creation at the user interface. Enterprises adopt copilots, support automation, and code assistants. Value is real, but so are hallucination risk, IP questions, and the need for human-in-the-loop verification on high-stakes outputs.',
            tier: 'operational',
          },
        ],
        insight: 'Today\'s default stack is transformer-centric because scale + generalization beat narrow expert systems — not because transformers are theoretically final.',
      },
    ],
  },

  'm2-stack': {
    moduleId: 'm2-stack',
    presentationMinutes: 8,
    opening:
      'Enterprise AI is not a model — it is a stack. Each layer has distinct owners, failure modes, and capital intensity. This walkthrough maps the full pipeline from raw data to user-facing applications.',
    closing:
      'Use this map in vendor meetings: ask which layer a product actually owns, and where your organization retains control.',
    sections: [
      {
        id: 'm2-s1',
        title: 'Data foundation',
        narrative:
          'Everything upstream of the model determines the ceiling of trust. Garbage in still means garbage out — now at billion-parameter scale.',
        cards: [
          {
            id: 'm2-c-sources',
            title: 'Data sources',
            summary: 'Structured DBs, documents, APIs, logs, sensors, web corpora.',
            detail:
              'Sources split into structured (tables, CRM, ERP), semi-structured (JSON events, tickets), and unstructured (PDFs, email, chat, images). AI programs fail when source inventory is incomplete or ownership is unclear across business units.',
            bullets: ['Lineage: who created it, when, under what policy', 'Rights: licensing and consent for training vs inference', 'Freshness: stale data produces confident wrong answers'],
            tier: 'operational',
          },
          {
            id: 'm2-c-storage',
            title: 'Storage layer',
            summary: 'Warehouses, lakes, object stores, operational DBs.',
            detail:
              'Warehouses (Snowflake, BigQuery) optimize analytics. Lakes hold raw blobs for flexible processing. Object storage (S3, GCS) backs large file corpora. Vector databases add embedding indexes for semantic retrieval — increasingly a first-class AI storage tier.',
            tier: 'operational',
          },
          {
            id: 'm2-c-pipelines',
            title: 'Pipelines & orchestration',
            summary: 'ETL/ELT, streaming, workflow engines.',
            detail:
              'Pipelines clean, join, deduplicate, and version datasets. Streaming (Kafka, Kinesis) feeds near-real-time features. Orchestrators (Airflow, Dagster) schedule reproducible jobs. Without pipeline discipline, models train on snapshots nobody can reproduce.',
            tier: 'operational',
          },
        ],
        insight: 'Data engineering is not overhead — it is the trust layer for every AI claim you make to customers or regulators.',
      },
      {
        id: 'm2-s2',
        title: 'From features to training',
        narrative:
          'Raw data becomes model input through feature engineering and training infrastructure. This is where capital and carbon costs concentrate.',
        cards: [
          {
            id: 'm2-c-features',
            title: 'Feature engineering',
            summary: 'Transforms, embeddings, aggregations, normalization.',
            detail:
              'Features encode domain knowledge into numeric signals. In modern LLM stacks, tokenization and embedding lookup replace much manual feature work for text — but structured side-features (user tier, account age, product SKU) still matter for ranking and fraud.',
            tier: 'operational',
          },
          {
            id: 'm2-c-training',
            title: 'Training infrastructure',
            summary: 'GPUs, TPUs, distributed clusters, experiment tracking.',
            detail:
              'Training large models requires coordinated accelerators, high-bandwidth networking, and checkpointing. Most enterprises buy foundation models rather than pre-training from scratch — but fine-tuning and distillation still need GPU budgets and MLOps hygiene.',
            bullets: ['H100/A100 clusters for large fine-tunes', 'Experiment tracking: weights, data hash, hyperparameters', 'Failure mode: untracked experiments → un-auditable deployments'],
            tier: 'operational',
          },
        ],
      },
      {
        id: 'm2-s3',
        title: 'Models, inference, applications',
        narrative:
          'The model is the engine; inference is the drivetrain; applications are where revenue and risk meet the user.',
        cards: [
          {
            id: 'm2-c-foundation',
            title: 'Foundation models',
            summary: 'GPT, Claude, Gemini, Llama, domain-tuned variants.',
            detail:
              'Providers expose general reasoning, coding, and multimodal capability. Selection criteria: capability benchmarks, context length, latency, cost per token, data residency, and contractual terms for enterprise use.',
            tier: 'operational',
          },
          {
            id: 'm2-c-inference',
            title: 'Inference serving',
            summary: 'APIs, batch jobs, on-prem, edge.',
            detail:
              'Inference optimizes throughput, latency, and cost via batching, quantization, and specialized runtimes (vLLM, TensorRT). Serving SLAs drive product UX — slow inference kills copilot adoption even when model quality is high.',
            tier: 'operational',
          },
          {
            id: 'm2-c-apps',
            title: 'Application layer',
            summary: 'RAG, agents, MCP tools, memory, fine-tuning.',
            detail:
              'Applications wire models to business context: retrieval over internal docs, tool calls to CRM or ticketing systems, memory across sessions, and guardrails for policy compliance. This layer is where differentiation lives — not in calling the same public API everyone else uses.',
            bullets: ['RAG: ground answers in your corpus', 'Agents: multi-step plans with tool use', 'MCP: standardized tool/data connectors for models'],
            tier: 'operational',
          },
        ],
        insight: 'Buy vs build decisions should be made per layer — not as a single "AI vendor" checkbox.',
      },
    ],
  },

  'm3-ml': {
    moduleId: 'm3-ml',
    presentationMinutes: 7,
    opening:
      'Executives do not need to derive gradients — but they do need to understand what "training" commits the organization to: data, objective, error measurement, and iterative correction.',
    closing:
      'The practice simulator makes loss and learning rate tangible. Connect what you see to budget conversations about data quality and eval design.',
    sections: [
      {
        id: 'm3-s1',
        title: 'Learning paradigms',
        narrative:
          'Different problem shapes require different learning regimes. Modern LLMs combine several — pre-train self-supervised, align supervised, optionally reinforce with human feedback.',
        cards: [
          {
            id: 'm3-c-supervised',
            title: 'Supervised learning',
            summary: 'Labeled input → correct output.',
            detail: 'The model learns a mapping from examples with known answers. Classification (spam/not spam), regression (forecast demand), and instruction fine-tuning all use supervised signals. Label quality and class balance dominate outcomes.',
            tier: 'verified',
          },
          {
            id: 'm3-c-unsupervised',
            title: 'Unsupervised learning',
            summary: 'Structure without labels — clustering, dimensionality reduction.',
            detail: 'Useful for segmentation, anomaly detection, and exploratory analysis. Rarely the final customer-facing layer alone — often feeds downstream supervised models.',
            tier: 'verified',
          },
          {
            id: 'm3-c-rl',
            title: 'Reinforcement learning',
            summary: 'Reward signals shape policy over time.',
            detail: 'RL optimizes sequences of actions (games, robotics, ad bidding). RLHF (reinforcement learning from human feedback) aligns LLMs to human preferences — critical for tone, safety, and usefulness in chat products.',
            tier: 'verified',
          },
          {
            id: 'm3-c-self',
            title: 'Self-supervised learning',
            summary: 'Models create their own training signal from raw data.',
            detail: 'Next-token prediction on vast text corpora is self-supervised: the label is the next word. This is why scale matters — the objective is generic, so breadth of data transfers to many downstream tasks.',
            tier: 'verified',
          },
        ],
      },
      {
        id: 'm3-s2',
        title: 'Neural networks & transformers',
        narrative:
          'Neural networks stack simple units into complex functions. Transformers add attention — dynamic routing of relevance across the input.',
        cards: [
          {
            id: 'm3-c-nn',
            title: 'Neural networks',
            summary: 'Layers of weighted sums + nonlinear activations.',
            detail: 'Each layer transforms representations. Depth enables hierarchical features (syntax → semantics → reasoning patterns). Width and depth trade off against data, compute, and overfitting risk.',
            tier: 'verified',
          },
          {
            id: 'm3-c-attention',
            title: 'Attention mechanism',
            summary: 'Query, key, value — who should listen to whom.',
            detail: 'Attention computes compatibility scores between positions in a sequence. In transformers, multi-head attention runs parallel attention patterns — some heads track syntax, others coreference or long-range dependencies.',
            tier: 'verified',
          },
          {
            id: 'm3-c-embed',
            title: 'Embeddings & tokenization',
            summary: 'Text becomes vectors; vocabulary becomes geometry.',
            detail: 'Tokenizers split text into subword units. Embedding tables map tokens to dense vectors where semantic similarity ≈ geometric proximity. This is the input layer every LLM shares.',
            tier: 'verified',
          },
        ],
      },
      {
        id: 'm3-s3',
        title: 'Optimization loop',
        narrative:
          'Training is repeated guess-and-correct. The loss function defines "wrong"; gradient descent defines "how to adjust."',
        cards: [
          {
            id: 'm3-c-loss',
            title: 'Loss functions',
            summary: 'Single number the model is pressured to minimize.',
            detail: 'Cross-entropy for classification and language modeling. Wrong objective = right optimization of the wrong goal. Executive takeaway: always ask what the model is actually optimized for in production.',
            tier: 'verified',
          },
          {
            id: 'm3-c-gd',
            title: 'Gradient descent',
            summary: 'Small steps opposite the error gradient.',
            detail: 'Backpropagation computes how each weight contributed to loss. Optimizers (Adam, AdamW) adapt step sizes. Learning rate too high → unstable training; too low → slow or stuck convergence.',
            tier: 'verified',
          },
        ],
        insight: 'Model behavior is economics: objective + data + compute. Change any leg, outcomes shift.',
      },
    ],
  },

  'm4-tradeoffs': {
    moduleId: 'm4-tradeoffs',
    presentationMinutes: 7,
    opening:
      'Capable does not mean reliable for every workflow. This section separates demonstrated strengths from structural limitations — the frame for portfolio prioritization and governance.',
    closing:
      'Bring this map to roadmap reviews: match workflow risk profile to capability tier, not demo impressiveness.',
    sections: [
      {
        id: 'm4-s1',
        title: 'Where today\'s AI wins',
        narrative: 'Large generative models excel where pattern density is high, tolerance for error is managed, and humans remain in the loop.',
        cards: [
          {
            id: 'm4-c-pattern',
            title: 'Pattern recognition at scale',
            summary: 'Classification, detection, ranking across massive feature spaces.',
            detail: 'From fraud signals to medical imaging assist, neural models find correlations humans miss. Value compounds when feedback loops retrain on production outcomes.',
            tier: 'verified',
          },
          {
            id: 'm4-c-lang',
            title: 'Language & code generation',
            summary: 'Drafting, summarization, translation, boilerplate code.',
            detail: 'LLMs compress time-to-first-draft for knowledge work. Best ROI when editors verify output and templates constrain format. Weak when factual precision is mandatory without retrieval grounding.',
            tier: 'operational',
          },
          {
            id: 'm4-c-auto',
            title: 'Workflow automation',
            summary: 'Ticket routing, extraction, meeting notes, copilots.',
            detail: 'Automation works when tasks have clear success criteria and rollback paths. Integrations (CRM, ERP, ITSM) determine realized value more than model IQ scores.',
            tier: 'operational',
          },
        ],
      },
      {
        id: 'm4-s2',
        title: 'Structural limitations',
        narrative: 'These are not temporary bugs — they are architectural tradeoffs until retrieval, memory, and eval systems mature.',
        cards: [
          {
            id: 'm4-c-hall',
            title: 'Hallucinations',
            summary: 'Fluent, confident, wrong.',
            detail: 'Generative models optimize plausibility, not truth. Mitigations: RAG with citations, constrained tool use, human approval gates, and automated fact-check pipelines for high-stakes domains.',
            tier: 'verified',
          },
          {
            id: 'm4-c-ctx',
            title: 'Context limits',
            summary: 'Finite attention window per request.',
            detail: 'Even million-token windows do not replace durable memory architecture. Long documents, multi-year cases, and cross-session continuity require external stores and summarization strategies.',
            tier: 'verified',
          },
          {
            id: 'm4-c-cost',
            title: 'Compute & energy',
            summary: 'GPU dependence and inference cost curves.',
            detail: 'Training and inference consume significant energy. CFO-relevant metrics: cost per 1M tokens, cost per resolved ticket, and marginal cost of quality improvements.',
            tier: 'verified',
          },
          {
            id: 'm4-c-mem',
            title: 'Fragmented memory',
            summary: 'RAG patches; does not unify organizational knowledge.',
            detail: 'Vector search retrieves chunks — it does not guarantee global coherence. Duplicate, stale, or conflicting documents surface as duplicate, stale, or conflicting answers.',
            tier: 'operational',
          },
          {
            id: 'm4-c-reason',
            title: 'Long-horizon reasoning',
            summary: 'Multi-step plans drift without scaffolding.',
            detail: 'Agents can loop, forget constraints, or mis-order dependencies. Production systems need checkpoints, tool validation, and explicit state machines for critical workflows.',
            tier: 'operational',
          },
        ],
        insight: 'Risk tiering beats blanket adoption: green / yellow / red workflows by error cost and reversibility.',
      },
    ],
  },

  'm5-fractal-holo': {
    moduleId: 'm5-fractal-holo',
    presentationMinutes: 8,
    opening:
      'Everything so far describes today\'s dominant architecture. Fractal-Holographic Intelligence is a proposed next frame — clearly labeled. This presentation teaches the concepts without claiming industry standard status.',
    closing:
      'Hold two truths: transformers are operational reality; fractal-holographic design is a research direction worth bounded exploration.',
    sections: [
      {
        id: 'm5-s1',
        title: 'Fractal organization principles',
        narrative:
          'Fractal structures repeat meaningful patterns at multiple scales — like org charts, file systems, or nested summaries. The proposal: organize knowledge the same way computation flows.',
        cards: [
          {
            id: 'm5-c-recursive',
            title: 'Recursive hierarchy',
            summary: 'Same organizational logic from document → chapter → corpus.',
            detail: 'Instead of flat chunk stores, knowledge nests: local detail inside regional context inside global themes. Navigation becomes zoom-in/zoom-out rather than single-shot retrieval.',
            tier: 'proposed',
          },
          {
            id: 'm5-c-selfsim',
            title: 'Self-similarity',
            summary: 'Patterns at one scale echo at others.',
            detail: 'Analogies in biology and networks: mycelium, DNS, corporate delegations. Proposal: semantic fields inherit structure so partial views still align with global ontology.',
            tier: 'proposed',
          },
          {
            id: 'm5-c-routing',
            title: 'Dynamic semantic routing',
            summary: 'Route queries to the right scale automatically.',
            detail: 'Not every question needs the whole corpus. Fractal routing sends "policy exception" queries to fine granularity and "strategy" queries to coarse abstractions — reducing noise and token waste.',
            tier: 'proposed',
          },
        ],
      },
      {
        id: 'm5-s2',
        title: 'Holographic representation',
        narrative:
          'Holographic metaphors come from optics: each fragment carries interference patterns of the whole. In knowledge systems, the proposal is distributed encoding with associative reconstruction.',
        cards: [
          {
            id: 'm5-c-distributed',
            title: 'Distributed representation',
            summary: 'Meaning spread across nodes, not one golden document.',
            detail: 'Contrast with single source of truth documents that drift. Holographic encoding suggests redundant, cross-linked representations where updates propagate through coupled fields.',
            tier: 'proposed',
          },
          {
            id: 'm5-c-assoc',
            title: 'Associative memory',
            summary: 'Recall by resonance, not only keyword match.',
            detail: 'Vector similarity is a primitive form. The proposal extends toward multi-hop associative reconstruction — starting from any fragment and rebuilding plausible global context.',
            tier: 'proposed',
          },
          {
            id: 'm5-c-fault',
            title: 'Fault tolerance',
            summary: 'Degraded fragments still yield usable context.',
            detail: 'Like holograms scratched but still readable — organizational memory survives partial data loss or stale subsets better than brittle single-index designs.',
            tier: 'proposed',
          },
        ],
      },
      {
        id: 'm5-s3',
        title: 'Process comparison',
        narrative: 'Traditional pipelines are linear. The proposed cycle is observational and reconstructive.',
        cards: [
          {
            id: 'm5-c-trad',
            title: 'Traditional loop',
            summary: 'Store → Search → Retrieve → Return.',
            detail: 'Optimized for document management and keyword era. LLM+RAG bolts generation on top. Works, but memory remains external and retrieval quality dominates ceiling.',
            tier: 'operational',
          },
          {
            id: 'm5-c-fh',
            title: 'Fractal-Holographic loop (proposed)',
            summary: 'Observe → Organize → Resonate → Reconstruct → Generate.',
            detail: 'Emphasizes continuous organization and context regeneration before generation. Research question: can this reduce hallucination pressure and long-context costs in bounded domains?',
            tier: 'proposed',
          },
        ],
        insight: 'Proposal tier only — validate in pilots before strategic bets. Do not replace proven RAG without evidence.',
      },
    ],
  },

  'm6-compare': {
    moduleId: 'm6-compare',
    presentationMinutes: 7,
    opening:
      'Side-by-side architecture comparison clarifies what you are buying today versus what a research program might explore tomorrow.',
    closing: 'Use the practice dashboard to drill into each row — then tag initiatives as operational or experimental in your portfolio.',
    sections: [
      {
        id: 'm6-s1',
        title: 'Pipeline vs recursive organization',
        narrative: 'The deepest divide is process shape: linear stages versus self-similar nested processing.',
        cards: [
          {
            id: 'm6-c-linear',
            title: 'Linear pipelines (today)',
            summary: 'Ingest → embed → retrieve → prompt → answer.',
            detail: 'Mature tooling, observable stages, clear SLAs per step. Bottlenecks appear at retrieval quality, context assembly, and prompt brittleness.',
            tier: 'operational',
          },
          {
            id: 'm6-c-recursive',
            title: 'Recursive networks (proposed)',
            summary: 'Same organizational operator at multiple scales.',
            detail: 'Hypothesis: recursive indexing maintains coherence as knowledge grows. Engineering cost and eval methodology are open research problems.',
            tier: 'proposed',
          },
          {
            id: 'm6-c-context',
            title: 'Context: centralized vs distributed',
            summary: 'One window vs reconstructed fields.',
            detail: 'Today: stuff documents into a context window. Proposed: assemble context from distributed encodings tuned to query scale. Tradeoff: complexity vs token economics.',
            tier: 'proposed',
          },
        ],
      },
      {
        id: 'm6-s2',
        title: 'Memory and prediction',
        narrative: 'How systems remember and how they produce outputs differ in mechanism and governance implications.',
        cards: [
          {
            id: 'm6-c-mem',
            title: 'Memory architecture',
            summary: 'Bolt-on vector DB vs integrated recursive memory.',
            detail: 'Current: episodic logs + vector stores + fine-tunes. Proposed: memory as first-class topology. Migration path unclear — expect hybrid decades.',
            tier: 'proposed',
          },
          {
            id: 'm6-c-predict',
            title: 'Token prediction vs pattern synthesis',
            summary: 'Next-token likelihood vs emergent completion.',
            detail: 'Transformers excel at local coherence via next-token objectives. Pattern synthesis framing emphasizes global structural fit — aspirational for next-gen systems.',
            tier: 'proposed',
          },
          {
            id: 'm6-c-adapt',
            title: 'Fixed vs adaptive architecture',
            summary: 'Frozen weights vs self-organizing structure.',
            detail: 'Production models are frozen at deploy time (plus RAG). Adaptive proposals suggest topology changes at runtime — high risk, high research reward.',
            tier: 'proposed',
          },
        ],
        insight: 'Near-term roadmap: optimize linear stack. Skunkworks: test recursive memory in one domain with clear falsification criteria.',
      },
    ],
  },

  'm7-axes': {
    moduleId: 'm7-axes',
    presentationMinutes: 7,
    opening:
      'Intelligence systems fail when one dimension is overbuilt and others neglected. The three-axis model keeps data, organization, and representation in balance.',
    closing: 'When evaluating any AI initiative, score it on all three axes — not model parameter count alone.',
    sections: [
      {
        id: 'm7-s1',
        title: 'Axis 1 — Data',
        narrative: 'The substrate: what exists, how it flows, how long it persists, who can access it.',
        cards: [
          {
            id: 'm7-c-collect',
            title: 'Collection & ingestion',
            summary: 'Capture events, documents, telemetry with provenance.',
            detail: 'Without provenance, audits fail. Collection policies must align with GDPR, HIPAA, or sector rules before any embedding job runs.',
            tier: 'operational',
          },
          {
            id: 'm7-c-persist',
            title: 'Persistence & distribution',
            summary: 'Replication, residency, latency to inference.',
            detail: 'Multi-region AI needs data residency strategy. Edge inference needs synchronized subsets — not always the full warehouse.',
            tier: 'operational',
          },
          {
            id: 'm7-c-retrieval',
            title: 'Retrieval discipline',
            summary: 'Indexes, ACLs, freshness SLAs.',
            detail: 'Retrieval must respect permissions — semantic search over all docs is a data leak waiting to happen without document-level security.',
            tier: 'operational',
          },
        ],
      },
      {
        id: 'm7-s2',
        title: 'Axis 2 — Fractal organization',
        narrative: 'How knowledge is nested, abstracted, and navigated across scales.',
        cards: [
          {
            id: 'm7-c-hierarchy',
            title: 'Recursive hierarchy',
            summary: 'Chapters inside books inside libraries — computationally.',
            detail: 'Taxonomies, ontologies, and graph layers are primitive fractal organizers. Proposal extends this with dynamic rebalancing as corpora grow.',
            tier: 'proposed',
          },
          {
            id: 'm7-c-topology',
            title: 'Semantic topology',
            summary: 'Neighborhood structure of concepts.',
            detail: 'GraphRAG and knowledge graphs move in this direction operationally today — fractal proposals generalize the pattern.',
            tier: 'operational',
          },
        ],
      },
      {
        id: 'm7-s3',
        title: 'Axis 3 — Holographic representation',
        narrative: 'How meaning is encoded, reconstructed, and kept coherent under partial information.',
        cards: [
          {
            id: 'm7-c-wholepart',
            title: 'Whole-part coherence',
            summary: 'Local fragments align with global narrative.',
            detail: 'Executive reports fail when slides contradict footnotes. AI answers fail the same way — coherence is a representation problem, not only a model size problem.',
            tier: 'proposed',
          },
          {
            id: 'm7-c-emerge',
            title: 'Emergent capabilities',
            summary: 'Reasoning, planning, synthesis at the intersection.',
            detail: 'When data discipline, organizational structure, and representation align, systems exhibit reliable multi-step behavior. Weak any axis → emergent claims collapse in production.',
            tier: 'operational',
          },
        ],
        insight: 'Budget allocation should visibly cover all three axes — not 90% model API spend.',
      },
    ],
  },

  'm8-enterprise': {
    moduleId: 'm8-enterprise',
    presentationMinutes: 6,
    opening:
      'Architecture choices become operating models: how teams work, what gets automated, what stays human, and how regulators see you.',
    closing: 'Tag each initiative: production (12–18 mo) vs research horizon. The practice cards reinforce that split.',
    sections: [
      {
        id: 'm8-s1',
        title: 'Operating model shifts',
        narrative: 'AI-native organizations redesign workflows around machine speed with human accountability anchors.',
        cards: [
          {
            id: 'm8-c-km',
            title: 'Knowledge management',
            summary: 'From static wikis to living, queryable fields.',
            detail: 'Today: Confluence + search + copilot sidebar. Forward: semantic fields that stay synchronized with source systems — if proposal tier research pans out.',
            tier: 'operational',
          },
          {
            id: 'm8-c-research',
            title: 'Research acceleration',
            summary: 'Literature scan, hypothesis generation, experiment design assist.',
            detail: 'High value in pharma, materials, finance research. Requires citation grounding and reproducibility logs — not chat-only interfaces.',
            tier: 'operational',
          },
          {
            id: 'm8-c-twins',
            title: 'Digital twins',
            summary: 'Sensor-fed models mirroring physical systems.',
            detail: 'Operational today in manufacturing and facilities. Fractal proposals suggest richer cross-scale mirroring — validate per domain.',
            tier: 'operational',
          },
        ],
      },
      {
        id: 'm8-s2',
        title: 'Governance & infrastructure',
        narrative: 'Scale without governance becomes liability scale. Future infrastructure bets must include eval, audit, and kill switches.',
        cards: [
          {
            id: 'm8-c-gov',
            title: 'Responsible AI',
            summary: 'Policy, bias testing, incident response, model cards.',
            detail: 'Regulatory landscape (EU AI Act, sector rules) pushes documentation and risk classification. Board-level ownership is becoming norm, not optional.',
            tier: 'operational',
          },
          {
            id: 'm8-c-collab',
            title: 'Human-AI collaboration',
            summary: 'Copilots + approval flows + skill uplift.',
            detail: 'Change management determines ROI more than model selection. Measure time-to-proficiency and error catch rates — not just licenses deployed.',
            tier: 'operational',
          },
          {
            id: 'm8-c-infra',
            title: 'Future infrastructure',
            summary: 'Eval platforms, semantic observability, cost guards.',
            detail: 'Next budget cycle: invest in eval harnesses mirroring production traffic, prompt/version registry, and automatic rollback when quality drifts.',
            tier: 'operational',
          },
        ],
        insight: 'Fair Exchange for AI programs: measurable utility, honest limits, reversible deployments.',
      },
    ],
  },
};

export function getPresentation(id: ModuleId): ModulePresentation | undefined {
  return MODULE_PRESENTATIONS[id];
}
