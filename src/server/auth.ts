export class ApiError extends Error {constructor(public status:number,public code:string){super(code);}}
export type Identity={id:string;email?:string;user_metadata?:Record<string,unknown>};
export async function authenticate(header:string|undefined,verify:(token:string)=>Promise<Identity|null>):Promise<Identity>{
 const match=header?.match(/^Bearer ([^\s]+)$/);if(!match)throw new ApiError(401,'authentication_required');
 const user=await verify(match[1]);if(!user)throw new ApiError(401,'invalid_session');return user;
}
export function requireRole(actual:string[],allowed:string[]):void{if(!actual.some(r=>allowed.includes(r)))throw new ApiError(403,'forbidden');}
