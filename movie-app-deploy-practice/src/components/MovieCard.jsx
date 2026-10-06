import { Link } from "react-router-dom";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      {movie.poster_path ? (
        <img
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={`${movie.title} 포스터`}
        />
      ) : (
        <div className="poster-empty">이미지 없음</div>
      )}

      <div className="movie-card-content">
        <h2>{movie.title}</h2>
        <p>평점: {movie.vote_average?.toFixed(1) ?? "-"}</p>
        <p>개봉일: {movie.release_date || "정보 없음"}</p>
        <Link to={`/movies/${movie.id}`}>상세 보기</Link>
      </div>
    </article>
  );
}

export default MovieCard;
