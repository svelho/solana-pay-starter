import React from "react";
import HeadComponent from "../components/Head";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";

// Constants
const TWITTER_HANDLE = "_web3dev";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // Isso buscará a chave pública dos usuários (endereço da carteira) de qualquer carteira que suportamos
  const { publicKey } = useWallet();

  const renderNotConnectedContainer = () => (
    <div>
      <img className="gif-image" src="drones.jpg" alt="emoji" />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
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
        </header>
        <br />
        <main>
          {/* Nós só renderizamos o botão de conexão se a chave pública não existir */}
          {publicKey ? "Conectado!" : renderNotConnectedContainer()}

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
          >{`construido na @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
