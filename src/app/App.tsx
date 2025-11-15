import { Providers } from './providers';
import { AppRouter } from './router';
import { usePageTitle } from '@/hooks/use-page-title';

// Component to handle page title updates for all routes
function PageTitleUpdater() {
  usePageTitle();
  return null;
}

function App() {
  return (
    <Providers>
      <PageTitleUpdater />
      <AppRouter />
    </Providers>
  );
}

export default App;

