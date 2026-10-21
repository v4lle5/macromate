// Real Lit components using Lit's Node DOM shim. This is not rendered-browser QA.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {normalizeSettings,getGlassWaveTokens} from '../../frontend/unified-src/services/theme.js';

const require=createRequire(resolve(process.env.MACROMATE_BUILD_DEPS,'package.json'));
const scratch=await mkdtemp(resolve(tmpdir(),'macromate-settings-'));
const text=value=>Array.isArray(value)?value.map(text).join(' '):value?.strings?
  value.strings.map((part,index)=>part+text(value.values[index])).join(''):
  ['string','number'].includes(typeof value)?String(value):'';
try {
  const output=resolve(scratch,'components.mjs');
  await require('esbuild').build({
    stdin:{contents:`import './frontend/unified-src/components/rm-settings-view.js';
      import './frontend/unified-src/components/rm-recipe-detail.js';
      export const Settings=customElements.get('rm-settings-view');
      export const Detail=customElements.get('rm-recipe-detail');`,resolveDir:process.cwd()},
    bundle:true,platform:'node',format:'esm',nodePaths:[resolve(process.env.MACROMATE_BUILD_DEPS,'node_modules')],outfile:output,
  });
  const {Settings,Detail}=await import(pathToFileURL(output));
  const settings=new Settings();
  const markup=text(settings.render());
  assert.match(markup,/Language/);
  assert.match(markup,/Alarm sound/);
  assert.doesNotMatch(markup,/Appearance|Glass Wave|Preferred units|Imperial|Show metric conversion button/);
  assert.equal(settings._activeTab,'advanced');
  const migrated=normalizeSettings({unitSystem:'imperial',showUnitConversion:true,language:'de',timerSound:'ding'});
  assert.equal(migrated.unitSystem,'metric');
  assert.equal(migrated.showUnitConversion,false);
  assert.equal(migrated.language,'de');
  assert.equal(migrated.timerSound,'ding');
  const detail=new Detail();
  detail.settings={unitSystem:'imperial',showUnitConversion:true};
  assert.equal(detail._getDisplayAmount({amount:'1',unit:'oz'}).unit,'g');
  assert.equal(detail._getDisplayAmount({amount:'1',unit:'fl oz'}).unit,'ml');
  assert.deepEqual(detail._getDisplayAmount({amount:'2-3',unit:'cups'}),{amount:'2-3',unit:'cups'});
  assert.doesNotMatch(text(detail._renderIngredients({ingredients:[]})),/metric-btn|Convert to metric/);

  const light=getGlassWaveTokens({darkMode:'off'});
  assert.equal(light['--rm-bg-main'],'#F9EFDA');
  assert.equal(light['--rm-accent'],'#DCCDB8');
  assert.equal(light['--rm-bg-surface'],'rgba(253, 248, 239, 0.72)');
  const luminance=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255)
    .map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
    .reduce((sum,n,index)=>sum+n*[.2126,.7152,.0722][index],0);
  for(const darkMode of ['off','on']){
    const palette=getGlassWaveTokens({darkMode});
    for(const [foreground,background] of [
      ['--rm-text','--rm-bg-main'],['--rm-text-secondary','--rm-bg-main'],
      ['--rm-text-muted','--rm-bg-elevated'],['--rm-accent-text','--rm-accent'],
      ['--rm-accent-ink','--rm-accent-soft'],['--rm-disabled-text','--rm-disabled-bg'],
      ['--rm-success-ink','--rm-success-soft'],['--rm-error-ink','--rm-error-soft'],
    ]){
      const a=luminance(palette[foreground]),b=luminance(palette[background]);
      assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${darkMode}: ${foreground} on ${background}`);
    }
  }
  console.log('PASS: no design/units controls, preserved language, forced metric display, Wave Glass Echo palette and token contrast');
} finally {await rm(scratch,{recursive:true,force:true});}
