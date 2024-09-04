import styles from './card01.module.css'; 

function Card01() {
  return (
    <div className={styles.Card}>
       <img className={styles.CardImg} src="/gg02.jpg" alt="Flood Image" />
      <h2 className={styles.CardTitle}>Purpose</h2>
      <div className= {styles.textBox}>
      <p>Your generosity can make a difference in helping Tripura recover from the devastating floods. Every donation counts towards rebuilding homes, restoring livelihoods, and bringing hope to those affected. Stand with us in this crucial time—your support is more than just a contribution; it&#39;s a lifeline for many.</p>
      </div>
    </div>
  );
}

export default Card01;
