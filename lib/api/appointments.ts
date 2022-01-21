import { pipe } from 'fp-ts/lib/function'
import { AcuityConfig, createBasicAuthTE } from '../acuity-config'
import { decodeResponseBodyTE, httpRequest } from '../http-request'
import { baseUrl } from '../resources'
import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'

const GetAppointmentDecoder = t.type({
  id: t.number,
  firstName: t.string,
  lastName: t.string,
  phone: t.string,
  email: t.string,
  date: t.string,
  time: t.string,
  endTime: t.string,
  dateCreated: t.string,
  datetimeCreated: t.string,
  datetime: t.string,
  price: t.string,
  priceSold: t.string,
  paid: t.string,
  amountPaid: t.string,
  type: t.string,
  appointmentTypeID: t.union([t.number, t.undefined]),
  classID: t.union([t.number, t.null]),
  addonIDs: t.array(t.number),
  category: t.string,
  duration: t.string,
  calendar: t.string,
  calendarID: t.number,
  certificate: t.union([t.string, t.null]),
  confirmationPage: t.string,
  location: t.string,
  notes: t.string,
  timezone: t.string,
  calendarTimezone: t.string,
  canceled: t.boolean,
  canClientCancel: t.boolean,
  canClientReschedule: t.boolean,
  formsText: t.string
  // TODO: forms
  // TODO: labels
})

const GetAppointmentsDecoder = t.array(GetAppointmentDecoder)

export const getAppointments =
  (calendarId: string | number) => (config: AcuityConfig) => {
    return pipe(
      config,
      createBasicAuthTE,
      TE.chainW((basicAuth) => {
        return httpRequest(`${baseUrl}/appointments?calendarID=${calendarId}`, {
          headers: {
            Authorization: basicAuth
          }
        })
      }),
      TE.chainW(decodeResponseBodyTE(GetAppointmentsDecoder))
    )
  }
