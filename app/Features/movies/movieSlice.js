import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOWNkNmMyYzFlZWFiMzg1OTFlZGIyYTM4NmYxYWIzZSIsIm5iZiI6MTc3NDg3MTgzOS42MzkwMDAyLCJzdWIiOiI2OWNhNjUxZjFmOWRmOTZhOTI3MzMwNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.NXW410nthV08yCkOcrx82tQFJwQxoT8cul8pyqPKu0U';

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async ({ term, filters, page = 1 }, { rejectWithValue }) => {
    try {
      const { genre, rating, language, year } = filters || {};

      let url;

      if (term && term.trim() !== '') {
        //  SEARCH API
        url = new URL('https://api.themoviedb.org/3/search/movie');
        url.searchParams.append('query', term);
      } else {
        //  DISCOVER API
        url = new URL('https://api.themoviedb.org/3/discover/movie');

        if (genre) url.searchParams.append('with_genres', genre);
        if (year) url.searchParams.append('primary_release_year', year);
        if (language)
          url.searchParams.append('with_original_language', language);
        if (rating) url.searchParams.append('vote_average.gte', rating);

        url.searchParams.append('sort_by', 'popularity.desc');
      }

      //  Common params
      url.searchParams.append('page', page);
      url.searchParams.append('include_adult', 'false');
      url.searchParams.append('include_video', 'false');
      url.searchParams.append('language', 'en-US');

      //  DEBUG (optional)
      console.log('API URL:', url.toString());

      const res = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${API_TOKEN.trim()}`,
          accept: 'application/json',
        },
      });

      return {
        movies: res.data.results || [],
        totalPages: res.data.total_pages || 1,
      };
    } catch (error) {
      console.log('API ERROR:', error.response?.data || error.message);
      return rejectWithValue('API Failed');
    }
  }
);

//  SLICE
const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    favorites: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
  },
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.find(
        (movie) => movie.id === action.payload.id
      );
      if (!exists) state.favorites.push(action.payload);
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(
        (movie) => movie.id !== action.payload.id
      );
    },
    setPage: (state, action) => {
      state.page = action.payload;
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
        state.movies = action.payload.movies;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch movies';
      });
  },
});

export const { addFavorite, removeFavorite, setPage } = movieSlice.actions;
export default movieSlice.reducer;