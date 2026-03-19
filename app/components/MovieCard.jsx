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
    (fav) => fav.imdbID === movie.imdbID
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
        src={movie.Poster}
        alt={movie.Title}
        className="poster"
      />

      <h4 className="title">{movie.Title}</h4>

      <p className="year">{movie.Year}</p>

      <button
        className="btn favBtn"
        onClick={handleFavorite}
      >
        {isFavorite
          ? "Remove Favorite"
          : "Add Favorite"}
      </button>

      <button
        className="btn detailsBtn"
        onClick={() =>
          router.push(`/movies/${movie.imdbID}`)
        }
      >
        View Details
      </button>
    </div>
  );
}