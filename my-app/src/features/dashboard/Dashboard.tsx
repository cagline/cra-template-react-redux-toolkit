import React from 'react';
import Todo from "../todo/Todo";
import Counter from "../counter/Counter";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const {t, i18n} = useTranslation();


  return (
    <div >
      <h2>{t('dashboard')}</h2>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <Todo/>
      <Counter/>
      </div>
    </div>
  );
}
