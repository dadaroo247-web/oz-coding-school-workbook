import { Route, Routes } from "react-router-dom";
import MovieDetail from "./components/MovieDetail";
import MovieSearch from "./components/MovieSearch";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MovieSearch />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
    </Routes>
  );
}

export default App;
