const movies = [
  {
    title: "인셉션",
    voteAverage: 8.4,
  },
  {
    title: "인터스텔라",
    voteAverage: 8.7,
  },
  {
    title: "다크 나이트",
    voteAverage: 9.0,
  },
  {
    title: "테넷",
    voteAverage: 7.3,
  },
];

const foundMovie = movies.find((movie) => {
  return movie.title === "인터스텔라";
});

console.log(`${foundMovie.title}의 평점은 ${foundMovie.voteAverage}점입니다.`);

const highRatedMovies = movies.filter((movie) => {
  return movie.voteAverage >= 8.5;
});

console.log(highRatedMovies);

const movieTitles = movies.map((movie) => {
  return movie.title;
});

console.log(movieTitles);

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchKeyword = searchInput.value.trim().toLowerCase();

  searchResult.textContent = `검색어: ${searchKeyword}`;
});
