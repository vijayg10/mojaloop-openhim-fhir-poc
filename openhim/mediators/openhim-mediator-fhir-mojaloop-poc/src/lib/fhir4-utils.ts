// Copyright 2022 Digital Convergence Initiative
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import Logger from '@mojaloop/central-services-logger'
import dateFormat from 'dateformat'
import Config from '../shared/config'
import { PISPRequest, PISPResponse } from './pisp-utils'
import IDMapUtils from './id-map-utils'

export interface FHIR4Invoice {
  id: string;
  account: {
    reference: string;
  };
  recipient : any;
  totalGross: {
    value: number;
    currency: string;
  };
  identifier: Array<any>;
  issuer: any;
}

export interface FHIR4PaymentNotice {
  resourceType: string;
  identifier: Array<any>;
  status: string; // R!  active | cancelled | draft | entered-in-error
  request: {
    reference: string;
  };
  response: {
    reference: string;
  };
  created: string;
  provider: {
    reference: string;
  };
  payment: {
    reference: string;
  };
  paymentDate: string;
  payee: any;
  recipient: any;
  amount: {
    value: number;
    currency: string;
  };
  paymentStatus: {
    coding: any;
  }
}

// {
//   "resourceType" : "PaymentNotice",
//   // from Resource: id, meta, implicitRules, and language
//   // from DomainResource: text, contained, extension, and modifierExtension
//   "identifier" : [{ Identifier }], // Business Identifier for the payment notice
//   "status" : "<code>", // R!  active | cancelled | draft | entered-in-error
//   "request" : { Reference(Any) }, // Request reference
//   "response" : { Reference(Any) }, // Response reference
//   "created" : "<dateTime>", // R!  Creation date
//   "provider" : { Reference(Practitioner|PractitionerRole|Organization) }, // Responsible practitioner
//   "payment" : { Reference(PaymentReconciliation) }, // R!  Payment reference
//   "paymentDate" : "<date>", // Payment or clearing date
//   "payee" : { Reference(Practitioner|PractitionerRole|Organization) }, // Party being paid
//   "recipient" : { Reference(Organization) }, // R!  Party being notified
//   "amount" : { Money }, // R!  Monetary amount of the payment
//   "paymentStatus" : { CodeableConcept } // Issued or cleared Status of the payment
// }

const getUUIDIdentifier = (identifier: any[]) => {
  const UUIDIdentifier = identifier.find(item => {
    const codingItemUUID = item.type?.coding?.find((codingItem: any) => codingItem.code === 'UUID')
    if (codingItemUUID) {
      return true
    } else {
      return false
    }
  })
  return UUIDIdentifier.value
}

const convertFHIRInvoiceToMojaloopRequest = async (
  invoice: FHIR4Invoice
): Promise<PISPRequest> => {
  // const accountRefArr = invoice.account.reference.split('/')
  const recepientUUID = getUUIDIdentifier(invoice.recipient?.identifier)
  const mojaloopId = await IDMapUtils.getMojaloopId(recepientUUID)
  return {
    payeeIdType: mojaloopId.idType,
    payeeIdValue: mojaloopId.idValue,
    payerIdValue: getUUIDIdentifier(invoice.identifier),
    amount: invoice.totalGross.value + '',
    currency: invoice.totalGross.currency
  }
}

const convertMojaloopResponseToFHIRPaymentNotice = (
  fhir4Invoice: FHIR4Invoice,
  pispResponse: PISPResponse
): FHIR4PaymentNotice => {
  const now = new Date()
  const paymentNotice = {
    resourceType: 'PaymentNotice',
    identifier: fhir4Invoice.identifier,
    status: 'active',
    request: {
      reference: ''
    },
    response: {
      reference: ''
    },
    created: dateFormat(now, 'isoUtcDateTime'),
    provider: fhir4Invoice.issuer,
    payment: {
      reference: ''
    },
    paymentDate: dateFormat(now, 'yyyy-mm-dd'),
    payee: fhir4Invoice.account,
    recipient: fhir4Invoice.account,
    amount: {
      value: +pispResponse.initiateResponse?.authorization?.transferAmount?.amount,
      currency: pispResponse.initiateResponse?.authorization?.transferAmount?.currency
    },
    paymentStatus: {
      coding: [{
        system: 'https://github.com/mojaloop/mojaloop-specification/blob/master/fspiop-api/documents/v1.1-document-set/API%20Definition%20v1.1.md#7512-transactionstate',
        code: pispResponse.approveResponse?.transactionStatus?.transactionState
      }]
    }
  }
  return paymentNotice
}

export default {
  getUUIDIdentifier,
  convertFHIRInvoiceToMojaloopRequest,
  convertMojaloopResponseToFHIRPaymentNotice
}
