import type { JsonRpcSigner } from '@ethersproject/providers'
import type { TFunction } from 'react-i18next'

import type { NamedFusesToBurn } from '@ansdomain/ensjs'

import { PublicANS, Transaction, TransactionDisplayItem } from '@app/types'

type Data = {
  name: string
  permissions: string[]
  selectedFuses: NamedFusesToBurn
}

const displayItems = (
  { name, permissions }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
  {
    label: 'name',
    value: name,
    type: 'name',
  },
  {
    label: 'action',
    value: t('transaction.description.burnFuses') as string,
  },
  {
    label: 'info',
    value: ['Permissions to be burned:', ...permissions],
    type: 'list',
  },
]

const transaction = (signer: JsonRpcSigner, ens: PublicANS, data: Data) => {
  const tx = ens.burnFuses.populateTransaction(data.name, {
    namedFusesToBurn: data.selectedFuses,
    signer,
  })
  return tx
}

export default {
  displayItems,
  transaction,
  backToInput: true,
} as Transaction<Data>
