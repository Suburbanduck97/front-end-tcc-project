import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

// Este componente recebe as páginas como "children" (filhos)
const Layout = ({ children }) => {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <main className={styles.content}>
        {children} {/* A página da rota atual será renderizada aqui */}
      </main>
    </div>
  );
};

export default Layout;