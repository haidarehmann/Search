'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import Loader from './components/Loader';
import { addFavorite } from './Features/movies/movieSlice';
import './page.css';

export default function Home() {
  const dispatch = useDispatch();
  const { movies, loading, error, favorites } = useSelector(
    (state) => state.movies
  );
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    savedFavorites.forEach((movie) => dispatch(addFavorite(movie)));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <div className="container">
      <h1 className="title">Movie Explorer</h1>

      <button className="show" onClick={() => setShowFavorites(!showFavorites)}>
        {showFavorites ? 'Back to Search' : `Favorites (${favorites.length})`}
      </button>

      {showFavorites ? (
        <div className="movieList">
          {favorites.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '40px' }}>
              No Favorite Movies Yet
            </p>
          ) : (
            favorites.map((movie, index) => (
              <MovieCard key={`${movie.imdbID}-${index}`} movie={movie} />
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
                <MovieCard key={`${movie.imdbID}-${index}`} movie={movie} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}