const recommendButton = document.querySelector("#recommend-button");
const recommendResult = document.querySelector("#recommend-result");

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");

const movieList = document.querySelector("#movie-list");

recommendButton.addEventListener("click", () => {
  recommendResult.textContent = "오늘의 추천 영화는 인셉션입니다.";
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const keyword = searchInput.value.trim();

  if (keyword === "") {
    return;
  }

  searchResult.textContent = `검색한 영화: ${keyword}`;

  searchInput.value = "";
});

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
];

movies.forEach((movie) => {
  console.log(`${movie.title}의 평점은 ${movie.voteAverage}점입니다.`);
});

movies.forEach((movie) => {
  const li = document.createElement("li");

  li.textContent = movie.title;

  movieList.append(li);
});
