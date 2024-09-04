import LoginPage from "./Components/LoginPage/LoginPage.jsx";
import MainPage from "./Components/MainPage/MainPage.jsx";
import { createContext, useState } from "react";

export const PageContext = createContext();

function App() {
  const [pageState, setPageState] = useState("LoginPage");
  const [user, setUser] = useState();

  return (
    <div>
      <PageContext.Provider value={{ pageState, setPageState, user, setUser }}>
        {pageState === "LoginPage" && <LoginPage />}
        {pageState === "MainPage" && <MainPage />}
      </PageContext.Provider>
    </div>
  );
}

export default App;
