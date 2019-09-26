<h1 align="center">use-setstate</h1>
<p align="center">When hooks and setState collide</p>

<p align="center">
  <a href="https://badge.fury.io/js/use-setstate"><img src="https://badge.fury.io/js/use-setstate.svg" alt="npm version" height="18"></a>
  <a href="https://travis-ci.org/dacre-denny/use-setstate"><img src="https://travis-ci.org/dacre-denny/use-setstate.svg?branch=master" alt="build"></a>
  <a href='https://coveralls.io/github/dacre-denny/use-setstate?branch=master'><img src='https://coveralls.io/repos/github/dacre-denny/use-setstate/badge.svg?branch=master' alt='Coverage Status' /></a>
  <a href="https://www.npmjs.com/package/use-setstate"><img src="https://img.shields.io/npm/dm/use-setstate" alt="Downloads"></a>
  <a href="https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dacre-denny/use-setstate&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/295187f20b074fd9b63040c3538e006a"/></a>
</p>

---

## Quick Start

```bash
npm install --save use-setstate
```

```jsx
import { useSetState } from "use-setstate";

/**
 * Name input component with reset button. Dispatches an event of document when name
 * value is updated.
 */
function NameField(props) {
  // Declare state variable following useState convention
  const [name, setName] = useSetState("", value => {
    // State change callback is invoked when name state changes
    document.dispatchEvent(new CustomEvent("user_updated_name", { details: { value } }));
  });

  return (
    <>
      <label>Name</label>
      <input value={name} onChange={event => setName(event.target.value)} />
      <button onClick={event => setName("")}>Reset</button>
    </>
  );
}
```

## Features

- Interface inspired by [useState](https://reactjs.org/docs/hooks-state.html)
- State change callback
- State setter can accept functions [like setState()](https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous)
- Typescript support

## API

The API is similar to Reacts [`useState()`](https://reactjs.org/docs/hooks-state.html) hook. When `useSetState()` is called, an array is returned where the first item of the array is the current state value, and the second item of the array is a setter for that state:

```jsx
/*
let [value, setValue] = useState(initialValue?);
*/
let [value, setValue] = useSetState(initialValue?, callback?);
```

The main difference is the optional `callback` argument provided by `useSetState()`. This mimics the behavior of the Reacts optional [callback](https://reactjs.org/docs/react-component.html#setstate) for the `setState()` method:

```jsx
let [isOpen, setIsOpen] = useSetState(0, () => {
  console.log("open state may have changed..");
});
```

If a state change callback is provided, `useSetState()` will pass the updated state as the first argumentinvoke the callback with the updated state as the first argument:

```jsx
let [, setMoney] = useSetState(0, money => {
  if (money < 0) {
    console.log("Uh oh..");
  }
});
```

### State change callback

TODO

### Setter functions

TODO

## Run tests

```bash
npm run test
```

## License

Licensed under MIT
