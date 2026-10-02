import {readiness} from '../src/shared/readiness.js';
// Deliberately offline: no SDK initialization, network requests, secret values or writes.
console.log(JSON.stringify({mode:'offline',providersContacted:false,checks:readiness(process.env),note:'Configuration presence is not provider verification. Remote acceptance remains required before launch.'},null,2));
