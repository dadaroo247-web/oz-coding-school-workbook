// 01. 영화 객체 만들기

const movie = {
  id: 1,
  title: "인셉션",
  voteAverage: 8.4,
  voteCount: 35000,
  releaseDate: "2010-07-15",
  isFavorite: false,
};

// 객체 값 출력

console.log(movie.title);
console.log(movie.voteAverage);
console.log(movie.isFavorite);

// 02. 평점으로 영화 분류하기

if (movie.voteAverage >= 8) {
  console.log("추천 영화");
} else {
  console.log("일반 영화");
}

// 03. 평점 + 평가수 조건

if (movie.voteAverage >= 8 && movie.voteCount >= 30000) {
  console.log("인기 추천 영화");
} else {
  console.log("일반 영화");
}

// 04. 삼항 연산자

const favoriteButtonText = movie.isFavorite ? "찜 해제" : "찜하기";

console.log(favoriteButtonText);

// 06. 배열 안 데이터 가져오기

console.log(movies[0].title);

console.log(movies[1].voteAverage);

console.log(movies[2].releaseDate);

console.log(movies.length);

// 07. 첫 번째 영화 수정

movies[0].voteAverage = 8.5;

console.log(movies[0].voteAverage);

// 07. 새로운 영화 추가

movies.push({
  id: 4,
  title: "다크 나이트",
  voteAverage: 9.0,
  releaseDate: "2008-07-16",
});

console.log(movies.length);
