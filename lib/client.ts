import { AcuityConfig, validateAcuityConfig } from './acuity-config'
import { isLeft, getOrElseW } from 'fp-ts/Either'
import { getAppointments } from './api/appointments'

export class Acuity {
  private config: AcuityConfig

  constructor(config: AcuityConfig) {
    const validatedConfig = validateAcuityConfig(config)

    if (isLeft(validatedConfig)) {
      throw new Error('Config file incomplete')
    }

    this.config = validatedConfig.right
  }

  private getError<T extends Error>(error: T) {
    throw error
  }

  public getAppointments(calendarId: number | string) {
    return getAppointments(calendarId)(this.config)().then(
      getOrElseW(this.getError)
    )
  }
}
