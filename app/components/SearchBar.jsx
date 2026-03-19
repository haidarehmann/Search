'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMovies } from '../Features/movies/movieSlice';

import './searchBar.css';

export default function SearchBar() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const dispatch = useDispatch();

  const handleSearch = () => {
    if (term.trim() !== '') {
      dispatch(fetchMovies(term));
    }
  };

  return (
    <div className="searchBox">
      

      <input
        className="input"
        type="text"
        placeholder="Search movie..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className="btn" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}