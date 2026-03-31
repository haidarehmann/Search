'use client';

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
} from './Features/movies/movieSlice';
import './page.css';

export default function Home() {
  const dispatch = useDispatch();
  const { movies, loading, error, favorites, page, totalPages } =
    useSelector((state) => state.movies);

  const [showFavorites, setShowFavorites] = useState(false);
  const [dark, setDark] = useState(true);

  // Use totalPages directly, no 500-page cap
  const totalPagesActual = totalPages || 1;

  useEffect(() => {
    dispatch(fetchMovies({ term: '', filters: {}, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    const savedFavorites =
      JSON.parse(localStorage.getItem('favorites')) || [];
    savedFavorites.forEach((movie) => dispatch(addFavorite(movie)));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handlePrevPage = () => {
    if (page > 1) {
      dispatch(setPage(page - 1));
      dispatch(fetchMovies({ term: '', filters: {}, page: page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (page < totalPagesActual) {
      dispatch(setPage(page + 1));
      dispatch(fetchMovies({ term: '', filters: {}, page: page + 1 }));
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
      <button className="show" onClick={() => setShowFavorites(!showFavorites)}>
        {showFavorites ? `Back to search` : `Favorites (${favorites.length})`}
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
          <SearchBar />

          {loading && <Loader />}
          {error && <p className="error">{error}</p>}

          <div className="movieList">
            {movies &&
              movies.map((movie, index) => (
                <MovieCard key={`${movie.id}-${index}`} movie={movie} />
              ))}
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