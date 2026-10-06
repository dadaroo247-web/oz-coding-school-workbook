import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovieDetail() {
      if (!TOKEN) {
        setError("VITE_TMDB_TOKEN이 설정되지 않았습니다.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/movie/${id}?language=ko-KR`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`상세 정보를 불러오지 못했습니다. (${response.status})`);
        }

        const data = await response.json();
        setMovie(data);
      } catch (requestError) {
        setMovie(null);
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovieDetail();
  }, [id]);

  if (isLoading) {
    return (
      <main className="container">
        <p className="message">상세 정보를 불러오는 중입니다.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p className="message error">{error}</p>
        <Link to="/">목록으로 돌아가기</Link>
      </main>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <main className="container">
      <Link className="back-link" to="/">
        ← 목록으로 돌아가기
      </Link>

      <article className="movie-detail">
        {movie.poster_path ? (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={`${movie.title} 포스터`}
          />
        ) : (
          <div className="poster-empty detail-poster">이미지 없음</div>
        )}

        <div>
          <h1>{movie.title}</h1>
          <p>평점: {movie.vote_average?.toFixed(1) ?? "-"}</p>
          <p>개봉일: {movie.release_date || "정보 없음"}</p>
          <p>{movie.overview || "줄거리 정보가 없습니다."}</p>
        </div>
      </article>
    </main>
  );
}

export default MovieDetail;
