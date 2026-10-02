import {createHash,timingSafeEqual} from 'node:crypto';
import {ApiError} from './auth.js';
import {required} from './config.js';
export function authorizeJob(header:string|null,expected:string){if(!header||!timingSafeEqual(createHash('sha256').update(header).digest(),createHash('sha256').update('Bearer '+expected).digest()))throw new ApiError(401,'invalid_job_token');}
export function jobSecret(){return process.env.CRON_SECRET||required('JOB_SECRET');}
