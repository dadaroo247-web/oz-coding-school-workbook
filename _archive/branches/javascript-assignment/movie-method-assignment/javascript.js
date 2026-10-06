const title = "인터스텔라";
let voteAverage = 8.7;
let voteCount = 32000;
const releaseDate = "2014-11-05";
const genre = "SF";

console.log(title);
console.log(voteAverage);
console.log(voteCount);
console.log(releaseDate);
console.log(genre);

let additionalVoteCount = 100;

console.log(voteCount + additionalVoteCount);

const category = "영화";

console.log(genre + category);

console.log("영화 제목: " + title);

console.log("평점: " + voteAverage);

console.log("개봉일: " + releaseDate);

console.log(`
  영화 제목: ${title}
  평점: ${voteAverage}
  개봉일: ${releaseDate}
  `);

//   인터스텔라는 2014-11-05에 개봉한 영화이며,
// 현재 평점은 8.7점이고 32000명이 평가했습니다.

const description = `${title}는 ${releaseDate}에 개봉한 영화이며,
현재 평점은 ${voteAverage}점이고 ${voteCount}명이 평가했습니다.`;

console.log(description);
