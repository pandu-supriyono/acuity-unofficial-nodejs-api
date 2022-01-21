import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'

export class DecodingError extends Error {
  constructor(errors: t.Errors) {
    const message = formatValidationErrors(errors).join('\n')

    super(message)
  }

  public static of(errors: t.Errors) {
    return new DecodingError(errors)
  }
}
