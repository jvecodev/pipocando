import React, { useState, useEffect } from "react";

import Blog from "./blog/Blog";
import Home from "./home/home";

function App() {
  return (
    <>
      <Home/>
      <Blog />
    </>
  );
}

export default App;