import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Blog from "./features/blog/Blog";
import SignUp from "./features/sign-up/SignUp";
import Login from "./features/login/Login";
import Home from "./features/home/Home";
import Movies from "./features/movies/Movies";
import Series from "./features/series/Series";
import FAQ from "./features/faq/FAQ";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota padrão - Home */}
        <Route path="/" element={<Home />} />
        
        {/* Rotas sem Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />        
        <Route path="/blog" element={<Blog />} />
        
        {/* Novas rotas */}
        <Route path="/filmes" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </Router>
  );
}

export default App;
