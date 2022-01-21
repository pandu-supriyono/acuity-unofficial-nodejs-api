import { pipe } from 'fp-ts/lib/function'
import { formatValidationErrors } from 'io-ts-reporters'
import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

const AcuityConfig = t.type({
  userId: t.string,
  apiKey: t.string
})

export type AcuityConfig = t.TypeOf<typeof AcuityConfig>

const toBasicAuth = (config: AcuityConfig) =>
  'Basic ' + Buffer.from(`${config.userId}:${config.apiKey}`).toString('base64')

export const validateAcuityConfig = (config: AcuityConfig) =>
  pipe(
    config,
    AcuityConfig.decode,
    E.mapLeft(AcuityConfigError.fromDecodingError)
  )

export const createBasicAuth = (config: AcuityConfig) =>
  pipe(config, validateAcuityConfig, E.map(toBasicAuth))

export const createBasicAuthTE = (config: AcuityConfig) =>
  pipe(config, createBasicAuth, TE.fromEither)

export class AcuityConfigError extends Error {
  private constructor(msg: string) {
    super(msg)
    this.name = 'AcuityConfigError'
  }

  public static of(msg: string) {
    return new AcuityConfigError(msg)
  }

  public static fromDecodingError(errors: t.Errors) {
    return this.of(formatValidationErrors(errors).join('\n'))
  }
}
