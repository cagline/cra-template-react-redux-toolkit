import { useTranslation } from 'react-i18next';
import { useTodoController } from './useTodoController';
import styles from '../counter/CounterPage.module.css';

export default function TodoPage() {
  const { t } = useTranslation();
  const {
    toDos,
    todoInput,
    setTodoInput,
    addTodo,
    toggleDone,
    deleteTodo,
  } = useTodoController();

  return (
    <div style={{ width: '50%', margin: '0 auto' }}>
      <h3>{t('todo.title')}</h3>
      <div
        style={{
          width: '400px',
          margin: '20px auto',
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
        }}
      >
        <input
          value={todoInput}
          style={{ flexGrow: 1 }}
          placeholder="New Todo title"
          className={styles.textbox}
          onChange={(e) => setTodoInput(e.target.value)}
        />
        <button className={styles.button} onClick={addTodo}>
          Add +
        </button>
      </div>
      <div style={{ width: '400px', margin: '0 auto' }}>
        {toDos.map((todo) => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'left',
              marginBottom: 10,
            }}
          >
            <input
              className={styles.checkbox}
              style={{
                alignItems: 'end',
                justifyItems: 'end',
                alignSelf: 'end',
              }}
              type="checkbox"
              onChange={() => toggleDone(todo)}
              checked={todo.isDone}
            />
            <div
              className={styles.todoTitle}
              style={{
                flexGrow: 1,
                textAlign: 'left',
                lineHeight: '46px',
              }}
            >
              {todo.title}
            </div>
            <button
              className={styles.button}
              style={{
                alignItems: 'end',
                justifyItems: 'end',
                alignSelf: 'end',
              }}
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
