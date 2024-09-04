import { useContext } from "react";
import { PageContext } from "../../App";
import styles from "./LoginPage.module.css"

function LoginPage() {
  const { setPageState, setUser } = useContext(PageContext);

  function setOurUser(a) {
    setUser(a);
    setPageState("MainPage");
  }

  return (
    <div className= {styles.Container}>
      <div className= {styles.loginBox}>
        <h1 className= {styles.loginHeading}>Login</h1>
        <button className= {styles.LoginButton} onClick={() => setOurUser("User")}>USER</button>
        <button className= {styles.LoginButton} onClick={() => setOurUser("Admin")}>ADMIN</button>
        <div className = {styles.horizontalLine}></div>
        <p id={styles.ProjectBy}>BY AASHI SHUKLA</p>
      </div>
    </div>
  );
}

export default LoginPage;
