/* eslint-disable max-len */
/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the 'License') and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files
 are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
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
import { consentDB } from '../../../../../../src/lib/db'
import { Consent } from '../../../../../../src/model/consent'
import { post } from '../../../../../../src/server/handlers/consents/{ID}/generateChallenge'
import { generate } from '../../../../../../src/lib/challenge'
import { updateCredential, isConsentRequestValid, putConsentId } from '../../../../../../src/server/domain/consents/{ID}/generateChallenge'

// Declaring Mocks
const mockPutConsentId = jest.fn(putConsentId)
const mockUpdateCredential = jest.fn(updateCredential)
const mockGenerate = jest.fn(generate)
const mockIsConsentRequestValid = jest.fn(isConsentRequestValid)
const mockConsentDbRetrieve = jest.fn(consentDB.retrieve)

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

const completeConsent: Consent = {
  id: '1234',
  initiatorId: 'pisp-2342-2233',
  participantId: 'dfsp-3333-2123',
  credentialId: '123',
  credentialType: 'FIDO',
  credentialStatus: 'PENDING',
  credentialChallenge: 'xyhdushsoa82w92mzs='
}

const challenge = 'xyhdushsoa82w92mzs='

describe('server/handlers/consents/{ID}/generateChallenge', (): void => {
  beforeAll((): void => {
    mockUpdateCredential.mockResolvedValue(completeConsent)
    mockGenerate.mockResolvedValue('xyhdushsoa82w92mzs=')
    mockIsConsentRequestValid.mockReturnValue(true)
    mockConsentDbRetrieve.mockResolvedValue(partialConsent)
    mockPutConsentId.mockResolvedValue(2)

    // mockPutConsentId.mockResolvedValue(null)
    // mockRequests.putConsentId = jest.fn().mockResolvedValueOnce(null)
    // mockRequests.putConsentId = jest.fn((): Promise<any> => Promise.resolve(null))
  })

  it('Should return 202 success code', async (): Promise<void> => {
    const response = await post(
      request as Request,
      h as ResponseToolkit
    )
    expect(response).toBe(h.response().code(202))

    expect(mockIsConsentRequestValid).toHaveBeenCalledWith(request, partialConsent)
    expect(mockConsentDbRetrieve).toHaveBeenCalledWith(request.params.id)
    expect(mockGenerate).toHaveBeenCalledWith()
    expect(mockUpdateCredential).toHaveBeenCalledWith(partialConsent, challenge, 'FIDO', 'PENDING')
    expect(mockPutConsentId).toHaveBeenCalledWith(completeConsent, request)
  })

  it('Should throw an error due to consent retrieval error', (): void => {
    mockConsentDbRetrieve.mockRejectedValueOnce(new Error('Id does not exist in database'))
    expect(async (): Promise<void> => {
      await post(request as Request, h as ResponseToolkit)
    }).toThrowError()

    expect(mockIsConsentRequestValid).not.toHaveBeenCalled()
    expect(mockConsentDbRetrieve).toHaveBeenCalledWith(request.params.id)
    expect(mockGenerate).not.toHaveBeenCalled()
    expect(mockUpdateCredential).not.toHaveBeenCalled()
    expect(mockPutConsentId).not.toHaveBeenCalled()
  })

  // TODO - confirm JOI validation handles
  it('Should return 400 code due to invalid request', async (): Promise<void> => {
    mockIsConsentRequestValid.mockReturnValueOnce(false)
    const response = await post(
      request as Request,
      h as ResponseToolkit
    )
    expect(response).toBe(h.response().code(400))

    expect(mockIsConsentRequestValid).toHaveBeenCalled()
    expect(mockConsentDbRetrieve).toHaveBeenCalled()
    expect(mockGenerate).not.toHaveBeenCalled()
    expect(mockUpdateCredential).not.toHaveBeenCalled()
    expect(mockPutConsentId).not.toHaveBeenCalled()
  })

  it('Should throw an error due to error in challenge generation', (): void => {
    mockGenerate.mockRejectedValueOnce(new Error('Error generating challenge'))
    expect(async (): Promise<void> => {
      await post(request as Request, h as ResponseToolkit)
    }).toThrowError()

    expect(mockIsConsentRequestValid).toHaveBeenCalledWith(request, partialConsent)
    expect(mockConsentDbRetrieve).toHaveBeenCalledWith(request.params.id)
    expect(mockGenerate).toHaveBeenCalledWith()
    expect(mockUpdateCredential).not.toHaveBeenCalled()
    expect(mockPutConsentId).not.toHaveBeenCalled()
  })

  it('Should throw an error due to error updating credentials in database', (): void => {
    mockUpdateCredential.mockRejectedValueOnce(new Error('Error updating db'))
    expect(async (): Promise<void> => {
      await post(request as Request, h as ResponseToolkit)
    }).toThrowError()

    expect(mockIsConsentRequestValid).toHaveBeenCalledWith(request, partialConsent)
    expect(mockConsentDbRetrieve).toHaveBeenCalledWith(request.params.id)
    expect(mockGenerate).toHaveBeenCalledWith()
    expect(mockUpdateCredential).toHaveBeenCalledWith(partialConsent, challenge, 'FIDO', 'PENDING')
    expect(mockPutConsentId).not.toHaveBeenCalled()
  })

  it('Should throw an error due to error in PUT consents/{id} ca', (): void => {
    mockPutConsentId.mockRejectedValueOnce(new Error('Could not establish connection'))
    expect(async (): Promise<void> => {
      await post(request as Request, h as ResponseToolkit)
    }).toThrowError()

    expect(mockIsConsentRequestValid).toHaveBeenCalledWith(request, partialConsent)
    expect(mockConsentDbRetrieve).toHaveBeenCalledWith(request.params.id)
    expect(mockGenerate).toHaveBeenCalledWith()
    expect(mockUpdateCredential).toHaveBeenCalledWith(partialConsent, challenge, 'FIDO', 'PENDING')
    expect(mockPutConsentId).toHaveBeenCalled()
  })
})
