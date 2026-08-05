import { requiredTrimmed } from './validators.util';

function fakeControl(value: unknown) {
  return { value } as any;
}

describe('requiredTrimmed', () => {
  it('should return error for null value', () => {
    const control = fakeControl(null);
    expect(requiredTrimmed(control)).toEqual({ requiredTrimmed: true });
  });

  it('should return error for empty string', () => {
    const control = fakeControl('');
    expect(requiredTrimmed(control)).toEqual({ requiredTrimmed: true });
  });

  it('should return error for whitespace-only string', () => {
    const control = fakeControl('   ');
    expect(requiredTrimmed(control)).toEqual({ requiredTrimmed: true });
  });

  it('should return null for valid text', () => {
    const control = fakeControl('Brazil');
    expect(requiredTrimmed(control)).toBeNull();
  });
});
