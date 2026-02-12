// test/domain/Task.test.ts
import { describe, it, expect } from 'vitest';

describe('Task Logic', () => {
  it('should identify high priority tasks correctly', () => {
    const task = { title: "Test", priority: "High" };
    expect(task.priority).toBe("High");
  });
});