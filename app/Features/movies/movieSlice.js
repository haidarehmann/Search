import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async API call
export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (searchTerm) => {
    const res = await axios.get(
      `https://www.omdbapi.com/?s=${searchTerm}&apikey=1a1e3889`
    );
    return res.data.Search || [];
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    favorites: [], // will load from localStorage in component
    loading: false,
    error: null,
  },
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.find(
        (movie) => movie.imdbID === action.payload.imdbID
      );
      if (!exists) state.favorites.push(action.payload);
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(
        (movie) => movie.imdbID !== action.payload.imdbID
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload;
      })
      .addCase(fetchMovies.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch movies';
      });
  },
});

export const { addFavorite, removeFavorite } = movieSlice.actions;
export default movieSlice.reducer;