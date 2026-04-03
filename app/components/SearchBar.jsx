'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMovies, setPage, setCurrentSearch } from '../Features/movies/movieSlice';
import './searchBar.css';

export default function SearchBar() {
  const dispatch = useDispatch();

  const [term, setTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    rating: '',
    language: '',
    year: '',
  });

  //  Search handler
  const handleSearch = () => {
    dispatch(setPage(1));

    // Save current search term & filters
    dispatch(setCurrentSearch({ term, filters }));

    dispatch(fetchMovies({ term, filters, page: 1 }));
  };

  //  Reset handler
  const handleReset = () => {
    const resetFilters = { genre: '', rating: '', language: '', year: '' };
    setTerm('');
    setFilters(resetFilters);

    dispatch(setPage(1));

    // Reset search in Redux
    dispatch(setCurrentSearch({ term: '', filters: resetFilters }));

    dispatch(fetchMovies({ term: '', filters: resetFilters, page: 1 }));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="searchContainer">
      <div className="searchBox">
        <input
          type="text"
          placeholder="Search movies..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleReset} className="resetBtn">Reset</button>
      </div>

      <div className="filters">
        {/* Genre */}
        <select name="genre" value={filters.genre} onChange={handleFilterChange}>
          <option value="">All Genres</option>
          <option value="28">Action</option>
          <option value="12">Adventure</option>
          <option value="16">Animation</option>
          <option value="35">Comedy</option>
          <option value="80">Crime</option>
          <option value="99">Documentary</option>
          <option value="18">Drama</option>
          <option value="10751">Family</option>
          <option value="14">Fantasy</option>
          <option value="36">History</option>
          <option value="27">Horror</option>
          <option value="10402">Music</option>
          <option value="9648">Mystery</option>
          <option value="10749">Romantic</option>
          <option value="10770">TV Movie</option>
          <option value="53">Thriller</option>
          <option value="10752">War</option>
          <option value="37">Western</option>
        </select>

        {/* Rating */}
        <select name="rating" value={filters.rating} onChange={handleFilterChange}>
          <option value="">All Ratings</option>
          <option value="5">5+</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
          <option value="9">9+</option>
        </select>

        {/* Language */}
        <select name="language" value={filters.language} onChange={handleFilterChange}>
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ur">Urdu</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="tr">Turkish</option>
        </select>

        {/* Year */}
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">All Years</option>
          {Array.from({ length: 30 }, (_, i) => 1997 + i).map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>
    </div>
  );
}