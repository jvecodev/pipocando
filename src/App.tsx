import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Blog from "./features/blog/Blog";
import SignUp from "./features/sign-up/SignUp";
import Login from "./features/login/Login";
import Home from "./features/home/Home";
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Rota padrão - Home */}
          <Route path="/" element={<Home />} />
          
          {/* Rotas sem Header */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />        
          <Route
            path="/blog"
            element={<Blog />}
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
