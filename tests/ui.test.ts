import {expect,it} from 'vitest';
import {programs,matchingPrice,safeNext} from '../src/shared/programs.js';
it('uses the four supplied monthly prices without inventing annual offers',()=>{expect(programs.map(p=>[p.code,p.amount])).toEqual([['STARTER',350],['PRO',530],['ELITE',584],['INDEPENDENT',152]]);});
it('only offers an exact configured RON monthly price for the selected program',()=>{
 const plans=[{code:'STARTER',prices:[{id:'wrong',currency:'eur',interval:'month',unit_amount:35000},{id:'valid',currency:'ron',interval:'month',unit_amount:35000}]}];
 expect(matchingPrice(programs[0],plans)).toBe('valid');expect(matchingPrice(programs[1],plans)).toBeUndefined();
});
it('rejects untrusted return URLs and only permits known local destinations',()=>{for(const url of ['https://evil.test','//evil.test','/\\evil.test','/auth/callback','/cont?token=secret'])expect(safeNext(url)).toBe('/cont');expect(safeNext('/programe?program=ELITE')).toBe('/programe?program=ELITE');});
