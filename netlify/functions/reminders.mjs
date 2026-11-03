import {getStore} from '@netlify/blobs';
import {dispatchReminders} from '../../server/backend.mjs';
import {netlifyStore} from '../../server/netlify-store.mjs';
export default async (request,context)=>{await dispatchReminders(netlifyStore(getStore({name:'daylight-private',consistency:'strong'})),context.site.url);};
export const config={schedule:'* * * * *'};
