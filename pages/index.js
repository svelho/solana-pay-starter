import React from "react";
import HeadComponent from "../components/Head";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import Product from "../components/Product";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import CreateProduct from "../components/CreateProduct";

// Constants
const TWITTER_HANDLE = "SauloVelho";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // Isso buscará a chave pública dos usuários (endereço da carteira) de qualquer carteira que suportamos
  const { publicKey } = useWallet();
  const isOwner = publicKey
    ? publicKey.toString() == process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY
    : false;
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then((response) => response.json())
        .then((data) => {
          setProducts(data);
        });
    }
  }, [publicKey]);

  const renderNotConnectedContainer = () => (
    <div>
      <img className="gif-image" src="drones.jpg" alt="emoji" />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="App">
      <HeadComponent />
      <div className="container">
        <header className="header-container">
          <p className="header">Loja de Drones</p>
          <p className="sub-text">Aceitamos Criptomoeda</p>

          <img src="solana.png" />
          <br />
          <br />
          {isOwner && (
            <button
              className="download-button"
              onClick={() => setCreating(!creating)}
            >
              {creating ? "Close" : "Criar Produto"}
            </button>
          )}
        </header>
        <br />
        <main>
          {creating && <CreateProduct />}
          {/* Nós só renderizamos o botão de conexão se a chave pública não existir */}
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}

          <div className="button-container">
            <WalletDisconnectButton className="cta-button connect-wallet-button" />
          </div>
        </main>

        <div className="footer-container">
          <img
            alt="Twitter Logo"
            className="twitter-logo"
            src="twitter-logo.svg"
          />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`construido por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
