import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { between, Context, Event, shallowEqual } from './index';

// jest.mock('react', () => ({
//   ...jest.requireActual('react'),
// }));

describe('use-between library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Event class', () => {
    test('should fire event to all subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const event = new Event<string>();
      
      event.subscribe(callback1);
      event.subscribe(callback2);
      
      event.fire('test');
      
      expect(callback1).toHaveBeenCalledWith('test');
      expect(callback2).toHaveBeenCalledWith('test');
    });

    test('should unsubscribe correctly', () => {
      const callback = jest.fn();
      const event = new Event<string>();
      
      const unsubscribe = event.subscribe(callback);
      event.fire('test1');
      
      unsubscribe();
      event.fire('test2');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test1');
    });

    test('should clear all listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const event = new Event<string>();
      
      event.subscribe(callback1);
      event.subscribe(callback2);
      
      event.clear();
      event.fire('test');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('shallowEqual', () => {

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
    test('should maintain state between different hook usages', async () => {
      const useCounter = between(() => {
        const [count, setCount] = React.useState(0);
        return {
          count,
          increment: () => setCount(count + 1),
          decrement: () => setCount(count - 1),
        };
      });

      // Component 1
      const Component1 = () => {
        const counter = useCounter();
        return (
          <div>
            <span data-testid="count-1">{counter.count}</span>
            <button data-testid="increment-1" onClick={counter.increment}>
              Increment
            </button>
          </div>
        );
      };

      // Component 2
      const Component2 = () => {
        const counter = useCounter();
        return (
          <div>
            <span data-testid="count-2">{counter.count}</span>
            <button data-testid="decrement-2" onClick={counter.decrement}>
              Decrement
            </button>
          </div>
        );
      };

      const App = () => (
        <Context>
          <Component1 />
          <Component2 />
        </Context>
      );

      const user = userEvent.setup();
      const { getByTestId } = render(<App />);
      
      // Both components should show the same initial value
      expect(getByTestId('count-1')).toHaveTextContent('0');
      expect(getByTestId('count-2')).toHaveTextContent('0');

      // Click increment in component 1
      await user.click(getByTestId('increment-1'));

      // Both components should update to show 1
      await waitFor(() => {
        expect(getByTestId('count-1')).toHaveTextContent('1');
        expect(getByTestId('count-2')).toHaveTextContent('1');
      });

      // Click decrement in component 2
      await user.click(getByTestId('decrement-2'));

      // Both components should update to show 0
      await waitFor(() => {
        expect(getByTestId('count-1')).toHaveTextContent('0');
        expect(getByTestId('count-2')).toHaveTextContent('0');
      });
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
