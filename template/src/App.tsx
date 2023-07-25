import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';
import {Todo} from "./features/todo/Todo";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Todo/>
        <hr style={{width: '100%', height: '0px',border: 'solid 1px #CCCCCC'}} />
        <Counter />
      </header>
    </div>
  );
}

export default App;
