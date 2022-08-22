import axios from 'axios'
import { KVS } from './temp/kvs'
import { RedisConnectionConfig } from './temp/redis-connection'
import Config from '../shared/config'
import Logger from '@mojaloop/central-services-logger'
import assert from 'assert'

const config: RedisConnectionConfig = {
  ...Config.tempRedisConfig,
  logger: Logger
}
let kvs: KVS
const transactionRequestId = 'b51ec534-ee48-4575-b6a9-ead2955b8069'
// const lookupURI = `${env.outbound.baseUri}/thirdpartyTransaction/partyLookup`

const clearRedisKey = async (keyId: string) => {
  kvs = new KVS(config)
  await kvs.connect()
  await kvs.del(keyId)
  await kvs.disconnect()
}

const lookupRequest = async (payeeIdType: string, payeeIdValue: string) => {
  const lookupRequest = {
    payee: {
      partyIdType: payeeIdType,
      partyIdentifier: payeeIdValue
    },
    transactionRequestId
  }
  const lookupURI = `${Config.OUTBOUND_ENDPOINT}/thirdpartyTransaction/partyLookup`
  const lookupResponse = await axios.post<any>(lookupURI, lookupRequest)
  assert.equal(lookupResponse.status, 200)
  assert.equal(lookupResponse.data.currentState, 'partyLookupSuccess')
  return lookupResponse.data
}

const initiateRequest = async (payeeIdType: string, payeeIdValue: string, payerIdType: string, payerIdValue: string, amount: string, currency: string) => {
  const initiateURI = `${Config.OUTBOUND_ENDPOINT}/thirdpartyTransaction/${transactionRequestId}/initiate`
  const initiateRequest = {
    payee: {
      partyIdInfo: {
        partyIdType: payeeIdType,
        partyIdentifier: payeeIdValue,
        fspId: 'dfspb'
      }
    },
    payer: {
      partyIdType: payerIdType,
      partyIdentifier: payerIdValue,
      fspId: 'dfspa'
    },
    amountType: 'SEND',
    amount: {
      amount: amount,
      currency: currency
    },
    transactionType: {
      scenario: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER'
    },
    expiration: '2020-07-15T22:17:28.985-01:00'
  }

  const initiateresponse = await axios.post<any>(initiateURI, initiateRequest)
  assert.equal(initiateresponse.status, 200)
  assert.equal(initiateresponse.data.currentState, 'authorizationReceived')
  return initiateresponse.data
}

const approveRequest = async () => {
  const approveURI = `${Config.OUTBOUND_ENDPOINT}/thirdpartyTransaction/${transactionRequestId}/approve`
  const approveRequest = {
    authorizationResponse: {
      responseType: 'ACCEPTED',
      signedPayload: {
        signedPayloadType: 'FIDO',
        fidoSignedPayload: {
          id: '45c-TkfkjQovQeAWmOy-RLBHEJ_e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA',
          rawId: '45c+TkfkjQovQeAWmOy+RLBHEJ/e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA==',
          response: {
            authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAAACA==',
            clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiQUFBQUFBQUFBQUFBQUFBQUFBRUNBdyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIxODEiLCJjcm9zc09yaWdpbiI6ZmFsc2UsIm90aGVyX2tleXNfY2FuX2JlX2FkZGVkX2hlcmUiOiJkbyBub3QgY29tcGFyZSBjbGllbnREYXRhSlNPTiBhZ2FpbnN0IGEgdGVtcGxhdGUuIFNlZSBodHRwczovL2dvby5nbC95YWJQZXgifQ==',
            signature: 'MEUCIDcJRBu5aOLJVc/sPyECmYi23w8xF35n3RNhyUNVwQ2nAiEA+Lnd8dBn06OKkEgAq00BVbmH87ybQHfXlf1Y4RJqwQ8='
          },
          type: 'public-key'
        }
      }
    }
  }

  // send approve with signed authorization and wait for transfer to complete
  const approveResponse = await axios.post<any>(approveURI, approveRequest)
  assert.equal(approveResponse.status, 200)
  assert.equal(approveResponse.data.currentState, 'transactionStatusReceived')
  assert.equal(approveResponse.data.transactionStatus.transactionRequestState, 'ACCEPTED')
  return approveResponse.data
}

const sendMoney = async (sendMoneyRequest: SendMoneyRequest) => {
  await clearRedisKey(transactionRequestId)
  try {
    const lookupResponse = await lookupRequest(sendMoneyRequest.payeeIdType, sendMoneyRequest.payeeIdValue)
    const initiateResponse = await initiateRequest(sendMoneyRequest.payeeIdType, sendMoneyRequest.payeeIdValue, 'THIRD_PARTY_LINK', sendMoneyRequest.payerIdValue, sendMoneyRequest.amount, sendMoneyRequest.currency)
    const approveResponse = await approveRequest()
    return {
      lookupResponse,
      initiateResponse,
      approveResponse
    }
  } catch(err: any) {
    return {
      error: err.response?.data || err.message
    }
  }
}

export interface SendMoneyRequest {
  payerIdValue: string;
  payeeIdType: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}

export default {
  sendMoney
}
