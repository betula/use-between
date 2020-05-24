# use-between

When you want to separate your React hooks state between several components it's can be very difficult, because all context data stored in React component function area.
If you want to share some of state parts or control functions to another component your need pass It thought React component props. But If you want to share It with sibling one level component or some of set different components, you will be frustrated.

`use-between` it's a decision of your problem)

```javascript
import { useState, useEffect } from 'react';
import { useBetween, Between } from 'use-between';

const useTodos = () => {
  const [ todos, setTodos ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ count, setCount ] = useState(0);

  const load = async () => {
    setLoading(true);
    setTodos(await (await fetch('/api/todos')).json());
    setLoading(false);
  };

  useEffect(() => {
    setCount(todos.length);
  }, [todo]);

  return {
    todos,
    loading,
    count,
    load
  };
};

const Todos = () => {
  const { todos, count } = useBetween(useTodos);
  return (
    <>
      {todos.map((todo) => <div>{todo.title}</div>)}
      Count: {count}
    </>
  );
};

const App = () => {
  const { loading, load } = useBetween(useTodos);
  return (
    loading
      ? <>'Loading...'</>
      : (
        <>
          <Todos />
          <button onClick={load}>Load</button>
        </>
      )
  );
};

const Root = () => (
  <Between>
    <App />
  </Between>
);
```

If you like this idea and would like to use it, please put a star in github. It will inspire me!
