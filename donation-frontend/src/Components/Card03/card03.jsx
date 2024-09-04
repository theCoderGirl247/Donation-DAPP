import styles from "./card03.module.css";
import { DonateContext } from "../UserPage/UserPage";
import { useContext } from "react";

function Card03() {
  const { donatedAmount } = useContext(DonateContext);

  return (
    <div className={styles.Card}>
      <img className={styles.CardImg} src="/gg04.jpg" alt="Flood Image" />
      <h2 className={styles.CardTitle}>Contribution</h2>
      <div className={styles.textBox}>
        <p>
          Your contribution is incredibly valuable to us. The recent floods have
          devastated numerous homes and buildings, and many people have
          tragically lost loved ones. Your donation will provide essential
          support to those affected, helping to rebuild schools, repair roads,
          and supply food and other necessities. <br />
          <br />
          Total contribution: {donatedAmount} ETH <br />
        </p>
      </div>
    </div>
  );
}

export default Card03;
