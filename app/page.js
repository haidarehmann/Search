'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import Loader from './components/Loader';
import { IoMoon, IoSunnyOutline } from "react-icons/io5";

import {
  addFavorite,
  setPage,  
  fetchMovies,
  setCurrentSearch,
} from './Features/movies/movieSlice';
import './page.css';

export default function Home() {
  const dispatch = useDispatch();
  const { movies, loading, error, favorites, page, totalPages, currentTerm, currentFilters } =
    useSelector((state) => state.movies);

  const router = useRouter();
  
  const searchParams = useSearchParams();
  
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    setShowFavorites(searchParams.get('view') === 'favorites');
  }, [searchParams]);

  const [dark, setDark] = useState(true);

  const totalPagesActual = totalPages || 1;

  // Load initial movies
  useEffect(() => {
    // ✅ Initial load pe bhi currentSearch set karo
    dispatch(setCurrentSearch({ term: '', filters: {} }));
    dispatch(fetchMovies({ term: '', filters: {}, page: 1 }));
  }, [dispatch]);

  // Load saved favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    savedFavorites.forEach((movie) => dispatch(addFavorite(movie)));
  }, [dispatch]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ✅ Pagination — currentTerm & currentFilters use ho rahe hain
  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      dispatch(setPage(newPage));
      dispatch(fetchMovies({ term: currentTerm, filters: currentFilters, page: newPage }));
    }
  };

  const handleNextPage = () => {
    if (page < totalPagesActual) {
      const newPage = page + 1;
      dispatch(setPage(newPage));
      dispatch(fetchMovies({ term: currentTerm, filters: currentFilters, page: newPage }));
    }
  };

  return (
    <div className={dark ? 'container dark' : 'container light'}>
      {/* Dark/Light Toggle */}
      <button className="toggleBtn" onClick={() => setDark(!dark)}>
        {dark ? (
          <><IoSunnyOutline /> Light</>
        ) : (
          <><IoMoon /> Dark</>
        )}
      </button>

      <h1 className="title">Movie Explorer</h1>

      {/* Favorites Toggle */}
      <button
        className="show"
        onClick={() => router.push(showFavorites ? '/' : '/?view=favorites')}
      >
        {showFavorites ? 'Back to search' : `Favorites (${favorites.length})`}
      </button>

      {showFavorites ? (
        <div className="movieList">
          {favorites.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '40px' }}>
              No Favorite Movies Yet
            </p>
          ) : (
            favorites.map((movie, index) => (
              <MovieCard key={`${movie.id}-${index}`} movie={movie} />
            ))
          )}
        </div>
      ) : (
        <div>
          {/* SearchBar */}
          <SearchBar />

          {/* Loading/Error */}
          {loading && <Loader />}
          {error && <p className="error">{error}</p>}

          {/* Movie List */}
          <div className="movieList">
            {!loading && movies.filter(movie => movie.poster_path).length === 0 ? (
              <p style={{ textAlign: 'center', marginTop: '40px', color: '#c11212' }}>
                No movies found. Try a different search!
              </p>
            ) : (
              movies
                .filter(movie => movie.poster_path)
                .map((movie, index) => (
                  <MovieCard key={`${movie.id}-${index}`} movie={movie} />
                ))
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={page === 1}>
              Prev
            </button>

            <span>
              Page {page} of {totalPagesActual}
            </span>

            <button onClick={handleNextPage} disabled={page === totalPagesActual}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}