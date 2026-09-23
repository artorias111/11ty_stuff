---
date: 2025-08-07
title: Experimental Design in Biology
draft: true
permalink: /notes/learning/experimental-design/
tags: ["biology"]
---

# Experimental Design in Biology

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->
Somewhere in between engineering in college to computational genomics now, I missed the statistics boat. Not in the sense that I can't compute a $p$-value. Instead, back when I started grad school, when someone said null, design, statistical inference, etc., nothing fired. They stayed as nouns and never turned into the questions you're supposed to ask before you look at data. 

It took me an embarrassingly long time to work out why. I was too used to working in a deterministic setting. Engineering math is mostly deterministic, so is making genomics pipelines. When making these pipelines I specify an input, and expect an output of a certain kind, and its always guaranteed to give me the same kind of output, by design. 

So this is a way of me back-filling, and drilling biological experimental design, mostly so I stop being thrown off by them when I discuss biological data with my peers. 

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
