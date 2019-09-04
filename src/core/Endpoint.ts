import * as t from 'io-ts'

export interface Endpoint<A extends t.Any, R extends t.Any, S extends t.Any> {
  name: string
  call: (
    args: t.TypeOf<A>,
    resolver: (args: t.TypeOf<A>, state: t.TypeOf<S>) => Promise<t.TypeOf<R>>,
    state?: t.TypeOf<S>
  ) => Promise<t.TypeOf<R>>
  describe: () => { argType: string, returnType: string, stateType?: string }
  validateArgs: (args: t.TypeOf<A>) => boolean
  validateReturn: (returnValue: t.TypeOf<R>) => boolean
  validateState: (state: t.TypeOf<S>) => boolean
}
