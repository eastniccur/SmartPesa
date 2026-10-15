import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTransactions, mergeTransactions, validateTransaction, mockSyncTransactions } from './transactions.js';
const records = [{ id:'1', receiptNo:'ABC123', title:'Naivas', category:'Food', amount:20 }, {id:'2', receiptNo:'XYZ456',title:'Power',category:'Utilities',amount:50}];
test('search matches title, receipt and category without case sensitivity', () => {
  for (const query of [' naivas ', 'abc123', 'food']) assert.deepEqual(filterTransactions(records,query,''),[records[0]]);
});
test('category filter combines with search and supports empty results', () => {
  assert.deepEqual(filterTransactions(records,'','Utilities'),[records[1]]);
  assert.deepEqual(filterTransactions(records,'Naivas','Utilities'),[]);
  assert.deepEqual(filterTransactions([], '', ''), []);
});
test('manual entry validates title, category, type and positive monetary amounts', () => {
  const form={title:'Shop',amount:'12.50',category:'Food',type:'Paybill'};
  assert.equal(validateTransaction(form,['Food']),'');
  for (const amount of ['', '0', '-1', 'abc', 'Infinity', '1.234']) assert.ok(validateTransaction({...form,amount},['Food']));
  assert.ok(validateTransaction({...form,title:' '},['Food']));
  assert.ok(validateTransaction({...form,category:'Removed'},['Food']));
  assert.ok(validateTransaction({...form,type:'Invalid'},['Food']));
});
test('repeated sync is idempotent and preserves existing transactions', () => {
  const once=mergeTransactions(records,mockSyncTransactions);
  assert.equal(once.length,4);
  assert.deepEqual(mergeTransactions(once,mockSyncTransactions),once);
  assert.deepEqual(mergeTransactions(records,[{...records[0],id:'new-id'}]),records);
});
test('duplicate entries within a sync batch are imported only once', () => {
  assert.equal(mergeTransactions([], [mockSyncTransactions[0],mockSyncTransactions[0]]).length,1);
});
