import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const url=new URL('../../frontend/unified-src/services/amounts.js',import.meta.url);assert.ok(existsSync(url),'Ingredient scaling uses a precise fraction-aware helper');const {scaleAmount}=await import(url);
for(const [text,value]of [['1/2',1/2],['1 1/2',1+1/2],['½',1/2],['1½',1+1/2],['0.25',.25],['1,5',1.5]])assert.equal(scaleAmount(text,2),String(value*2));
for(const text of ['to taste','1-2','2 cups','1/0','-2'])assert.equal(scaleAmount(text,2),text);
assert.equal(scaleAmount('1',Infinity),'1');assert.equal(scaleAmount('1',0),'1');console.log('PASS: precise decimal, ASCII/Unicode/mixed fractions; ambiguous quantities remain unchanged');
