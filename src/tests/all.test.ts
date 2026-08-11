import { describe, it } from 'vitest';
import { initializeAllTestCases } from './testDefinitions';
import { registry } from './testSuite';

// Register test cases into the registry
initializeAllTestCases();

const tests = registry.getTests();

// Group tests by category for Vitest execution
const categorized = tests.reduce((acc, test) => {
  if (!acc[test.category]) acc[test.category] = [];
  acc[test.category].push(test);
  return acc;
}, {} as Record<string, typeof tests>);

Object.entries(categorized).forEach(([category, testCases]) => {
  describe(`[GAMEBOT.AI Test Suite] ${category}`, () => {
    testCases.forEach((t) => {
      it(t.name, async () => {
        await t.fn();
      });
    });
  });
});
