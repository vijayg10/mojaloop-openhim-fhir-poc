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

import {activateHeartbeat, registerMediator} from 'openhim-mediator-utils'
import Logger from '@mojaloop/central-services-logger'

import Config from '../shared/config'
import { FHIR4Invoice, FHIR4PaymentNotice } from './fhir4-utils'
import { PISPResponse } from './pisp-utils'

let urn: string

const setMediatorUrn = (mediatorUrn: string) : void => {
  urn = mediatorUrn
}

// The OpenHIM accepts a specific response structure which allows transactions to display correctly
// The openhimTransactionStatus can be one of the following values:
// Successful, Completed, Completed with Errors, Failed, or Processing
const buildReturnObject = (
  openhimTransactionStatus: string,
  httpResponseStatusCode: string,
  responseBody: any
) => {
  const response = {
    status: httpResponseStatusCode,
    headers: {'content-type': 'application/json'},
    body: responseBody,
    timestamp: new Date()
  }
  return {
    'x-mediator-urn': urn,
    status: openhimTransactionStatus,
    response,
    properties: { property: 'Primary Route' }
  }
}

const mediatorSetup = () => {
  // The mediatorConfig contains some basic configuration settings about the mediator
  // as well as details about the default channel setup.

  const mediatorConfig = Config.MEDIATOR_CONFIG

  setMediatorUrn(mediatorConfig.urn)

  // The purpose of registering the mediator is to allow easy communication between the mediator and the OpenHIM.
  // The details received by the OpenHIM will allow quick channel setup which will allow tracking of requests from
  // the client through any number of mediators involved and all the responses along the way(if the mediators are
  // properly configured). Moreover, if the request fails for any reason all the details are recorded and it can
  // be replayed at a later date to prevent data loss.
  registerMediator(Config.OPENHIM_CONFIG, mediatorConfig, (err: { message: any }) => {
    if (err) {
      throw new Error(
        `Failed to register mediator. Check your Config: ${err.message}`
      )
    }

    Logger.info('Successfully registered mediator!')

    // The activateHeartbeat method returns an Event Emitter which allows the mediator to attach listeners waiting
    // for specific events triggered by OpenHIM responses to the mediator posting its heartbeat.
    // const emitter = activateHeartbeat(Config.OPENHIM_CONFIG)
    // emitter.on('error', err => {
    //   Logger.error(`Heartbeat failed: ${JSON.stringify(err)}`)
    // })
  })
}

export default {
  setMediatorUrn,
  buildReturnObject,
  mediatorSetup
}
