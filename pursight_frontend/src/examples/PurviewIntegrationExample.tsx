import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des composants TailAdmin existants
import DefaultLayout from '../layout/DefaultLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

// Import des composants Purview
import { AppThemeProvider, ThemeToggle, DataSourceConnectPage, DataMapDesignerPage } from '../pages';

/**
 * Exemple d'intégration des composants Purview dans l'application TailAdmin
 * 
 * Cet exemple montre comment:
 * 1. Envelopper l'application avec AppThemeProvider pour le support du thème sombre
 * 2. Ajouter le bouton de bascule de thème dans l'en-tête
 * 3. Ajouter les routes pour les pages Purview
 */
const PurviewIntegrationExample = () => {
  return (
    <AppThemeProvider>
      <Router>
        <Routes>
          {/* Routes TailAdmin existantes */}
          <Route
            path="/"
            element={
              <DefaultLayout>
                <Dashboard />
              </DefaultLayout>
            }
          />
          
          {/* Routes pour les composants Purview */}
          <Route
            path="/datasources"
            element={
              <DefaultLayout>
                <DataSourceConnectPage />
              </DefaultLayout>
            }
          />
          <Route
            path="/datamap"
            element={
              <DefaultLayout>
                <DataMapDesignerPage />
              </DefaultLayout>
            }
          />
        </Routes>
      </Router>
    </AppThemeProvider>
  );
};

/**
 * Exemple de modification de l'en-tête pour ajouter le bouton de bascule de thème
 */
const HeaderWithThemeToggle = () => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Bouton de menu existant */}
        </div>

        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Autres éléments d'en-tête */}
            
            {/* Bouton de bascule de thème */}
            <li className="relative">
              <ThemeToggle />
            </li>
          </ul>

          {/* Dropdown de profil existant */}
        </div>
      </div>
    </header>
  );
};

export default PurviewIntegrationExample;