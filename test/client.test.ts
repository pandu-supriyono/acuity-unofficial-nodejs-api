import Acuity from '../lib'

describe('client', () => {
  it('throws an error when no config is supplied', () => {
    // @ts-ignore
    expect(() => new Acuity()).toThrowError()
  })
})
