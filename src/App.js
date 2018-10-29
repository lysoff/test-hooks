import React, { Component } from 'react';
import uuid from 'uuid/v4';
import './App.css';

/* all components' states are stored here */
const globalObject = {}

/* current component that is being serviced */
let currentUuid = null;
/* inner counter for multiple `useState` in "component" */
let counter = 0;

/* hook */
function useState(defaultValue) {
  /* if the same component increment counter */
  if (currentUuidStack[currentUuidStack.length - 1] === currentUuid) {
    counter++;
  } else {
    /* elsу clear counter */
    counter = 0;
  }

  /* set component that is being serviced */
  currentUuid = currentUuidStack[currentUuidStack.length - 1];

  /* concat string identifier for current `useState`. <component>_<counter> */
  const currentUuidStateCounter = `${currentUuidStack[currentUuidStack.length - 1]}_${counter}`;

  /* creating setter bind to current `useState` via closure */
  const setValue = ((_uuid) => (value) => {
    globalObject[_uuid] = value;
  })(currentUuidStateCounter);

  /* if first `useState` call - set default value (Fires on attempt to set 
    undefined as well, but no big deal for this example)  */
  if (globalObject[currentUuidStateCounter] === undefined) {
    setValue(defaultValue);
  }

  /* return pair of value and setter */
  return [globalObject[currentUuidStateCounter], setValue];
}

/* "component" that uses multiple `useState`s */
const First = () => {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);

  console.log('First number1', number1);
  console.log('First number2', number2);

  /* returns array of functions setters for us to be able to call them */
  return [setNumber1, setNumber2];
}

/* "component" that uses single `useState` */
const Second = () => {
  const [number, setNumber] = useState(0);

  console.log('Second number', number);

  /* returns array with one setter */
  return [setNumber];
}

/* That's my proposal. There is a stack of currently "serviced" components */
const currentUuidStack = [];

/* this function returns another function that might be called nultiple times
  to actually "render" the "components" 
  potentially args are "components" defined above
  */
const createRender = (...args) => {
  /* creating closure array for identifying each component by it's index */
  const uuids = [];

  /* using uuid for ids */
  args.forEach(func => {
    uuids.push(uuid());
  });

  /* 
    "render" function that may be called multiple times
    actually it returns `useState`s' setters. Its done for
    testing purposes becauses of lack of infrastructure
   */
  return () => {
    /* clear current serviced component */
    currentUuid = null;

    console.log('running');
    /* just for testing purposes. array with array of returned setters from component  */
    const funcs = [];

    /* servicing each component */
    args.forEach((func, index) => {
      /* pushing current component to stack */
      currentUuidStack.push(uuids[index]);
      /* pushing component returned setters for testing purposes */
      funcs.push(func());
      /* popping out. There are might be nested "render" functions. Have no idea yet how to implement this */
      currentUuidStack.pop();
    });
    console.log('finish running');
  
    /* array of array of setters ready for use */
    return funcs;
  }
}

/* creating render function with two consecutive components */
const render = createRender(First, Second);

/* saving result of render for being to call them */
let functions;

/* propbably that is a component :) */
const rendering = () => {
  functions = render();
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <button onClick={rendering}>Run</button>
        <div>
          <button onClick={() => functions[0][0](Math.random())}>First 1</button>
          <button onClick={() => functions[0][0](0)}>Clear First 1</button>
        </div>
        <div>
          <button onClick={() => functions[0][1](Math.random())}>First 2</button>
          <button onClick={() => functions[0][1](0)}>Clear First 2</button>
        </div>
        <div>
          <button onClick={() => functions[1][0](Math.random())}>Second</button>
          <button onClick={() => functions[1][0](0)}>Clear Second</button>
        </div>
      </div>
    );
  }
}

export default App;
