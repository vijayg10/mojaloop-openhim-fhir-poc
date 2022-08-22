# Thirdparty Core Connector

Thirdparty Core Connector to work with thirdparty-sdk

## Configuration

Refer to the [.env.example](./.env.example) for a description of configurable environment variables.

## Starting Application

1. Make a copy of [.env.example](./.env.example) as `.env`

2. Modify `.env` to suite your environment

3. Start Connector

    ```bash
    npm start
    ```

## Sample request
```
curl --location --request POST 'http://localhost:3003/sendmoney' --header 'Content-Type: application/json' --data-raw '{
  "payerIdValue": 1234567890,
  "payeeIdType": "MSISDN",
  "payeeIdValue": 9876543210,
  "amount": 10,
  "currency": "EUR"
}'
```

## TODO

- Update the CALLBACK_TIMEOUT to ms instead of seconds for consistency
- Re-factor [cache.js](./src/lib/cache.js) into Typescript
