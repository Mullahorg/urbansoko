import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import CustomStylesLoader from './components/CustomStylesLoader'

createRoot(document.getElementById("root")!).render(
  <>
    <CustomStylesLoader />
    <App />
  </>
);
