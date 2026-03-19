'use client';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import MovieCard from '../components/MovieCard';

export default function Favorites() {
  const favorites = useSelector((state) => state.movies.favorites);

  return (
    <div>
      <div className="movieList">
        <h1 className="title">Favorite Movies</h1>
        {favorites.length === 0 ? (
          <p className="empty">No Favorite Movies Yet</p>
        ) : (
          favorites.map((movie, index) => (
            <MovieCard
              key={`${movie.imdbID}-${index}`}
              movie={movie}
            />
          ))
        )}
      </div>
    </div>
  );
}