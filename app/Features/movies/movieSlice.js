import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOWNkNmMyYzFlZWFiMzg1OTFlZGIyYTM4NmYxYWIzZSIsIm5iZiI6MTc3NDg3MTgzOS42MzkwMDAyLCJzdWIiOiI2OWNhNjUxZjFmOWRmOTZhOTI3MzMwNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.NXW410nthV08yCkOcrx82tQFJwQxoT8cul8pyqPKu0U';

const RESULTS_PER_PAGE = 20;

// ✅ Poster filter — bina poster wali movies skip
const withPoster = (movies) => movies.filter(m => m.poster_path);

// ✅ Duplicate filter — same id wali movies ek baar hi dikhao
const removeDuplicates = (movies) => {
  const seen = new Set();
  return movies.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
};

// ✅ Dono filters ek saath
const cleanMovies = (movies) => removeDuplicates(withPoster(movies));

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async ({ term, filters, page = 1 }, { rejectWithValue, getState }) => {
    try {
      const { genre, rating, language, year } = filters || {};
      const isSearching = term && term.trim() !== '';
      const hasFilters = genre || rating || language || year;

      const headers = {
        Authorization: `Bearer ${API_TOKEN.trim()}`,
        accept: 'application/json',
        'Cache-Control': 'no-cache',
      };

      // ✅ Case 1: Search + Filters
      if (isSearching && hasFilters) {
        const state = getState().movies;

        if (page === 1) {
          let allFiltered = [];
          let apiPage = 1;
          let totalApiPages = 1;

          while (apiPage <= Math.min(totalApiPages, 5)) {
            const url = new URL('https://api.themoviedb.org/3/search/movie');
            url.searchParams.append('query', term);
            url.searchParams.append('page', apiPage);
            url.searchParams.append('include_adult', 'false');
            url.searchParams.append('language', 'en-US');

            const res = await axios.get(url.toString(), { headers });
            totalApiPages = res.data.total_pages || 1;

            let movies = withPoster(res.data.results || []);
            if (genre) movies = movies.filter(m => m.genre_ids?.includes(Number(genre)));
            if (rating) movies = movies.filter(m => m.vote_average >= Number(rating));
            if (language) movies = movies.filter(m => m.original_language === language);
            if (year) movies = movies.filter(m => m.release_date?.startsWith(year));

            allFiltered = [...allFiltered, ...movies];
            apiPage++;
          }

          // ✅ Duplicates remove karo
          allFiltered = removeDuplicates(allFiltered);

          const accurateTotalPages = Math.max(1, Math.ceil(allFiltered.length / RESULTS_PER_PAGE));

          return {
            movies: allFiltered.slice(0, RESULTS_PER_PAGE),
            totalPages: accurateTotalPages,
            allFilteredMovies: allFiltered,
            page: 1,
          };
        } else {
          const cached = state.allFilteredMovies || [];
          const start = (page - 1) * RESULTS_PER_PAGE;
          return {
            movies: cached.slice(start, start + RESULTS_PER_PAGE),
            totalPages: state.totalPages,
            allFilteredMovies: cached,
            page,
          };
        }
      }

      // ✅ Case 2: Sirf Search
      if (isSearching) {
        let collected = [];
        let apiPage = 1;
        let totalApiPages = 1;
        const needed = page * RESULTS_PER_PAGE;

        while (collected.length < needed && apiPage <= Math.min(totalApiPages, 10)) {
          const url = new URL('https://api.themoviedb.org/3/search/movie');
          url.searchParams.append('query', term);
          url.searchParams.append('page', apiPage);
          url.searchParams.append('include_adult', 'false');
          url.searchParams.append('language', 'en-US');
          url.searchParams.append('_t', Date.now());

          const res = await axios.get(url.toString(), { headers });
          totalApiPages = res.data.total_pages || 1;
          collected = removeDuplicates([...collected, ...withPoster(res.data.results || [])]); // ✅
          apiPage++;
        }

        const start = (page - 1) * RESULTS_PER_PAGE;
        const pageResults = collected.slice(start, start + RESULTS_PER_PAGE);
        const accurateTotal = Math.max(page, Math.ceil(collected.length / RESULTS_PER_PAGE));

        return {
          movies: pageResults,
          totalPages: accurateTotal,
          allFilteredMovies: [],
          page,
        };
      }

      // ✅ Case 3: Sirf Filters ya Default
      let collected = [];
      let apiPage = page;
      let totalApiPages = 1;

      while (collected.length < RESULTS_PER_PAGE && apiPage <= Math.min(page + 3, 500)) {
        const url = new URL('https://api.themoviedb.org/3/discover/movie');
        if (genre) url.searchParams.append('with_genres', genre);
        if (year) url.searchParams.append('primary_release_year', year);
        if (language) url.searchParams.append('with_original_language', language);
        if (rating) url.searchParams.append('vote_average.gte', rating);
        url.searchParams.append('sort_by', 'popularity.desc');
        url.searchParams.append('page', apiPage);
        url.searchParams.append('include_adult', 'false');
        url.searchParams.append('language', 'en-US');
        url.searchParams.append('_t', Date.now());

        const res = await axios.get(url.toString(), { headers });
        totalApiPages = res.data.total_pages || 1;
        collected = removeDuplicates([...collected, ...withPoster(res.data.results || [])]); // ✅
        apiPage++;
      }

      return {
        movies: collected.slice(0, RESULTS_PER_PAGE),
        totalPages: totalApiPages,
        allFilteredMovies: [],
        page,
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
    allFilteredMovies: [],
  },
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.find((movie) => movie.id === action.payload.id);
      if (!exists) state.favorites.push(action.payload);
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter((movie) => movie.id !== action.payload.id);
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setCurrentSearch: (state, action) => {
      state.currentTerm = action.payload.term;
      state.currentFilters = action.payload.filters;
      state.allFilteredMovies = [];
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
        state.allFilteredMovies = action.payload.allFilteredMovies;
        if (action.payload.page === 1) {
          state.totalPages = action.payload.totalPages;
        }
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch movies';
      });
  },
});

export const { addFavorite, removeFavorite, setPage, setCurrentSearch } = movieSlice.actions;
export default movieSlice.reducer;