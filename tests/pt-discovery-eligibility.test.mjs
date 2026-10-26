import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { buildLocationFilter, buildCountryEligibilityFilter } from '../scan.mjs';
import { buildTitleFilter } from '../title-keywords.mjs';
import { normalizeLandingJob } from '../providers/landingjobs.mjs';
import itjobs, { normalizeItjobsJob } from '../providers/itjobs.mjs';
import { hasUsWorkRequirement } from '../lib/us-work-eligibility.mjs';
import { passesFilters } from '../scan-ats-full.mjs';
import * as yaml from 'js-yaml';

const location = buildLocationFilter({always_allow:['Portugal','PT','Abrantes','Castelo Branco','Tomar','Santarém','Santarem','Fundão','Fundao','Covilhã','Covilha'],allow:['Remote','Europe','EMEA'],block_hard:['United States','USA','US','U.S.','Brazil'],match_any_location:true});
test('PT discovery preserves eligible alternatives without rescuing a restricted US office', () => {
  for (const place of ['Abrantes','Castelo Branco','Tomar','Santarém','Santarem','Fundão','Covilha','Coimbra, PT','Coimbra, Portugal','Lisbon, Portugal | New York, United States','US; Castelo Branco','New York, USA / Abrantes']) assert.equal(location(place),true,place);
  for (const place of ['Remote - US only','Remote (U.S.)','Porto Alegre, Brazil','New York, United States | Boston, USA','United States | Remote']) assert.equal(location(place),false,place);
  assert.equal(location(''),true,'unknown retained for review');
  assert.equal(buildLocationFilter({allow:['Portugal'],block_hard:['USA']})('Portugal | USA'),false,'legacy behavior unchanged');
});
test('Landing.jobs normalization and PT selection work together across offices', () => {
  const job=normalizeLandingJob({title:'Junior Developer',url:'https://landing.jobs/at/example/review',locations:[{city:'Boston',country_code:'US'},null,{city:'Coimbra',country_code:'PT'},{city:'Coimbra',country_code:'PT'}],description:'Work in Portugal.'});
  assert.equal(job.location,'Boston, United States | Coimbra, Portugal');
  assert.equal(job.description,'Work in Portugal.');
  assert.equal(location(job.location,job.url,job.title),true);
  const us=normalizeLandingJob({title:'Junior Developer',url:'https://landing.jobs/at/example/us',locations:[{city:'Boston',country_code:'US'}],remote:true});
  assert.equal(location(us.location,us.url,us.title),false);
});
test('US work/residence requirements override unrelated mentions of Portugal', () => {
  const eligible=buildCountryEligibilityFilter({exclude_us_requirements:true},'Portugal');
  for (const text of ['Candidates must be authorized to work in the United States. Our other offices include Portugal.','You must reside in the US.','US residents only','US-based candidates only','We require US work authorization.','Applicants must be a U.S. citizen.','The right to work in the US is required.','We do not require experience but you must be a US resident.','We do not require US work authorization but you must be a US resident.']) {assert.equal(hasUsWorkRequirement(text),true,text);assert.equal(eligible(text),false,text);}
  for (const text of ['US company hiring remote engineers in Portugal.','We do not require US work authorization.','Applicants must be located in the US or Portugal.','We have offices in the US. This role is based in Portugal.','Applicants must be authorized to work in Portugal.','']) assert.equal(eligible(text),true,text);
  assert.equal(buildCountryEligibilityFilter(undefined,'Portugal')('US residents only'),true,'opt-in');
});
test('mixed junior/senior levels do not allow senior roles merely mentoring juniors', () => {
  const filter=buildTitleFilter({positive:['Developer','Engineer','Cibersegurança'],negative:['Senior','Lead'],allow_mixed_seniority:true});
  for(const title of ['Junior / Senior Software Engineer','Senior/Junior Developer','Analista de Cibersegurança','Junior .NET Developer'])assert.equal(filter(title),true,title);
  for(const title of ['Senior Engineer mentoring junior developers','Junior / Senior Lead Developer','Senior Developer'])assert.equal(filter(title),false,title);
});
test('Explorer serializer and reverse ATS discovery retain US requirements and multi-location rules', async (t) => {
  if (!existsSync(new URL('../web/src/', import.meta.url))) return t.skip('web/ ausente nesta instalação');
  const { serializePortals } = await import('../web/src/lib/core/portals-serialize.mjs');
  const policy={title_filter:{allow_mixed_seniority:true},location_filter:{match_any_location:true},country_eligibility_filter:{exclude_us_requirements:true}};
  const config=yaml.load(serializePortals({positive:['Developer'],negative:['Senior'],allow:['Portugal'],block:[],alwaysAllow:[],blockHard:['US']},policy));
  assert.equal(config.location_filter.match_any_location,true);
  assert.equal(config.title_filter.allow_mixed_seniority,true);
  const filters={titleFilter:buildTitleFilter(config.title_filter),locationFilter:buildLocationFilter(config.location_filter),countryEligibilityFilter:buildCountryEligibilityFilter(config.country_eligibility_filter,'Portugal')};
  assert.equal(passesFilters({title:'Junior / Senior Developer',location:'Portugal | US',description:'Hiring from Portugal'},filters),true);
  assert.equal(passesFilters({title:'Junior Developer',location:'Portugal | US',description:'Must be authorized to work in the US.'},filters),false);
});
test('ITJobs validates posting identity and preserves all Portuguese locations', () => {
  const row={id:17,title:'Junior Java Developer',slug:'junior-java',company:{name:'Example'},locations:[{name:'Abrantes'},{name:'Castelo Branco'}],body:'<p>Descrição</p>',publishedAt:'2026-10-17 10:00:00'};
  const job=normalizeItjobsJob(row);
  assert.equal(job.url,'https://www.itjobs.pt/oferta/17/junior-java');
  assert.equal(location(job.location),true);
  assert.equal(job.description,'Descrição');
  assert.equal(normalizeItjobsJob({...row,slug:'../../escape'}),null);
  assert.equal(normalizeItjobsJob({...row,id:'17/invalid'}),null);
});
test('ITJobs reads paginated API and never leaks credentials in URLs or errors', async () => {
  const previous=process.env.ITJOBS_API_KEY;
  try {
    delete process.env.ITJOBS_API_KEY;
    await assert.rejects(()=>itjobs.fetch({},{}),/ITJOBS_API_KEY/);
    process.env.ITJOBS_API_KEY='fixture-secret';
    const calls=[];
    const jobs=await itjobs.fetch({itjobs:{query:'software'}},{fetchJson:async(url,opts)=>{
      calls.push({url,opts});const page=Number(new URLSearchParams(opts.body).get('page'));
      return {total:2,limit:1,results:[{id:page,title:'Junior Developer',slug:`developer-${page}`,locations:[{name:'Tomar'}]}]};
    }});
    assert.equal(jobs.length,2);assert.equal(calls.length,2);
    assert(calls.every(c=>!c.url.includes('fixture-secret') && c.url==='https://api.itjobs.pt/job/search.json' && c.opts.redirect==='error'));
    await assert.rejects(()=>itjobs.fetch({}, {fetchJson:async()=>{throw Error('fixture-secret');}}),error=>!error.message.includes('fixture-secret'));
    await assert.rejects(()=>itjobs.fetch({}, {fetchJson:async()=>({error:{message:'fixture-secret'}})}),error=>!error.message.includes('fixture-secret'));
  } finally {if(previous===undefined)delete process.env.ITJOBS_API_KEY;else process.env.ITJOBS_API_KEY=previous;}
});
