import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Blog from "./features/blog/Blog";
import SignUp from "./features/sign-up/SignUp";
import Login from "./features/login/Login";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas sem Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rotas com Header (usando MainLayout) */}
        <Route
          path="/blog"
          element={
            <MainLayout>
              <Blog />
            </MainLayout>
          }
        />
        {/* Adicione outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
