import type { JsonRpcSigner } from '@ethersproject/providers'
import type { TFunction } from 'react-i18next'

import { PublicANS, Transaction, TransactionDisplayItem } from '@app/types'

type Data = {
  name: string
  contract: 'registry' | 'nameWrapper'
  resolver: string
  oldResolver?: string
}

const displayItems = (
  { resolver, oldResolver }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
  {
    label: 'action',
    value: t(`transaction.description.updateResolver`),
  },
  {
    label: 'info',
    value: t(`transaction.info.updateResolver`),
  },
  ...(oldResolver
    ? [
        {
          label: 'currentResolver',
          value: oldResolver,
          type: 'address',
        } as TransactionDisplayItem,
      ]
    : []),
  {
    label: 'newResolver',
    value: resolver,
    type: 'address',
  },
]

const transaction = (signer: JsonRpcSigner, ens: PublicANS, data: Data) =>
  ens.setResolver.populateTransaction(data.name, {
    contract: data.contract,
    resolver: data.resolver,
    signer,
  })

export default { displayItems, transaction } as Transaction<Data>
