import {createClient} from '@supabase/supabase-js';
import Stripe from 'stripe';
import {configuration,required} from './config.js';
export function supabase(token?:string){return createClient(required('SUPABASE_URL'),required('SUPABASE_ANON_KEY'),{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined});}
export function serviceDb(){return createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
export function stripeClient(){configuration();return new Stripe(required('STRIPE_SECRET_KEY'),{maxNetworkRetries:2,timeout:15000});}
