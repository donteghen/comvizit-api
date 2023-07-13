import { Types } from 'mongoose';
import { User } from '../models/user';
import { Heartbeat } from '../models/socket-interfaces';
import { logger } from '../logs/logger';


async function onHeartBeat (data: Heartbeat) {
    console.log('Updating the online status for user with Id', data.senderId)

    // update the socket user's online status
    try {
        const user = await User.findOne({_id: new Types.ObjectId(data.senderId)});
        const now = Date.now()
        user.isOnline = true,
        user.lastOnlineDate = new Date(now),
        user.updated = now
        await user.save()

    } catch (error) {
        logger.error(`User update failed on heartbeat event due to : ${error??"Unrecognized reasons"}`)
        return
    }
}

export {
    onHeartBeat
}