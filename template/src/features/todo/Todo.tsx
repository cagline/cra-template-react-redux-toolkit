import  { useEffect, useState} from 'react';

import {
    useCreateToDoMutation,
    useDeleteToDoMutation,
    useLazyGetToDosQuery,
    useUpdateToDoMutation,
} from '../../api/todoApiSlice';
import styles from "../counter/Counter.module.css";

export default function Todo() {
    const [triggerGetToDosQuery, {data: toDos}] = useLazyGetToDosQuery();
    // const [triggerGetToDoQuery, { data: mydata }] = useLazyGetToDoQuery();
    const [triggerCreateToDoMutation, {data, isLoading, error, isError}] = useCreateToDoMutation();
    const [triggerUpdateToDoMutation] = useUpdateToDoMutation();
    const [triggerDeleteToDoMutation] = useDeleteToDoMutation();
    const [todo, setTodo] = useState('');

    useEffect(() => {
        triggerGetToDosQuery().unwrap();
    }, []);

    return (
        <div style={{ width: '66%', margin: '0 auto'}}>
            <h4 style={{}}>ToDo API Slice</h4>
            <div style={{width: '400px', margin:'20px auto', display: "flex", flexDirection: 'row', flexGrow: 1 }}>
                <input
                    value={todo}
                    style={{ flexGrow: 1}}
                    placeholder={'New Todo title'}
                    className={styles.textbox}
                    onChange={(e) => {
                        setTodo(e.target.value);
                    }}
                />
                <button className={styles.button} onClick={() => {
                    triggerCreateToDoMutation({title: `${todo}`, isDone: false}) ;
                    setTodo('');
                }} >Add +</button>
            </div>
            <div style={{width: '400px', margin:'0 auto'}} >
                {toDos &&
                toDos.map((todo: any) => (
                    <div key={todo.id} style={{display: "flex",flexDirection: 'row', alignContent: 'left', marginBottom: 10}}>
                        <div style={{flexGrow:1, textAlign: "left"}}>{todo.title}</div>
                        <input
                            style={{alignItems: "end", justifyItems: "end", alignSelf: 'end', margin: '16px 10px'}}
                            type={"checkbox"}
                            key={todo.id}
                            onChange={() => {
                                triggerUpdateToDoMutation({...todo, isDone: !todo.isDone});
                                todo.isDone = !todo.isDone;
                            }}
                            checked={todo.isDone}
                        />
                        <button
                            className={styles.button}
                            style={{alignItems: "end", justifyItems: "end", alignSelf: 'end'}}
                            onClick={() => triggerDeleteToDoMutation(todo.id)}
                        >Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
