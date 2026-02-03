import { useTranslation } from 'react-i18next';
import { TodoPage } from '../todo';
import { CounterPage } from '../counter';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('dashboard')}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <TodoPage />
        <CounterPage />
      </div>
    </div>
  );
}
