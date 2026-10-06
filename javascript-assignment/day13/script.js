const getMovieMessage = (title, voteAverage) => {
  return `${title}의 평점은 ${voteAverage}점입니다.`;
};

const message = getMovieMessage("인셉션", 8.4);

console.log(message);

const titleElement = document.querySelector(".title");
titleElement.textContent = "오늘의 추천 영화";

const descriptionElement = document.querySelector(".description");
descriptionElement.classList.add("text-primary", "fw-bold");

const movieList = document.querySelector("#movie-list");

const movieElement = document.createElement("div");
movieElement.textContent = message;

movieElement.classList.add("border", "rounded", "p-3", "mb-2");

movieList.append(movieElement);

const secondMessage = getMovieMessage("인터스텔라", 8.7);

const secondMovieElement = document.createElement("div");
secondMovieElement.textContent = secondMessage;

secondMovieElement.classList.add("border", "rounded", "p-3", "mb-2");

movieList.append(secondMovieElement);

// remove() 동작 확인 완료
// secondMovieElement.remove();
