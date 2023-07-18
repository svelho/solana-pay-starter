import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import products from "./products.json";

//SPL Token Address
const usdcAddress = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
// Certifique-se de substituir isto pelo endereço de sua carteira!
const sellerAddress = "BVwUx9MruKKnbKRMqPtcq3kqtWArye44WCnEFSPeHcVQ";

const sellerPublicKey = new PublicKey(sellerAddress);
let transferInstruction;

const createTransaction = async (req, res) => {
  try {
    // Extraia os dados da transação do órgão solicitante
    const { buyer, orderID, itemID, currency } = req.body;
    console.log("createTransation", buyer, orderID, itemID);

    // Se não tivermos algo que precisamos, paramos!
    if (!buyer) {
      return res.status(400).json({
        message: "Missing buyer address",
      });
    }

    if (!orderID) {
      return res.status(400).json({
        message: "Missing order ID",
      });
    }

    if (!itemID) {
      return res.status(400).json({
        message: "Missing item ID",
      });
    }

    if (!currency) {
      return res.status(400).json({
        message: "Missing currency",
      });
    }

    // Pegue o preço do item de products.json usando itemID
    let itemPrice;
    if (currency === "sol")
      itemPrice = products.find((item) => item.id === itemID).priceSol;
    else itemPrice = products.find((item) => item.id === itemID).price;

    if (!itemPrice) {
      return res.status(404).json({
        message: "Item não encontrado. Por favor, verifique o ID do item",
      });
    }

    // Converta nosso preço para o formato correto
    const bigAmount = BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Devnet;
    //const network = WalletAdapterNetwork.Mainnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);
    console.log("chegou 3");
    const buyerUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      buyerPublicKey
    );
    const shopUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      sellerPublicKey
    );
    //Um blockhash (hash de bloco) é como uma identificação para um bloco. Ele permite que você identifique cada bloco.
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    console.log("chegou 4");
    // Isto é novo, estamos recebendo o endereço da cunhagem do token que queremos transferir //general erros //TokenInvalidAccountOwnerError
    let usdcMint;
    if (currency != "sol") usdcMint = await getMint(connection, usdcAddress);

    // As duas primeiras coisas que precisamos - uma identificação recente do bloco
    // e a chave pública do pagador da taxa
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });
    console.log("chegou 5");
    // Esta é a "ação" que a transação realizará
    // Vamos apenas transferir algum SOL
    console.log(currency);
    if (currency === "sol") {
      console.log("chegou sol");
      transferInstruction = SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        // Lamports são a menor unidade do SOL, como a Gwei é da Ethereum
        lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
        toPubkey: sellerPublicKey,
      });
    } else {
      // Aqui estamos criando um tipo diferente de instrução de transferência
      transferInstruction = createTransferCheckedInstruction(
        buyerUsdcAddress,
        usdcAddress, // Este é o endereço do token que queremos transferir
        shopUsdcAddress,
        buyerPublicKey,
        bigAmount.toNumber() * 10 ** (await usdcMint).decimals,
        usdcMint.decimals // O token pode ter qualquer número de decimais
      );
    }
    console.log("chegou 6");
    // Estamos acrescentando mais instruções à transação
    transferInstruction.keys.push({
      // Usaremos nosso OrderId para encontrar esta transação mais tarde
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    // Formatando nossa transação
    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "error creating tx" });
    return;
  }
};

export default function handler(req, res) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}
