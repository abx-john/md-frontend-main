import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<h2>Home Page</h2>} />
      <Route path="/about" element={<h2>About Page</h2>} />
      <Route path="/contact" element={<h2>Contact Page</h2>} />
    </Routes>
  );
};
export default App;
