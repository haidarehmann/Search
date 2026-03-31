'use client';

import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../app/Features/movies/movieSlice';
import { useRouter } from 'next/navigation';
import './movieCard.css';

export default function MovieCard({ movie }) {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.movies.favorites);
  const router = useRouter();

  const isFavorite = favorites.some(
    (fav) => fav.id === movie.id
  );

  const handleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(movie));
    } else {
      dispatch(addFavorite(movie));
    }
  };

  return (
    <div className="card">

      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Image'
        }
        alt={movie.title}
        className="poster"
      />

      <h4 className="title">{movie.title}</h4>

      <p className="year">
        {movie.release_date
          ? movie.release_date.split('-')[0]
          : 'N/A'}
      </p>

      <button
        className="btn favBtn"
        onClick={handleFavorite}
      >
        {isFavorite
          ? "Remove Favorite"
          : "Add Favorite"}
      </button>

    </div>
  );
}