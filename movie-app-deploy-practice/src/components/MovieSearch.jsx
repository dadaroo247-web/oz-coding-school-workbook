import { useEffect, useState } from "react";
import MovieList from "./MovieList";

const API_BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

function MovieSearch() {
  const [movies, setMovies] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      if (!TOKEN) {
        setError("VITE_TMDB_TOKEN이 설정되지 않았습니다.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const path = searchKeyword ? "/search/movie" : "/movie/popular";
        const params = new URLSearchParams({
          language: "ko-KR",
          page: String(page),
        });

        if (searchKeyword) {
          params.set("query", searchKeyword);
        }

        const response = await fetch(`${API_BASE_URL}${path}?${params.toString()}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`영화 정보를 불러오지 못했습니다. (${response.status})`);
        }

        const data = await response.json();
        setMovies(data.results ?? []);
        setTotalPages(Math.min(data.total_pages ?? 1, 500));
      } catch (requestError) {
        setMovies([]);
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [page, searchKeyword]);

  function handleSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearchKeyword(keyword.trim());
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>Movie App</h1>
        <p>TMDB 영화 검색 · Pagination · 상세 페이지</p>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="영화 제목을 검색하세요"
        />
        <button type="submit">검색</button>
      </form>

      <MovieList movies={movies} isLoading={isLoading} error={error} />

      {!isLoading && !error && movies.length > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}
    </main>
  );
}

export default MovieSearch;
