import UserPage from "../UserPage/UserPage.jsx";
import AdminPage from "../AdminPage/AdminPage.jsx";
import { useContext } from "react";
import { PageContext } from "../../App";

function MainPage() {
  const { user } = useContext(PageContext);

  console.log("Current User:", user);

  return (
    <div>
      {user === "User" && <UserPage />}
      {user === "Admin" && <AdminPage />}
    </div>
  );
}

export default MainPage;
