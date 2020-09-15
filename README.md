# SolrTS
[![Build status on Travis](https://travis-ci.org/h-sslefree/solrts.svg?branch=master)](https://travis-ci.org/github/h-sslefree/solrts) [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

# A TypeScript client for Solr
Using [Solr](https://lucene.apache.org/solr/) from JavaScript clients [may be straightforward](https://lucene.apache.org/solr/guide/8_5/using-javascript.html) but Solr uses shorthand url parameters to specify your desires which tend to lead to hard to read search logic in your application quickly. We were in desperate need of a TypeScript library that:
* prevents url parameter concatenation
* facades knowledge of shorthand Solr/Lucene terminology
* leads to search logic that reads like a book
* does not have any dependencies

The library follows a prepare-execute pattern: you first specify different parts of the desired operation and then execute it. During execution the library will transform your input to an actual Solr url, post it to Solr and return Solr's response as a json object. You are on your own interpreting that response.

## Examples
The examples intentionally left out error handling.

### Management
#### create [configset](https://lucene.apache.org/solr/guide/8_5/config-sets.html)
``` ts
import { SolrClient } from 'solrts';
const solrConfigSetOperation = new SolrClient(8.5).configsetOperation;
solrConfigSetOperation.prepareUpload(NameThatConfigsetShouldHaveInSolr, NameOfZipFileThatContainsConfigset);
await solrConfigSetOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
```
_You can find more examples in the unit tests (configset.spec.ts)_


#### create collection
``` ts
import { SolrClient } from 'solrts';
const solrCollectionOperation = new SolrClient(8.5).collectionOperation;
solrCollectionOperation.numShards(1).prepareCreate(NameThatCollectionShouldHaveInSolr, NameOfConfigsetThatShouldBeUsedForCollection);
await solrCollectionOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
```
_You can find more examples in the unit tests (collection.spec.ts)_

#### create [alias](https://lucene.apache.org/solr/guide/8_5/aliases.html)
``` ts
import { SolrClient } from 'solrts';
const solrAliasOperation = new SolrClient(8.5).aliasOperation;
solrAliasOperation.prepareCreate(NameOfTheAliasThatYouWantYourCollectionToBeExposedUnder), ArrayWithOneOrMoreCollectionsThatShouldBeExposedUnderTheAliasname);
await solrAliasOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
```
_You can find more examples in the unit tests (alias.spec.ts)_

### Index
#### add one or more objects
``` ts
import { SolrClient } from 'solrts';
const solrIndexOperation = new SolrClient(8.5).indexOperation;
solrIndexOperation.in('AnExistingCollection').prepareBulk(ArrayOfObjectsThatContainPropertiesThatCorrespondToTheSchema, []);
await solrIndexOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
```
#### delete one or more objects
``` ts
import { SolrClient } from 'solrts';
const solrIndexOperation = new SolrClient(8.5).indexOperation;
solrIndexOperation.in('AnExistingCollection').prepareBulk([], ArrayOfObjectsThatContainTheIdOfDocumentsThatShouldBeDeleted);
await solrIndexOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
```
_You can find more examples in the unit tests (index.spec.ts)_

### Search
#### search everything
``` ts
import { SolrClient } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation.in('AnExistingCollection');
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
#### search for a term in all fields
``` ts
import { SolrClient } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .for(new LuceneQuery().term('OneOrMoreSearchTerms')
    .in('AnExistingCollection');
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
#### search for a term in a specific field
``` ts
import { SolrClient } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .for(new LuceneQuery().term('OneOrMoreSearchTerms').in('SpecificField'))
    .in('AnExistingCollection');
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
#### search with paging
``` ts
import { SolrClient } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .limit(MaxNumberOfResults)
    .offset(StartingFromResult)
    .in('AnExistingCollection');
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
#### [filter](https://lucene.apache.org/solr/guide/8_5/common-query-parameters.html#CommonQueryParameters-Thefq_FilterQuery_Parameter) search results
##### filter on a value in a specific field
``` ts
import { SolrClient, SearchFilter } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .in('AnExistingCollection')
    .filter(new SearchFilter(FieldNameYouWantToFilterOn).equals(ValueThatAllDocumentsInResponseShouldHaveForThisField))
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
##### filter on multiple values (or) in a specific field
``` ts
import { SolrClient, SearchFilter } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .in('AnExistingCollection')
    .filter(new SearchFilter(FieldNameYouWantToFilterOn).ors(ArrayOfValuesOfWhichAllDocumentsInResponseShouldContainAtLeastOnOfForThisField))
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
##### filter on a range of values in a specific field
``` ts
import { SolrClient, SearchFilter } from 'solrts';
const solrSearchOperation = new SolrClient(8.5).searchOperation;
solrSearchOperation
    .in('AnExistingCollection')
    .filter(new SearchFilter(FieldNameYouWantToFilterOn).from(FromValue).to(ToValue))
const solrAnswer: any = await solrSearchOperation.execute(IpOrHostnameOfASolrNode, PortNumberWhereThatSolrNodeListensOn);
if (solrAnswer && solrAnswer.response && solrAnswer.response.docs) {
    // do something with the docs
}
```
_You can find more search examples in the unit tests (search.spec.ts)_

## Debug
View the queries that are being made by setting the env parameter DEBUG.

Shell:  
```DEBUG=solrts:* node YourScript```

DOS:  
```set DEBUG=soltrs:* & node YourScript```

## Todo
* support for advanced search term logic (with lots of ands and ors)
* sort on multiple expressions
* dismax and edismax query parsers
* advanced cluster communication. This library does not yet make use of the cluster meta information that is maintained by Zookeeper. It just connects with the specified node which may need to redirect the search request to the host that has the data you're requesting
