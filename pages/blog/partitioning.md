---
title: Partitioning
date: 07/01/2023
description: Introduction to partitioning.
tag: partitioning
author: Nicholas DiPreta
---


## Introduction

I will be regularly publishing articles with easily digestible chunks relating to partitioning in this series.

The individual articles will be as follows:

1. **Introduction to Partitioning**
2. Partitioning of Key-Value Data
3. Partitioning and Secondary Indexes
4. Rebalancing Partitions
5. Request Routing
6. Partitioning in the Real World

---

### Definition

Partitioning is a way of intentionally breaking a large database into smaller ones.

---

## Introduction to Partitioning

A first step to creating a speedy and reliable data intensive application is often making copies of your data on several nodes. This is known as replication. *However*, once a dataset becomes sufficiently large or has a high engough query throughput, replication is no longer sufficient. Soon, we need to break the data up into **partitions**.

> What we call a partition here is called a shard in MongoDB, Elas‐
ticsearch, and SolrCloud; it’s known as a region in HBase, a tablet
in Bigtable, a vnode in Cassandra and Riak, and a vBucket in
Couchbase. However, partitioning is the most established term... - Designing Data Intensive Applications, M. Kleppmann, 2017 pp. 199 <sup>[2][]</sup>

Scalability is at the heart of partitioning data. Partitioning your data can help make your application more scalable and performant, but it can also introduce significant complexities and challenges.<sup>[1][]</sup>

In this series, we will first look at different approaches for partitioning large datasets and take a deep dive into how the indexing of data relates to partitioning. We will then look at rebalancing, which is requisite if you want to add or remove nodes from your cluster. Next, we will look at routing requests to the correct partitions. Finally, we will look at some examples of partitioning in practice.

[1]: <https://www.cockroachlabs.com/blog/what-is-data-partitioning-and-how-to-do-it-right/> "What is data partitioning, and how to do it right"
[2]: <https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321> "Designing Data Intensive Applications"
