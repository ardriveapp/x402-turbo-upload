# x402-turbo-upload

A simple TypeScript script and command line tool to upload data items to the x402 Turbo Upload Service.

## Usage

```sh
yarn && yarn build
node dist/index.js --url <UPLOAD_URL> --path <DATA_PATH> --wallet <EVM_PKEY_OR_PATH> --max-usdc <MAX_USDC_VALUE> --content-type <CONTENT_TYPE>
```

-   `DATA_PATH`: The path to the data file to be uploaded.
-   `EVM_PKEY_OR_PATH`: The EVM private key or the path to a file containing the EVM private key used for signing.
-   `UPLOAD_URL`: (Optional) Custom upload service URL. Defaults to `https://upload.ardrive.io`.
-   `MAX_USDC_VALUE`: (Optional) The maximum USDC value for the upload. Specified in USDC standard units (e.g., `10` for $10 USDC).
-   `CONTENT_TYPE`: (Optional) The content type of the data being uploaded.

## Example

```sh
node dist/index.js --path ./data/file.txt --wallet "0xYOUR_PRIVATE_KEY" --max-usdc 10 --content-type "text/plain"
```

## Notes

This is a minimal example for demonstration purposes of x402 with Turbo Upload Service API. In a production environment, ensure to handle errors, edge cases, and security considerations appropriately.
