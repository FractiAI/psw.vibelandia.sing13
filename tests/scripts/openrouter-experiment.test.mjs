import { describe, expect, it } from 'vitest';
import {
  TASK_BATTERY,
  PLAIN_SYSTEM,
  buildStandardMessages,
  buildLatticeMessages,
  buildNaiveCorpus,
  buildNaiveMessages,
  scoreTask,
  scoreTaskLenient,
  mean,
  stdDev,
  ci95,
  pairedT,
  wilcoxonSignedRank,
  cohensDz,
  barChartSVG,
  pairedScatterSVG,
  buildReport,
} from '../../lib/openrouter-experiment.mjs';

describe('OpenRouter experiment core', () => {
  it('exposes the fixed QA, coding, and reasoning battery', () => {
    expect(TASK_BATTERY).toHaveLength(9);
    expect(TASK_BATTERY.filter((task) => task.type === 'qa')).toHaveLength(5);
    expect(TASK_BATTERY.filter((task) => task.type === 'coding')).toHaveLength(1);
    expect(TASK_BATTERY.filter((task) => task.type === 'reasoning')).toHaveLength(3);
  });

  it('builds plain and lattice treatments with the same task', () => {
    const task = TASK_BATTERY[0];
    const standard = buildStandardMessages(task, []);
    const lattice = buildLatticeMessages(task, [], process.cwd());
    expect(standard[0].content).toBe(PLAIN_SYSTEM);
    expect(standard[1].content).toContain(task.prompt);
    expect(lattice[0].content).toContain('Lattice');
    expect(lattice[1].content).toContain(task.prompt);
  });

  it('scores exact QA and numeric reasoning conservatively', () => {
    const qa = TASK_BATTERY.find((task) => task.id === 'qa_cli_default_nest');
    const reasoning = TASK_BATTERY.find((task) => task.id === 'reasoning_arithmetic');
    expect(scoreTask(qa, 'goldilocks')).toMatchObject({ correct: true });
    expect(scoreTask(qa, 'multi')).toMatchObject({ correct: false });
    expect(scoreTask(reasoning, 'The answer is 731.')).toMatchObject({ correct: true });
    expect(scoreTask(reasoning, '732')).toMatchObject({ correct: false });
  });

  it('lenient scoring accepts the expected value anywhere in prose', () => {
    const qa = TASK_BATTERY.find((task) => task.id === 'qa_default_cursor_model');
    expect(scoreTaskLenient(qa, 'The default cursor model is composer-2.5 in the catalog.')).toMatchObject({ correct: true });
    expect(scoreTaskLenient(qa, 'It depends on the provider configuration.')).toMatchObject({ correct: false });
    const reasoning = TASK_BATTERY.find((task) => task.id === 'reasoning_arithmetic');
    expect(scoreTaskLenient(reasoning, 'The result is 731.')).toMatchObject({ correct: true });
  });

  it('builds the naive corpus-dump treatment deterministically', () => {
    const corpus = buildNaiveCorpus(process.cwd(), 10_000);
    expect(corpus.length).toBeGreaterThan(0);
    expect(corpus[0]).toHaveProperty('path');
    expect(corpus[0]).toHaveProperty('content');
    const task = TASK_BATTERY.find((t) => t.id === 'qa_cli_email_env');
    const messages = buildNaiveMessages(task, corpus);
    expect(messages[0].content).toContain('repository corpus');
    expect(messages[0].content).toContain(corpus[0].path);
    expect(messages[1].content).toContain(task.prompt);
  });

  it('computes paired statistics and confidence intervals', () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(stdDev([1, 2, 3])).toBeCloseTo(1);
    expect(ci95([1, 2, 3])).toMatchObject({ low: expect.any(Number), high: expect.any(Number) });
    expect(pairedT([3, 4, 5], [1, 2, 3])).toMatchObject({ df: 2, meanDiff: 2 });
    expect(wilcoxonSignedRank([3, 4, 5], [1, 2, 3])).toMatchObject({ n: 3, W: 0 });
    expect(cohensDz([3, 4, 5], [1, 2, 3])).toBeNull();
  });

  it('renders escaped, dependency-free SVG and HTML reports', () => {
    const groups = [{ index: 0, label: '<task>' }];
    const svg = barChartSVG({ title: '<chart>', groups, series: [{ label: 'Lattice', values: [1] }, { label: 'Standard', values: [0] }] });
    const scatter = pairedScatterSVG({ title: '<scatter>', pairs: [{ label: '<pair>', a: { tokens: 10, acc: 1 }, b: { tokens: 20, acc: 0 } }] });
    const report = buildReport({
      meta: { title: '<report>', model: 'local-test', repeats: 1, ranAt: 'test', n: 1, protocol: 'paired', tasks: ['x'], treatments: ['lattice', 'standard'], limitations: ['descriptive'] },
      byTask: [{ taskId: 'x', n: 1, lattice: { accuracy: 1, tokens: 10, latency: 5, tokensPerCorrect: 10 }, standard: { accuracy: 0, tokens: 20, latency: 6, tokensPerCorrect: 20 }, paired: { p: 0.5, dz: 1 } }],
      overall: { n: 1, lattice: { accuracy: 1 }, standard: { accuracy: 0 } },
      svgs: [svg, scatter],
    });
    expect(svg).toContain('&lt;chart&gt;');
    expect(scatter).toContain('&lt;pair&gt;');
    expect(report).toContain('<!doctype html>');
    expect(report).toContain('&lt;report&gt;');
    expect(report).toContain('<svg');
  });
});
