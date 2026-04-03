import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOWNkNmMyYzFlZWFiMzg1OTFlZGIyYTM4NmYxYWIzZSIsIm5iZiI6MTc3NDg3MTgzOS42MzkwMDAyLCJzdWIiOiI2OWNhNjUxZjFmOWRmOTZhOTI3MzMwNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.NXW410nthV08yCkOcrx82tQFJwQxoT8cul8pyqPKu0U';

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async ({ term, filters, page = 1 }, { rejectWithValue }) => {
    try {
      const { genre, rating, language, year } = filters || {};
      const isSearching = term && term.trim() !== '';
      const hasFilters = genre || rating || language || year;

      if (isSearching && hasFilters) {
        let allFiltered = [];
        let apiPage = 1;
        let totalPages = 1;
        const RESULTS_PER_PAGE = 20;
        const TARGET = page * RESULTS_PER_PAGE;

        while (allFiltered.length < TARGET && apiPage <= Math.min(totalPages, 10)) {
          const url = new URL('https://api.themoviedb.org/3/search/movie');
          url.searchParams.append('query', term);
          url.searchParams.append('page', apiPage);
          url.searchParams.append('include_adult', 'false');
          url.searchParams.append('language', 'en-US');
          url.searchParams.append('_t', Date.now()); 

          const res = await axios.get(url.toString(), {
            headers: {
              Authorization: `Bearer ${API_TOKEN.trim()}`,
              accept: 'application/json',
              'Cache-Control': 'no-cache',
            },
          });

          totalPages = res.data.total_pages || 1;
          let movies = res.data.results || [];

          // Client-side filtering
          if (genre) movies = movies.filter(m => m.genre_ids?.includes(Number(genre)));
          if (rating) movies = movies.filter(m => m.vote_average >= Number(rating));
          if (language) movies = movies.filter(m => m.original_language === language);
          if (year) movies = movies.filter(m => m.release_date?.startsWith(year));

          allFiltered = [...allFiltered, ...movies];
          apiPage++;
        }

        const start = (page - 1) * RESULTS_PER_PAGE;
        const end = start + RESULTS_PER_PAGE;
        const pageResults = allFiltered.slice(start, end);

        const estimatedTotal = Math.ceil(allFiltered.length / RESULTS_PER_PAGE) +
          (allFiltered.length >= TARGET ? 2 : 0);

        return {
          movies: pageResults,
          totalPages: Math.max(estimatedTotal, page),
        };
      }

      // ✅ Case 2: Sirf Search ya Sirf Filters
      let url;

      if (isSearching) {
        // Sirf search term
        url = new URL('https://api.themoviedb.org/3/search/movie');
        url.searchParams.append('query', term);
      } else {
        // Sirf filters ya default
        url = new URL('https://api.themoviedb.org/3/discover/movie');
        if (genre) url.searchParams.append('with_genres', genre);
        if (year) url.searchParams.append('primary_release_year', year);
        if (language) url.searchParams.append('with_original_language', language);
        if (rating) url.searchParams.append('vote_average.gte', rating);
        url.searchParams.append('sort_by', 'popularity.desc');
      }

      // Common params
      url.searchParams.append('page', page);
      url.searchParams.append('include_adult', 'false');
      url.searchParams.append('language', 'en-US');
      url.searchParams.append('_t', Date.now()); // ✅ Cache bust

      const res = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${API_TOKEN.trim()}`,
          accept: 'application/json',
          'Cache-Control': 'no-cache', // ✅ Cache disable
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

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    favorites: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    currentTerm: '',
    currentFilters: {},
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
    setCurrentSearch: (state, action) => {
      state.currentTerm = action.payload.term;
      state.currentFilters = action.payload.filters;
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

export const { addFavorite, removeFavorite, setPage, setCurrentSearch } = movieSlice.actions;
export default movieSlice.reducer;