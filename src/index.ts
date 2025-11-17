// send x402 upload request

import { readFileSync } from "node:fs";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Signer, wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";
import {
    createData,
    EthereumSigner,
} from "@dha-team/arbundles/build/node/esm/index";

type UploadDataParams = {
    uploadUrl: string;
    dataPath: string;
    evmPrivateKey: `0x${string}`;
    maxMUSDCValue: bigint;
    // TODO: Consider support for tags, contentType, etc.
};

/** Load upload parameters from command line arguments  or use testing defaults */
function loadArguments(): UploadDataParams {
    const defaultUploadUrl = "https://upload.ardrive.dev";
    const defaultDataPath = "fixtures/4byte.txt";
    const defaultEvmPkeyPath =
        "fixtures/0x20c1DF6f3310600c8396111EB5182af9213828Dc.eth.pk.txt";

    const uploadUrl = process.argv.includes("--url")
        ? process.argv[process.argv.indexOf("--url") + 1]
        : defaultUploadUrl;

    const dataPath = process.argv.includes("--path")
        ? process.argv[process.argv.indexOf("--path") + 1]
        : defaultDataPath;

    const evmWalletPathOrPkey = process.argv.includes("--wallet")
        ? process.argv[process.argv.indexOf("--wallet") + 1]
        : defaultEvmPkeyPath;

    const maxUSDCValue = BigInt(
        process.argv.includes("--max-usdc")
            ? process.argv[process.argv.indexOf("--max-usdc") + 1]
            : 1 // Default 1 USDC
    );

    let evmPrivateKey: string;
    if (evmWalletPathOrPkey.startsWith("0x")) {
        evmPrivateKey = evmWalletPathOrPkey;
    } else {
        evmPrivateKey = JSON.parse(
            readFileSync(evmWalletPathOrPkey, "utf-8")
        ).trim();
    }

    // TypeGuard for EVM private key format (viem/account expects `0x` prefixed string)
    function isEVMPrivateKey(key: string): key is `0x${string}` {
        return key.startsWith("0x") && key.length === 66; // Could import ethers for most robust check
    }

    if (!isEVMPrivateKey(evmPrivateKey)) {
        throw new Error("Invalid EVM private key format.");
    }

    return {
        uploadUrl,
        dataPath,
        evmPrivateKey,
        maxMUSDCValue: maxUSDCValue * BigInt(1_000_000), // Convert to base units (6 decimals)
    };
}

async function uploadData() {
    const { evmPrivateKey, dataPath, uploadUrl, maxMUSDCValue } =
        loadArguments();

    const client = createWalletClient({
        account: privateKeyToAccount(evmPrivateKey),
        transport: http(),
        chain: baseSepolia,
    }) as unknown as Signer;

    // Create ANS-104 data item from file data
    const signer = new EthereumSigner(evmPrivateKey);
    const dataItem = createData(readFileSync(dataPath), signer);
    await dataItem.sign(signer);

    // Make a request that may require payment
    const fetchWithPay = wrapFetchWithPayment(fetch, client, maxMUSDCValue);
    const response = await fetchWithPay(uploadUrl + "/x402/data-item/signed", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: dataItem.getRaw() as BodyInit,
    });

    // Log response and parse the returned data
    console.log(response);
    console.log(await response.json());
}

uploadData().catch((error) => {
    console.error("Error uploading data:", error);
});
