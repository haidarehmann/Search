import { configureStore } from '@reduxjs/toolkit';

import movieReducer from './Features/movies/movieSlice';

export const store = configureStore({
  reducer: {
    movies: movieReducer,
  },
});