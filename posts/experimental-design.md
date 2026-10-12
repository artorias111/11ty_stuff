---
date: 2025-08-07
title: Experimental Design in Biology
draft: true
permalink: /notes/learning/experimental-design/
tags: ["biology"]
---

# Experimental Design in Biology

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->
Somewhere in between engineering in college to computational genomics now, I missed the statistics boat. Not in the sense that I can't compute a $p$-value. Instead, back when I started grad school, when someone said _null_, _design_, _statistical inference_, etc., nothing fired. They stayed as nouns and never turned into the questions you're supposed to ask before you look at data. 

It took me an embarrassingly long time to work out why. I was too used to working in a deterministic setting. Engineering math is mostly deterministic, so is making genomics pipelines. When making these pipelines I specify an input, and expect an output of a certain kind, and its always guaranteed to give me the same kind of output, by design. 

So this is a way of me back-filling, and drilling biological experimental design, mostly so I stop being thrown off by them when I discuss biological data with my peers. As a bonus, it's a neat reference for me to come back to. 

## What counts as *between groups*, and what counts as *within a group*?
In RNA-seq, a differential expression test is just a ratio of these two numbers. 
Most of the terms wrapped around experimental design is used to define within groups and between groups. Let me quickly write them down. 

### Sample
ONE biological specimen that produces one independent column in your count matrix, so its usually one organism, unless you're doing the kind of experiment where you're treating different parts of a mouse to different treatments. So if you're working on a bunch of mice, each mouse a different treatment, one mouse is one sample. What confused me is that in statistics, a sample is a subset of the population. But since RNA-seq considers RNA as the population and not the 12 mice you study, a sample in your experiment is just one biological specimen. 

So if you have several sequencing files from one mouse, they're all from one sample. 

### Factor, level, and condition
*Factor* is what you deliberately varied or recorded in your experiment. Some examples of factors are time point, sex, drug, etc. You can split your samples based on a factor. The different bins you create are the *levels* of that factor. For example, time point is a factor, 0h and 6h are levels to that factor. So you have 0h mice and 6h mice. 
However, most experiment don't have just one factor. You have multiple factors you record/observe. Now, you can combine these factors in any way you want. This combination of different factors' levels is a *condition*. In the same example, "0h+male" is a condition. Some experiments refer to condition as a *group*. 

You might've come across the term "2-factor design" if you're a part of any life science experiment. It might sound more familiar to you now, if you read the above paragraph. If you choose two independent factors (factors that don't affect the outcome of each other when varied), and use the same number of replicated tests, you get a *balanced* two factor design. Here's how a typical 2-factor design is written, usually as a grid:

```markdown
|      | No Drug   | drug      |
|------|-----------|-----------|
| WT   | 3 samples | 3 samples |
| KO   | 3 samples | 3 samples |

4 conditions, 12 samples, n = 3 per condition
WT = Wildtype
KO = Knockout
```


### Treatment and control
These terms are pretty straightforward. *Treatment* is the group that got the intervention. *Control* is the group that did not. Everything is measured against the control. 

When something is reported as a ratio, there's a high chance (if not explicity stated), the denominator is your control. 
```
log2FC = log2(expression in treatment / expression in control)
```

You also come across variants of control, such as: 
- *Positive control*: A condition where you know the answer. To prove the assay works in the first place. I like to think of it as running my freshly made pipeline on an existing known-good test dataset. 
- *Negative control*: A condition guaranteed to give null result. Usually used to test for contaminants. For example if I run my DNA extraction assay against plain water and I get some results, I can point to DNA contamination in my setup.


### Replicate
Another independent sample in the same condition. Its purpose is to measure variance in measurements when nothing changes, i.e. the *within group variability*. You can use replicates to separate the noise from the signal.

Without replicates, you don't have the within group variability, so there's nothing to compare the between group difference against. It's not that the test gets weaker, you can't run the test at all.

This is also why sequencing deeper doesn't make up for fewer samples. If you have one mouse per group at 100M reads, you know a lot about those two mice, but nothing about how much two WT mice differ from each other. Three mice per group at 20M reads each will tell you that. The assembly version of this is what made it click for me. 100x coverage of one fish gives you a great assembly, but it tells you nothing about heterozygosity in the population.

#### Biological and technical replicates
A *biological replicate* is a different individual in the same condition. A *technical replicate* is the same material measured again, like one library sequenced on three lanes. Only biological replicates count towards your $n$.

|                    | Biological           | Technical                               |
| ------------------ | -------------------- | --------------------------------------- |
| What varies        | different individual | same material, measured again           |
| Captures           | biological variation | measurement noise (prep, lane, machine) |
| Counts toward $n$? | yes                  | no                                      |

Technical replicates usually get merged into one sample. nf-core/rnaseq does this for you, it concatenates rows in the samplesheet that share a sample name. And if you do two separate extractions from the same animal, that's still a technical replicate, since the biology is identical.

#### Pseudoreplication
Treating measurements that aren't independent as if they were independent replicates. Some examples:
- Three lanes of one library called $n = 3$
- Three punches from one tumour called $n = 3$
- 5,000 single cells from one mouse called $n = 5000$ (this is why pseudobulk exists)

A good way to check is to ask what was independently assigned to a condition. That's your *experimental unit*, and the number of those is your $n$.

#### Number of replicates
- $n = 3$ is the minimum, not the goal. It's fine for cell lines and inbred strains.
- $n = 5$-$6$ is comfortable for tissues and animals.
- $n \geq 12$ for humans, or anything outbred.
- If you have a fixed budget, more replicates are better than more depth. Past ~20-30M reads for standard bulk RNA-seq, extra depth doesn't add much.

### Batch, batch effect, and confounding
A *batch* is any grouping that isn't biology, but can still shift your numbers. Sequencing run, library prep day, kit lot, the person doing the extraction, etc. A *batch effect* is the systematic variation that comes from that grouping, and it can easily be larger than the biological effect you're looking for. 

I already knew this from genome assembly, I just didn't call it that. HiFi reads from a different chemistry, or basecalled with a different basecaller version, look different in ways that have nothing to do with the organism. Same idea. 

*Confounding* is when batch and condition line up perfectly. Here's the difference: 

```markdown
Recoverable (blocked)          Confounded
     batch1  batch2                 batch1  batch2
WT   ●●      ●●                WT   ●●●●    -
KO   ●●      ●●                KO   -       ●●●●
```

On the left, every condition shows up in every batch, so a model can separate the two. On the right, batch and genotype are basically the same variable, and no statistics can pull them apart. Batch correction tools like ComBat won't save you either, removing the batch effect removes the biology with it. The only fix is re-running the experiment. 

So it's better to deal with it while designing the experiment: 
- *Randomisation*: assign samples to batches at random, so batches don't line up with conditions. 
- *Blocking*: deliberately put one of each condition in each batch, like the left grid. This is better than randomisation when you know your batches beforehand, which you usually do. 
- *Recording*: even if you can't control the batch, write it down. If you recorded it, you can model it later. If you didn't, it's just a mystery cluster in your PCA. 

And to check for it after the fact, run a PCA and colour the points by batch. If PC1 splits by sequencing run instead of genotype, you know you have a problem. 

### Covariate
A *covariate* is something you measured on each sample that isn't your factor of interest, but could still affect the outcome. Age, sex, RIN score, sequencing depth, etc. The key difference from a factor is that you recorded it, you didn't assign it. In genomics, batch is also usually treated as a covariate. 

There are two different reasons to include one in your model: 
- *It's linked to both your factor and the outcome*: leave it out, and your answer is wrong. Batch lined up with condition is the extreme version of this. 
- *It only affects the outcome*: leave it out, and your answer is just noisier. Modelling it shrinks the within group variability. 

Each covariate you add costs a degree of freedom though. With $n = 3$ per group, you can really only afford one. Adding covariates until your PCA looks clean is just $p$-hacking. 

### Some designs with names
These come up a lot, so here's a quick list: 
- *Paired*: samples come in linked sets, like the same patient before and after treatment. 
- *Time course*: multiple time points, usually with a `0h` baseline. 
- *Factorial*: a full grid of two or more factors, like the 2-factor table above. 
- *Nested*: units inside units, like several mice per cage, several cages per treatment. 
- *Longitudinal*: the same subjects measured repeatedly over time, so paired and time course together. 

For paired designs, If you have before and after samples from the same 10 patients, and treat them as two independent groups of 10, the differences between patients drown out the signal. Modelling the pairing asks "did each patient change?" instead, which is a much more focused question. 

## What should I check before I look at the data?
When someone hands me a dataset now, these are the six questions (/statements) I try to ask first: 
1. What is the experimental unit? 
2. What units were assigned to a condition?
3. What is $n$ per condition? 
4. What's the denominator? Which group is the control?
5. Is anything confounded?: `pd.crosstab(df.condition, df.batch)` 
6. Merge any hidden technical replicates (if any). Repeated sample names, repeated patient IDs, multiple lanes, etc. 

## Sources
- Susan Holmes and Wolfgang Huber, [Modern Statistics for Modern Biology](https://www.huber.embl.de/msmb/)
- Claude, for the neat markdown sketches
