import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from './counterSlice';

export function useCounterController() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return {
    count,
    incrementAmount,
    setIncrementAmount,
    decrement: () => dispatch(decrement()),
    increment: () => dispatch(increment()),
    addAmount: () => dispatch(incrementByAmount(incrementValue)),
    addAsync: () => dispatch(incrementAsync(incrementValue)),
    addIfOdd: () => dispatch(incrementIfOdd(incrementValue)),
  };
}
