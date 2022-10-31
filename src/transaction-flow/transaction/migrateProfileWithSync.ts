import type { JsonRpcSigner } from '@ethersproject/providers'

import { RecordOptions } from '@ansdomain/ensjs/utils/recordHelpers'

import { Profile, PublicANS, RecordItem, Transaction, TransactionDisplayItem } from '@app/types'
import { recordItemToKeyValue } from '@app/utils/editor'

import { contentHashToString } from '../../utils/contenthash'

type Data = {
  name: string
  records?: RecordOptions
}

const displayItems = ({ name }: Data): TransactionDisplayItem[] => [
  {
    label: 'name',
    value: name,
    type: 'name',
  },
]

// Returns the an array of record items where deleted records have value set to empty string.
export const syncRecords = (
  before?: RecordItem[],
  after?: RecordItem[],
  overwrites?: { key: string; value: string }[],
) => {
  const beforeArr = before ? before.map(recordItemToKeyValue) : []
  const beforeHash =
    beforeArr.reduce<{ [key: string]: string }>((hash, item) => {
      const key = item.key as string
      const value = item.value as string
      const newHash = { ...hash, [key]: value }
      return newHash
    }, {}) || {}

  return Object.values(
    [
      ...beforeArr.map(({ key }) => ({ key, value: '' })),
      ...(after ? after.map(recordItemToKeyValue) : []),
      ...(overwrites || []),
    ].reduce<{
      [key: string]: { key: string; value: string }
    }>((acc, text) => {
      const key = text.key as string
      const value = text.value as string
      if (beforeHash[key] === value) {
        delete acc[key]
      } else {
        acc[key] = { key, value }
      }
      return acc
    }, {}),
  )
}

const transaction = async (signer: JsonRpcSigner, ens: PublicANS, data: Data) => {
  const profile = await ens.getProfile(data.name)
  if (!profile) throw new Error('No profile found')
  if (!profile.records) throw new Error('No records found')
  const resolverAddress = (await ens.contracts!.getPublicResolver()!).address

  let resolverProfile: Profile | undefined
  if (profile.resolverAddress !== resolverAddress) {
    resolverProfile = await ens.getProfile(data.name, {
      resolverAddress,
    })
  }

  const contentHash = data.records?.contentHash
    ? contentHashToString(data.records.contentHash)
    : contentHashToString(profile.records.contentHash)

  const texts = syncRecords(
    resolverProfile?.records?.texts,
    profile?.records?.texts,
    data.records?.texts,
  )
  const coinTypes = syncRecords(
    resolverProfile?.records?.coinTypes,
    profile?.records?.coinTypes,
    data.records?.coinTypes,
  )

  const migratableProfile = {
    contentHash,
    texts,
    coinTypes,
  }

  return ens.setRecords.populateTransaction(data.name, {
    records: migratableProfile,
    resolverAddress,
    signer,
  })
}

export default { displayItems, transaction } as Transaction<Data>
