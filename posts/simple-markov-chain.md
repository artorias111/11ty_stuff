---
title: "simple-markov-chain"
date: 2026-09-25
tags: []
draft: true
---

# Next nucleotide predictor

We've all (or, some of us) have heard the phrase "It's not intelligent! It's just a next word predictor!". Or even "it's a next *token* predictor!" if they're feeling extra salty about a chatbot. 

I feel like the same when I look at genome foundation models (affectionately called GLMs by the community). I'm just salty. Anyway, personal attacking aside. Here's a series of articles starting from building a simple next token predictor, but for nucleotides instead of words. This article focuses on something super simple: a markov chain to predict the next nucleotide in a string of nucleotides. I start off by digging through trying to find my old jupyter notebook setup. However, it looked old, I personally don't like using jupyter in my local VS-code setup (but the browser one looks ancient). So I searched around a bit to see what's the flashiest python/scipy environment around. I almost did something unthinkable and thought I'd use [Quarto](https://quarto.org/) (no shade to the team, they seem great), but *phew*, I stumbled into something else, and decided to use [marimo](https://marimo.io/) for this one. No regrets!


## What is a next nucleotide predictor?
Okay, let's start with something simple. Say, you want to build a next nucleotide predictor in 5 seconds. And you're given the nucleotide alphabet set as $B \in {A,T,G,C}$. The simplest way to *model* this language of DNA is to assume they're independent, and I'd do something like this, to generate a nucleotide of size 10. The size is arbitrary, they key is being able to generate the *next* nucleotide, which this model can do irrespective of what `nucleotide_size` is. 

```pseudocode
alphabet = {A, T, G, C}
x = ""
nucleotide_size = 10
for i 1..nucleotide size
    x += 1/4 * random.choice((alphabet))
```

Okay, but this is dumb. Nucleotides don't appear at random. So, we can incorporate additional information into our growing model. Some sort of "if the current nucleotide is A, there's a higher chance the next nucleotide is A". 

## (First order) Markov chain
To accomodate this additional information, we include several probabilities. To keep things simple and organized, we used bayesian math notations. So something like "probability of the next nucleotide being T, given the current nucleotide is C" is written as $P(k_{n+1} = T|k_n = C)$. 
And, instead of listing them one by one, we use rows and columns, a row being "transition from" and the column being "transition to". We take out the labels, its implicit. Now we have a matrix of numbers, where everything element is a *transition* probability (is this matrix symmetric?) We call this a *transition matrix*. 

Here's an example transition matrix.
