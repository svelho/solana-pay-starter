import React, { useState, useMemo, useEffect } from "react";
import { findReference, FindReferenceError } from "@solana/pay";
import { Keypair, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InfinitySpin } from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";
import { addOrder, hasPurchased, fetchItem } from "../lib/api";

const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};

export default function Buy({ itemID }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order
  let currency = "sol";

  //const [paid, setPaid] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state of all above
  const [status, setStatus] = useState(STATUS.Initial); // Acompanhamento do status da transação
  const [item, setItem] = useState(null); // hash IPFS & nome do arquivo do item comprado

  // // useMemo é um gancho do React que só computa o valor se as dependências mudarem
  var order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
      currency: currency,
    }),
    [publicKey, orderID, itemID, currency]
  );

  // Pegue o objeto transação do servidor
  const processTransaction = async () => {
    setLoading(true);
    const txResponse = await fetch("../api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    const txData = await txResponse.json();

    // Nós criamos um objeto transação
    console.log("chegou", txData);
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);

    // Tente enviar a transação para a rede
    try {
      // Envie a transação para a rede
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `Transação enviada: https://solscan.io/tx/${txHash}?cluster=devnet`
      );
      // console.log(
      //   `Transação enviada: https://solscan.io/tx/${txHash}?cluster=mainnet`
      // );
      setStatus(STATUS.Submitted);
      // Mesmo que isso possa falhar, por ora, vamos apenas torná-lo realidade
      //setPaid(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se este endereço já comprou este item
    // Se for o caso, buscar o item e ajustar o pagamento para verdadeiro
    // Função Async para evitar o bloqueio da IU
    async function checkPurchased() {
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        const item = await fetchItem(itemID);
        setItem(item);
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);

  useEffect(() => {
    // Verifique se a transação foi confirmada
    if (status == STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          console.log("buscando referencia");
          const result = await findReference(connection, orderID);
          console.log("chegou aqui", result);
          console.log(
            "Encontrando referência da tx",
            result.confirmationStatus
          );
          if (
            result.confirmationStatus === "confirmed" ||
            result.confirmationStatus === "finalized"
          ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            addOrder(order);
            setLoading(false);
            alert("Obrigado por sua compra!");
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            console.log("FindReferenceError");
            return null;
          } else {
            console.error("Erro desconhecido", e);
            clearInterval(interval);
          }
        } finally {
          setLoading(false);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }

    async function getItem(itemID) {
      const item = await fetchItem(itemID);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }
  }, [status]);

  if (!publicKey) {
    return (
      <div>
        <p>É necessário conectar sua carteira para realizar a transação</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="gray" />;
  }

  return (
    <div>
      {/* Exibir ou o botão de compra ou o componente IPFSDownload com base na existência de Hash */}
      {item ? (
        <IPFSDownload
          filename={item.filename}
          hash={item.hash}
          cta="Download drone picture"
        />
      ) : (
        <button
          disabled={loading}
          className="buy-button"
          onClick={() => {
            const confirmBox = window.confirm("Deseja pagar em solana?");
            if (confirmBox === true) {
              order.currency = "sol";
            } else {
              order.currency = "usdc";
            }
            processTransaction();
          }}
        >
          Compre Agora 🛒
        </button>
      )}
    </div>
  );
}
