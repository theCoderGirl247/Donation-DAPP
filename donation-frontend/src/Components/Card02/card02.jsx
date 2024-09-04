import styles from "./card02.module.css";

function Card01() {
  return (
    <div className={styles.Card}>
      <img className={styles.CardImg} src="/gg01.jpg" alt="Flood Image" />
      <h2 className={styles.CardTitle}>Terms and Conditions</h2>
      <div className={styles.textBox}>
        <p>
          1. The minimum donation amount is 0.1 ETH. <br />
          2. The maximum donation amount is 10 ETH. <br />
          3. Refunds must be requested within 7 days. After this period,
          withdrawals will not be possible. <br />
          4. Additionally, withdrawals will not be allowed once the fundraising
          goal is met. <br />
        </p>
      </div>
    </div>
  );
}

export default Card01;
