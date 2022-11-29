## PoC for initiating a thridparty transfer in mojaloop out of a fhir invoice

This is to demo a third party transfer using the following components
- OpenHIM
- FHIR-PIL OpenHIM Mediator
- Payments Interoperability Layer
- PISP payment manager
- Mojaloop Testing Toolkit

### Technical Architecture
![Technical Architecture Diagram](assets/diagrams/fhir-invoice-pisp-poc.drawio.svg)

### Deployment Instructions

- Clone this repository
- Start the services
  ```
  sudo docker-compose up
  ```
- Now, you can navigate to the OpenHIM-console at `http://localhost:9080`.
  The default username and password are:
  - username: `root@openhim.org`
  - password: `123456`

  > **Note:** You may have problems logging in if your OpenHIM server is still setup to use a self-signed certificate (the default). To get around this you can use the following workaround (the proper way to solve this is to upload a proper certificate into the OpenHIM-core):

  Visit the following link: `https://localhost:18080/authenticate/root@openhim.org` in Chrome. Make sure you are visiting this link from the system that is running the OpenHIM-core. Otherwise, replace `localhost` and `18080` with the appropriate OpenHIM-core server hostname and API port. You should see a message saying "**Your connection is not private**". Click "Advanced" and then click "Proceed". Once you have done this, you should see some JSON, you can ignore this and close the page. Ths will ignore the fact that the certificate is self-signed. Now, you should be able to go back to the Console login page and login. This problem will occur every now and then until you load a properly signed certificate into the OpenHIM-core server.

---

That's it, all the services are deployed.

### Have the following web pages ready to monitor the transaction
- OpenHIM console: Login to the console and goto 'Transaction Log'
- Run fhir4-mojaloop openhim mediator (You need to have node version v16.14.2 installed)
- Payee mobile app simulator: Open the URL http://localhost:16060/payeemobile and login with username '987654321' and don't need password
- Mojaloop Testing Toolkit Monitoring: Open the URL http://localhost:16060/admin/monitoring

### Making a transfer and monitor the logs
- Execute the following HTTP request either from command line or from postman.
```
  curl --location --request POST 'http://localhost:15001/fhir-pil/sendmoney/fhir4-invoice' --header 'Content-Type: application/json' --data-raw '{
  "resourceType": "Invoice",
  "id": "b88e5a38-35ad-4d8c-aad3-44b4ace8c0b1",
  "identifier": [
      {
          "type": {
              "coding": [
                  {
                      "system": "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/openimis-identifiers",
                      "code": "UUID"
                  }
              ]
          },
          "value": "b88e5a38-35ad-4d8c-aad3-44b4ace8c0b1"
      },
      {
          "type": {
              "coding": [
                  {
                      "system": "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/openimis-identifiers",
                      "code": "Code"
                  }
              ]
          },
          "value": "IV-UC-8156989548-105"
      }
  ],
  "status": "active",
  "type": {
      "coding": [
          {
              "system": "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/bill-type",
              "code": "policy",
              "display": "Policy"
          }
      ]
  },
  "recipient": {
      "reference": "Patient/D944AFE5-F1A9-45D1-BE82-7BE28719A7E1",
      "type": "Patient",
      "identifier": [{
          "type": {
              "coding": [
                  {
                      "system": "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/openimis-identifiers",
                      "code": "UUID"
                  }
              ]
          },
          "value": "D944AFE5-F1A9-45D1-BE82-7BE28719A7E1"
      }]
  },
  "date": "2022-04-22",
  "lineItem": [
      {
          "chargeItemCodeableConcept": {
              "coding": [
                  {
                      "system": "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/bill-charge-item",
                      "code": "policy",
                      "display": "Policy"
                  }
              ]
          },
          "priceComponent": [
              {
                  "extension": [
                      {
                          "url": "https://openimis.github.io/openimis_fhir_r4_ig//StructureDefinition/unit-price",
                          "valueMoney": {
                              "value": 2390.0,
                              "currency": "USD"
                          }
                      }
                  ],
                  "type": "base",
                  "code": {
                      "coding": [
                          {
                              "system": "Code",
                              "code": "Code",
                              "display": "IV-UC-8156989548-105"
                          }
                      ]
                  },
                  "factor": 1.0,
                  "amount": {
                      "value": 2390.0,
                      "currency": "USD"
                  }
              }
          ]
      }
  ],
  "totalNet": {
      "value": 2390.0,
      "currency": "USD"
  },
  "totalGross": {
      "value": 2390.0,
      "currency": "USD"
  }
}'
```

- You should get the 'Completed' status in the response and 'transactionRequestState' should be 'ACCEPTED' in the approveResponse body parameter.
- Open openHIM console on 'http://localhost:9080' with username 'root@openhim.org' and password '123456' (As we changed to this in previous step)
- Goto "Transaction Log" and you can find the transaction there.
- You can check various requests and response in TTK UI http://localhost:16060
- You should see the incoming notification in payee mobile app simulator

----
## Developer Onboarding

For running the application locally using node for development purposes, please follow the below guidelines.

### Prerequisites
- git
- nvm
- node version v16.15.0 (Installed with nvm)

### Running typescript application

- Clone this repository
- Open a terminal application and go to the directory `payments-interoperability-layer-3pp-poc`
- Set the correct nodejs version by running the following command
  ```
  nvm use
  ```
- If you get any error setting the node version, execute the following 
  ```
  nvm install v16.15.0
  ```
- Install dependent packages using the command `npm install`
- Run the application in developer mode by using `npm run dev`

**_Note: To make end-to-end flow working is tricky without using docker, because you need to setup the hostnames and ports in various component configurations._**