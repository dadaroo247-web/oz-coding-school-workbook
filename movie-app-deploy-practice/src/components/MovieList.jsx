import MovieCard from "./MovieCard";

function MovieList({ movies, isLoading, error }) {
  if (isLoading) {
    return <p className="message">영화 정보를 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p className="message error">{error}</p>;
  }

  if (movies.length === 0) {
    return <p className="message">검색 결과가 없습니다.</p>;
  }

  return (
    <section className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}

export default MovieList;
