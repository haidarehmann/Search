'use client';
import { useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import './home.css';

export default function Home() {
  const { movies, loading, error } = useSelector(
    (state) => state.movies
  );

  return (
    <div>

      <h1 className="title">
        Movie Explorer
      </h1>

      <SearchBar />

      {loading && <Loader />}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <div className="movieList">

        {movies &&
          movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
            />
          ))}

      </div>

    </div>
  );
}