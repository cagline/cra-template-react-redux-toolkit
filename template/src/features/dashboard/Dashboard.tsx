import React from 'react';
import Todo from "../todo/Todo";
import Counter from "../counter/Counter";

export default function Dashboard() {


  return (
    <div >
      <h3>Dashboard</h3>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <Todo/>
      <Counter/>
      </div>
    </div>
  );
}
