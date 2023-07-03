---
title: Partitioning of Key Value Data
date: 07/03/2023
description: Partitioning of Key Value Data.
tag: partitioning
author: Nicholas DiPreta
---

## Partitioning of Key-Value Data

I will be regularly publishing articles with easily digestible chunks relating to partitioning in this series.

The individual articles will be as follows:

1. Introduction to Partitioning
2. **Partitioning of Key-Value Data**
3. Partitioning and Secondary Indexes
4. Rebalancing Partitions
5. Request Routing
6. Partitioning in the Real World


---

### Skew and Hot Spots

The goal with partitioning is to spread data and query load evenly across nodes in our system. In theory, if we have 10 nodes and data is split evenly across all 10 nodes, then we should be able to handle 10 times as much data and 10 times the io throughout of a single node. However, a common occurance is for partitions to have an uneven distribution of either throughput or data. If the partitioning is uneven, we call it *skewed*. It is important to think about time frame when discussing skew. Short term skew is expected to some acceptable degree (that degree depends on usecase). Long term skew, or a partition with unexpectedly high load is called a hot spot. We are going to be discussing partitioning approaches that are designed to avoid skew and hotspots.

### Random Assignment

The simplest method for avoiding hot spots would be to assign records to nodes randomly. Sure, that can distribute data pretty evenly, but at a major cost. When you're trying to read a particular item, you have notion of what node it is on, so you need to query all nodes in parallel. Here's how we can do better.

### Partitioning by key range

Let's assume that we have a simple key-value data model. One way of partitioning is to assign a continuous range of keys to each partition. If you know the boundaries between ranges, you can easily determine which partition contains any given key. 

The range of keys per partition may not necessarily be the same. If we intend to evenly distribute the data we need to adjust the partitions to contain ranges with even distributions of data. For example, let's say we have 75 records for the letter A, but only 25 records for the letters B,C, and D. A valid balanced partitioning scheme here would be to have half of the records on node A and half on node B. Thus we only have 1/3 of the key range covered on a single node and the remaining 2/3rds of the key range on the second node.

![Range Partition Illustration](/images/rangepartition1.jpeg)
