import Config from '../shared/config'

export interface MojaloopId {
  idType: string;
  idValue: string;
}

// This function is defined as async for future needs. We may need to contact external data store to get the mappings.
const getMojaloopId = async (uuid: string): Promise<MojaloopId> => {
  const foundMapItem = Config.RECEPIENT_ID_MAP.find(item => item.uuid === uuid)
  if (foundMapItem) {
    return {
      idType: foundMapItem.idType,
      idValue: foundMapItem.idValue
    }
  } else {
    throw (new Error('There is no corresponding mojaloop identifier found for UUID: ' + uuid))
  }
}

export default {
  getMojaloopId
}
