/**
 * GAMEBOT.AI Universal Automated Test Engine & Assertion Library
 * Runs synchronously or asynchronously in Node.js (Vitest) & Browser UI
 */

export interface TestCaseResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

export interface TestCategorySummary {
  category: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
}

export interface FullTestRunReport {
  timestamp: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  totalDurationMs: number;
  categories: TestCategorySummary[];
  results: TestCaseResult[];
}

type TestFn = () => void | Promise<void>;

interface RegisteredTest {
  category: string;
  name: string;
  fn: TestFn;
}

class TestRunnerRegistry {
  private tests: RegisteredTest[] = [];

  register(category: string, name: string, fn: TestFn) {
    this.tests.push({ category, name, fn });
  }

  getTests() {
    return this.tests;
  }

  async runAll(): Promise<FullTestRunReport> {
    const startTime = performance.now();
    const results: TestCaseResult[] = [];
    const categoryMap: Record<string, { total: number; passed: number; failed: number; durationMs: number }> = {};

    for (const t of this.tests) {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, passed: 0, failed: 0, durationMs: 0 };
      }
      categoryMap[t.category].total += 1;

      const testStart = performance.now();
      let passed = false;
      let errorMsg: string | undefined;

      try {
        await t.fn();
        passed = true;
      } catch (err: any) {
        passed = false;
        errorMsg = err instanceof Error ? err.message : String(err);
      }

      const durationMs = Math.round((performance.now() - testStart) * 100) / 100;
      categoryMap[t.category].durationMs += durationMs;

      if (passed) {
        categoryMap[t.category].passed += 1;
      } else {
        categoryMap[t.category].failed += 1;
      }

      results.push({
        name: t.name,
        category: t.category,
        passed,
        durationMs,
        error: errorMsg,
      });
    }

    const totalDurationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const passCount = results.filter((r) => r.passed).length;
    const failCount = results.filter((r) => !r.passed).length;

    const categories: TestCategorySummary[] = Object.entries(categoryMap).map(([cat, stats]) => ({
      category: cat,
      total: stats.total,
      passed: stats.passed,
      failed: stats.failed,
      durationMs: Math.round(stats.durationMs * 100) / 100,
    }));

    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passCount,
      failCount,
      totalDurationMs,
      categories,
      results,
    };
  }
}

export const registry = new TestRunnerRegistry();

export function registerTest(category: string, name: string, fn: TestFn) {
  registry.register(category, name, fn);
}

/**
 * Lightweight assertion library matching Vitest/Jest expect syntax
 */
export function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: any) {
      const actualJson = JSON.stringify(actual);
      const expectedJson = JSON.stringify(expected);
      if (actualJson !== expectedJson) {
        throw new Error(`Expected deep equality:\nExpected: ${expectedJson}\nReceived: ${actualJson}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, received ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, received ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(num: number) {
      if (typeof actual !== 'number' || actual <= num) {
        throw new Error(`Expected ${actual} to be greater than ${num}`);
      }
    },
    toBeLessThanOrEqual(num: number) {
      if (typeof actual !== 'number' || actual > num) {
        throw new Error(`Expected ${actual} to be less than or equal to ${num}`);
      }
    },
    toContain(item: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(item)) {
          throw new Error(`Expected string "${actual}" to contain "${item}"`);
        }
      } else {
        throw new Error(`toContain target is neither Array nor String`);
      }
    },
  };
}
