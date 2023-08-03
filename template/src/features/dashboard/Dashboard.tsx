import React from 'react';
import Todo from "../todo/Todo";
import Counter from "../counter/Counter";

export default function Dashboard() {


  return (
    <div >
      <h3>Dashboard</h3>
      <Todo/>
      <hr style={{width: '100%', height: '0px', border: 'solid 1px #CCCCCC'}}/>
      <Counter/>
    </div>
  );
}
