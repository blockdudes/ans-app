import type { JsonRpcSigner } from '@ethersproject/providers'
import type { TFunction } from 'react-i18next'

import { EthAddress, PublicANS, Transaction, TransactionDisplayItem } from '@app/types'

type Data = {
  name: string
  newOwner: EthAddress
  contract: 'registry' | 'baseRegistrar' | 'nameWrapper'
}

const displayItems = (
  { name }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
  {
    label: 'name',
    value: name,
    type: 'name',
  },
  {
    label: 'action',
    value: t('name.transferName'),
  },
]

const transaction = (signer: JsonRpcSigner, ens: PublicANS, data: Data) => {
  const tx = ens.transferName.populateTransaction(data.name, {
    newOwner: data.newOwner,
    contract: data.contract,
    signer,
  })
  return tx
}

export default {
  displayItems,
  transaction,
  backToInput: true,
} as Transaction<Data>
