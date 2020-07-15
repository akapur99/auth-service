/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { consentDB } from '../../../../lib/db'
import { Consent } from '../../../../model/consent'
import { post } from '../../../../../../src/server/handlers/consents/{ID}/generateChallenge'
import { putConsentId } from '../../../../../../src/shared/requests'
import { updateCredential } from '../../../../../../src/server/domain/consents/{ID}/generateChallenge'

/*
 * Mock Request + Response Resources
 */
// @ts-ignore
const request: Request = {
  headers: {
    fspiopsource: 'pisp-2342-2233',
    fspiopdestination: 'dfsp-3333-2123'
  },
  params: {
    id: '1234'
  }
}

// @ts-ignore
const requestNoHeaders: Request = {
  params: {
    id: '1234'
  }
}

// @ts-ignore
const h: ResponseToolkit = {
  response: (): ResponseObject => {
    const code = function (num: number): number {
      return num
    }
    return code as unknown as ResponseObject
  }
}

/*
 * Mock Consent Resources
 */
const partialConsent: Consent = {
  id: '1234',
  initiatorId: 'pisp-2342-2233',
  participantId: 'dfsp-3333-2123'
}

const partialConsent2: Consent = {
  id: '1234',
  initiatorId: 'pisp-2342-2234',
  participantId: 'dfsp-3333-2123'
}

const completeConsent: Consent = {
  id: '1234',
  initiatorId: 'pisp-2342-2233',
  participantId: 'dfsp-3333-2123',
  credentialId: '123',
  credentialType: 'FIDO',
  credentialStatus: 'PENDING',
  credentialChallenge: 'xyhdushsoa82w92mzs='
}

const nullConsent: Consent = null

// Declaring Mocks
const mockPutConsentId = putConsentId as jest.Mock
const mockUpdateCredential = updateCredential as jest.Mock

describe('server/handlers/consents/{ID}/generateChallenge', (): void => {
  beforeAll((): void => {
    mockUpdateCredential.mockResolvedValue(completeConsent)
    mockPutConsentId.mockResolvedValue(null)
  })

  it('Should return 202 success code', (): void => {
    const resp = post(
      request as Request,
      h as ResponseToolkit
    )
    expect(resp).toBe(h.response().code(202))
  })
})
