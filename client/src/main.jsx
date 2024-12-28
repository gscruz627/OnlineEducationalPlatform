import mainReducer from "../store.js"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { configureStore } from "@reduxjs/toolkit";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import storage from "redux-persist/lib/storage";
import {
  persistStore, persistReducer, FLUSH,
  REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import "./index.css"
const persistConfig = { key: "root", storage, version: 1 };
const persistedReducer = persistReducer(persistConfig, mainReducer);
const store = configureStore( {
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
  )
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
)