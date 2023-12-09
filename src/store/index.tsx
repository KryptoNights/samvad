// reducers/index.js
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import { combineReducers } from "redux";
import {legacy_createStore as createStore} from 'redux'
import { walletInfoSlice } from "./slice/walletInfo";

// import other slices as needed
const reducers = combineReducers({
  walletInfo: walletInfoSlice.reducer,
});

const makeStore = () => {
  const store: any = configureStore({ reducer: reducers });
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper(makeStore);


