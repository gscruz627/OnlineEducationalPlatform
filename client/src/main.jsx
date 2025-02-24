import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// RTK Imports
import mainReducer from "../store.js"
import { configureStore } from "@reduxjs/toolkit";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer, FLUSH,
         REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
        
// Configure Redux Persist
const persistConfig = { key: "root", storage, version: 1 };
const persistedReducer = persistReducer(persistConfig, mainReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor once
const persistor = persistStore(store);

// Create the Virtual DOM
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
