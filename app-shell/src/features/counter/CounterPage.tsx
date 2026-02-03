import { useTranslation } from 'react-i18next';
import { useCounterController } from './useCounterController';
import styles from './CounterPage.module.css';

export default function CounterPage() {
  const { t } = useTranslation();
  const {
    count,
    incrementAmount,
    setIncrementAmount,
    decrement,
    increment,
    addAmount,
    addAsync,
    addIfOdd,
  } = useCounterController();

  return (
    <div style={{ width: '50%', margin: '0 auto' }}>
      <h3>{t('counter.title')}</h3>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={decrement}
        >
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={increment}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button className={styles.button} onClick={addAmount}>
          Add Amount
        </button>
        <button className={styles.asyncButton} onClick={addAsync}>
          Add Async
        </button>
        <button className={styles.button} onClick={addIfOdd}>
          Add If Odd
        </button>
      </div>
    </div>
  );
}
