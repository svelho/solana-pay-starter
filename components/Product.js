import React from "react";
import styles from "../styles/Product.module.css";
import IPFSDownload from "./IpfsDownload";
import Buy from "./Buy";

export default function Product({ product }) {
  const { id, name, price, priceSol, description, image_url } = product;

  return (
    <div className={styles.product_container}>
      <div>
        <img className={styles.product_image} src={image_url} alt={name} />
      </div>

      <div className={styles.product_details}>
        <div className={styles.product_text}>
          <div className={styles.product_title}>{name}</div>
          <div className={styles.product_description}>{description}</div>
        </div>

        <div className={styles.product_action}>
          <div className={styles.product_price}>{price} USDC</div>
          <div className={styles.product_price}>{priceSol} SOL</div>

          {/* Estou usando um código rígido. Isto por enquanto. Vamos buscar o hash da API mais tarde.*/}
          {/* <IPFSDownload
            filename="BROADREAM-S9-blue.jpg"
            hash="QmPKUqc6DuWSvMrgTETyXDnYhgvDiU4hr5WWSHC4sdLdXg"
            cta="Download emojis"
          /> */}
        </div>
        <br />
        <div>
          <Buy itemID={id} />
        </div>
      </div>
    </div>
  );
}
