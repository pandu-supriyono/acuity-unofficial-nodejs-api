import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { DecodingError } from './errors'
import axios, { AxiosResponse } from 'axios'

class RequestError extends Error {
  private constructor() {
    super('Unknown HTTP Error Response')
  }

  public static of(err?: unknown) {
    console.error(err)
    return new RequestError()
  }
}

const AcuityErrorDecoder = t.type({
  status_code: t.number,
  message: t.string,
  error: t.string
})

class AcuityError extends Error {
  statusCode: number

  constructor(error: { status_code: number; message: string; error: string }) {
    super(error.message)
    this.name = error.error
    this.statusCode = error.status_code
  }

  public static of(error: {
    status_code: number
    message: string
    error: string
  }) {
    return new AcuityError(error)
  }

  public static decode(error: unknown) {
    return pipe(
      error,
      AcuityErrorDecoder.decode,
      E.mapLeft(RequestError.of),
      E.map(AcuityError.of)
    )
  }
}

export const decodeResponseBody =
  <T>(decoder: t.Type<T>) =>
  (response: AxiosResponse) =>
    pipe(response.data, decoder.decode, E.mapLeft(DecodingError.of))

export const decodeResponseBodyTE = <T>(decoder: t.Type<T>) =>
  flow(decodeResponseBody(decoder), TE.fromEither)

const parseAxiosError = (error: unknown) =>
  pipe(
    error,
    E.fromPredicate(axios.isAxiosError, RequestError.of),
    E.chainW((axiosError) =>
      pipe(
        O.fromNullable(axiosError.response?.data),
        E.fromOption(RequestError.of),
        E.chainW(AcuityError.decode)
      )
    ),
    E.getOrElseW(identity)
  )

export const httpRequest = flow(TE.tryCatchK(axios, parseAxiosError))
