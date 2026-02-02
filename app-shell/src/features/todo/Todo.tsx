import  { useEffect, useState} from 'react';

import {
    useCreateToDoMutation,
    useDeleteToDoMutation,
    useLazyGetToDosQuery,
    useUpdateToDoMutation,
} from '../../api/todoApiSlice';
import styles from "../counter/Counter.module.css";
import { useTranslation } from "react-i18next";

export default function Todo() {
    const [triggerGetToDosQuery, {data: toDos}] = useLazyGetToDosQuery();
    // const [triggerGetToDoQuery, { data: mydata }] = useLazyGetToDoQuery();
    const [triggerCreateToDoMutation, {data, isLoading, error, isError}] = useCreateToDoMutation();
    const [triggerUpdateToDoMutation] = useUpdateToDoMutation();
    const [triggerDeleteToDoMutation] = useDeleteToDoMutation();
    const [todo, setTodo] = useState('');
    const {t, i18n} = useTranslation();

    useEffect(() => {
        triggerGetToDosQuery().unwrap();
    }, []);

    return (
        <div style={{ width: '50%', margin: '0 auto'}}>
            <h3 style={{}}>{t('todo.title')}</h3>
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
                        <input
                            className={styles.checkbox}
                            style={{alignItems: "end", justifyItems: "end", alignSelf: 'end'}}
                            type={"checkbox"}
                            key={todo.id}
                            onChange={() => {
                                triggerUpdateToDoMutation({...todo, isDone: !todo.isDone});
                            }}
                            checked={todo.isDone}
                        />
                        <div className={styles.todoTitle} style={{flexGrow:1, textAlign: "left", lineHeight:"46px"}}>{todo.title}</div>
                        <button
                            className={styles.button}
                            style={{alignItems: "end", justifyItems: "end", alignSelf: 'end'}}
                            onClick={async () => {
                                await triggerDeleteToDoMutation(todo.id).unwrap();
                                triggerGetToDosQuery().unwrap();
                            }}
                        >Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
