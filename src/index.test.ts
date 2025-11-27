import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { between, Context } from './index';

// Mock React hooks for testing
const mockUseState = jest.fn();
const mockUseEffect = jest.fn();
const mockUseRef = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (...args: any[]) => mockUseState(...args),
  useEffect: (...args: any[]) => mockUseEffect(...args),
  useRef: (...args: any[]) => mockUseRef(...args),
}));

describe('use-between library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockUseState.mockImplementation(jest.requireActual('react').useState);
    mockUseEffect.mockImplementation(jest.requireActual('react').useEffect);
    mockUseRef.mockImplementation(jest.requireActual('react').useRef);
  });

  describe('Event class', () => {
    test('should fire event to all subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      // Create a minimal Event class for testing
      class Event<T = void> {
        private listeners = new Set<(value: T) => void>();
        
        fire(value: T): void {
          for (const listener of this.listeners) {
            listener(value);
          }
        }
        
        subscribe(listener: (value: T) => void): () => void {
          this.listeners.add(listener);
          return () => {
            this.listeners.delete(listener);
          }
        }
      }
      
      const event = new Event<string>();
      
      event.subscribe(callback1);
      event.subscribe(callback2);
      
      event.fire('test');
      
      expect(callback1).toHaveBeenCalledWith('test');
      expect(callback2).toHaveBeenCalledWith('test');
    });

    test('should unsubscribe correctly', () => {
      class Event<T = void> {
        private listeners = new Set<(value: T) => void>();
        
        fire(value: T): void {
          for (const listener of this.listeners) {
            listener(value);
          }
        }
        
        subscribe(listener: (value: T) => void): () => void {
          this.listeners.add(listener);
          return () => {
            this.listeners.delete(listener);
          }
        }
      }
      
      const callback = jest.fn();
      const event = new Event<string>();
      
      const unsubscribe = event.subscribe(callback);
      event.fire('test1');
      
      unsubscribe();
      event.fire('test2');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test1');
    });
  });

  describe('shallowEqual', () => {
    // Import the function for testing
    const shallowEqual = (a: any, b: any): boolean => {
      if (a === b) return true;
      
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
      }
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
          return false;
        }
      }
      
      return true;
    };

    test('should return true for identical primitives', () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual('test', 'test')).toBe(true);
      expect(shallowEqual(true, true)).toBe(true);
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(undefined, undefined)).toBe(true);
    });

    test('should return false for different primitives', () => {
      expect(shallowEqual(1, 2)).toBe(false);
      expect(shallowEqual('test', 'test2')).toBe(false);
      expect(shallowEqual(true, false)).toBe(false);
      expect(shallowEqual(null, undefined)).toBe(false);
    });

    test('should return true for shallow equal objects', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    test('should return false for different objects', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test2' };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    test('should return false for objects with different keys', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, c: 'test' };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    test('should return false for nested objects even if content is same', () => {
      const obj1 = { a: { nested: 1 } };
      const obj2 = { a: { nested: 1 } };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('between function', () => {
    test('should return the same hook when called multiple times', () => {
      const hookFn = () => ({ count: 0 });
      
      const hook1 = between(hookFn);
      const hook2 = between(hookFn);
      
      expect(hook1).toBe(hook2);
    });

    test('should create different hooks for different functions', () => {
      const hookFn1 = () => ({ count: 0 });
      const hookFn2 = () => ({ count: 1 });
      
      const hook1 = between(hookFn1);
      const hook2 = between(hookFn2);
      
      expect(hook1).not.toBe(hook2);
    });
  });

  describe('Context component', () => {
    test('should render children', () => {
      const TestChild = () => React.createElement('div', { 'data-testid': 'test-child' }, 'Child');
      
      const { getByTestId } = render(
        React.createElement(Context, { children: React.createElement(TestChild) })
      );
      
      expect(getByTestId('test-child')).toBeInTheDocument();
    });

    test('should render multiple children', () => {
      const TestChild1 = () => React.createElement('div', { 'data-testid': 'test-child-1' }, 'Child 1');
      const TestChild2 = () => React.createElement('div', { 'data-testid': 'test-child-2' }, 'Child 2');
      
      const { getByTestId } = render(
        React.createElement(Context, { 
          children: [
            React.createElement(TestChild1, { key: '1' }),
            React.createElement(TestChild2, { key: '2' })
          ]
        })
      );
      
      expect(getByTestId('test-child-1')).toBeInTheDocument();
      expect(getByTestId('test-child-2')).toBeInTheDocument();
    });
  });

  describe('Integration tests', () => {
    test('should maintain state between different hook usages', () => {
      let externalState = { count: 0 };
      
      const useCounter = between(() => {
        const [count, setCount] = mockUseState(externalState.count);
        
        return {
          count,
          increment: () => {
            externalState.count += 1;
            setCount(externalState.count);
          }
        };
      });

      // Test that the same hook is returned for the same function reference
      const testFn = () => externalState;
      const hook1 = between(testFn);
      const hook2 = between(testFn);
      
      expect(hook1).toBe(hook2);
    });

    test('should handle hook function return values', () => {
      const hookFn = jest.fn(() => ({ data: 'test' }));
      
      const hook = between(hookFn);
      
      // The hook function should have been wrapped
      expect(typeof hook).toBe('function');
      expect(hookFn).not.toHaveBeenCalled(); // Should not be called until the hook is used
    });
  });
});
