/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Abhimanyu Kapur <abhi.kapur09@gmail.com>

 --------------
 ******/

import { Request } from '@hapi/hapi'
import { consentDB } from '../../../../lib/db'
import { Consent } from '../../../../model/consent'
import { put } from '../../../handlers/consents/{ID}'

export const isConsentRequestValid = function (request: Request, consent: Consent): boolean {
  if (consent != null &&
      (consent.initiatorId === request.params.FSPIOP_Source &&
      consent.participantId === request.params.FSPIOP_Destination)) {
    return true
  }

  return false
}

export const genChallenge = async function (request: Request, consent: Consent): Promise<void> {
  // If there is no pre-existing challenge for the consent id
  // Generate one and update the database
  if (consent.credentialChallenge == null) {
    // Challenge generation
    const crypto = require('crypto')
    let challenge = ''
    crypto.randomBytes(32, (err: Error, buf): void => {
      if (err) throw err
      challenge = buf.toString('base64')
    })

    // TODO Update consent credentials

    // TODO Update in database
  }

  // Construct body of outgoing request

  // Call PUT consents/{ID}
  // TODO
}
