import {getStore} from '@netlify/blobs';
import {handleApi} from '../../server/backend.mjs';
import {netlifyStore} from '../../server/netlify-store.mjs';
export default request=>handleApi(request,netlifyStore(getStore({name:'daylight-private',consistency:'strong'})),{auth:'device-key',scheduler:true});
export const config={path:'/api/*'};
