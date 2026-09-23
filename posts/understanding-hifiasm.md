---
date: 2026-05-29
title: Understanding hifiasm
tags: ["genomics"]
---

# Understanding hifiasm

I run hifiasm often enough that I got uncomfortable not knowing what it does between reading my FASTQ and writing my GFA. This blog post is me working through the core of the HiFi pipeline: the part that takes reads and produces a graph. (I've left out trio binning, Hi-C phasing and `purge_haplotigs`, which deserve their own post). 

## What kind of assembly graphs does Hifiasm use?

There are two ways to abstract an assembly. A [de Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph) makes $k$-mers the nodes and $k-1$ overlaps the edges. A string graph makes *reads* the nodes and suffix-prefix overlaps the edges. Short-read assemblers use de Bruijn graphs because of scaling issues when you do all-vs-all comparisions ($O(N^2)$), so you chop reads into $k$-mers and allow for a near-linear $O(n \cdot k)$ scaling. 

In HiFi sequencing, a molecule is sequenced $m$ times and the passes are polled via the consensus (thus the term PacBio *ccs*), so a consensus base is wrong roughly when a majority of passes land on the same wrong base:

$$\epsilon_{\text{HiFi}} \;\lesssim\; \sum_{j > m/2} \binom{m}{j} \, \epsilon_{\text{raw}}^{\,j} \, (1 - \epsilon_{\text{raw}})^{m-j}$$

This is an optimistic bound. Real CCS uses an Hidden Markov Model over the subreads, and homopolymer errors are correlated across passes in a way the independence assumption ignores, which is why homopolymers remain the
weak spot. But it explains the shape of the result: with $\epsilon_{\text{raw}} \approx 0.12$ and $m \approx 10\text{–}20$, the majority term collapses and we land near $10^{-3}$ to $10^{-4}$.

I've worked with teleost and reptile genomes, which usually work great with hifiasm: for reasons described in the following sentences. To keep things simple, let's use humans to model the heterozygosity (~1 SNP per 1000 bp). The error rate is at or below the density of real variation. Hifiasm works on this principle: if errors are rarer than heterozygous sites, then a difference between two overlapping reads is *more likely to be biology than noise*. Phasing can be done during error correction instead of after assembling.  


## Seeding and overlap

Overlaps are found with minimizers ([this introductory tutorial](https://homolog.us/blogs/bioinfo/2017/10/25/intro-minimizer/) helped me a lot back when I was starting with them). Over a window of $w$ consecutive k-mers
starting at $i$:

$$M(i) = \arg\min_{j \in [i,\, i+w)} h\big(s[j:j+k]\big)$$

Defaults are `-k 51 -w 51`. $k=51$ is enormous by assembler standards — miniasm uses 15–19 — and it is a direct dividend of the accuracy above. A shared 51-mer is essentially never a coincidence, so you can seed on exact matches and skip the sensitivity machinery a noisy-read assembler needs. Minimizers select about $2/(w+1)$ of positions, so the index stays small.

Repetitive seeds are the thing that will kill you: a k-mer present in $t$ copies seeds $O(t^2)$ candidate pairs. So $k$-mers occurring more than `-D` (5.0) times the estimated coverage are dropped, singletons below `--min-hist-cnt` (5) are treated as errors, and `-f` (37) sets the bits of the Bloom filter used to avoid storing the singletons in the first place.

Candidate pairs then get **base-level** alignment, which is unusual. Most assemblers align sketches (sketching is also worthy of its own post) of reads to each other, but hifiasm needs real mismatch positions later, so it cannot throw the bases away. It affords this with [Myers' bit-vector algorithm](https://docs.rs/bio/latest/bio/pattern_matching/myers/index.html), which packs the dynamic programming column into machine words and computes an edit-distance column in $O(n/w_{\text{word}})$ word operations instead of $O(n)$. So a full $n \times m$ alignment costs $O(nm/w_{\text{word}})$.
Reads are cut into small non-overlapping windows, the vectorization (with SIMD operations) can run several windows at once, and the regions straddling window boundaries get realigned afterwards, because an alignment truncated at a window edge is unreliable.

## Correcting errors without erasing the heterozygosity

The naive idea is to pile up every read overlapping your target and take the plurality base. That removes sequencing errors. It also removes every heterozygous SNP, because at a het site the reads from the other haplotype look exactly like a pile of errors. Let's look at the case of a diploid genome (since its humans throughout, I guess I didn't have to explicitly mention that). 

Hifiasm's way is to decide *which* reads are allowed to vote. Take a target read $r_t$ and its overlapping set $\mathcal{O}(r_t)$. At each position $p$, collect the bases supported by at least three reads:

$$\mathcal{B}(p) = \Big\{\, b \in \{A,C,G,T\} \;:\; \big|\{ r_i \in \mathcal{O}(r_t) : r_i[p] = b \}\big| \geq 3 \,\Big\}$$

and call $p$ **informative** when $|\mathcal{B}(p)| \geq 2$: two different bases, each backed by three or more reads, gaps ignored. One allele is a variant; two alleles at once is a heterozygous site. Let $\mathcal{I}(r_t, r_i)$ be the informative positions inside the overlap. Then $r_i$ is *consistent* with $r_t$ when it agrees everywhere on them:

$$\forall p \in \mathcal{I}(r_t, r_i) : \; r_i[p] = r_t[p]$$

and *inconsistent* the moment it differs at one. If $\mathcal{I}(r_t, r_i) = \emptyset$ the overlap spans no het site at all, so the read is uninformative about haplotype and is kept. Correction then runs the plurality vote over the survivors only:

$$\hat{r}_t[p] = \arg\max_{b} \big|\{\, r_i \in \mathcal{C}(r_t) : r_i[p] = b \,\}\big|$$

Inconsistent reads are not discarded, instead, they are *recorded*, because "these two reads are from different haplotypes" is the observation the primary assembly and duplicate purging both consume later.

The same test does a second job. Two copies of a repeat differ at fixed positions across many reads, which is indistinguishable from a het site, so repeat copies get separated by the same rule that separates haplotypes.

### Why three reads, and why three rounds

For noise to fake an informative position, at a homozygous site with coverage $\bar{c}$ and per-base error $\epsilon$, three reads must carry the *same* wrong base, so each read contributes with probability $\epsilon/3$:

$$P_{\text{spurious}} \;\approx\; 3\left[1 - \sum_{j=0}^{2} \binom{\bar{c}}{j} \left(\tfrac{\epsilon}{3}\right)^{j} \left(1 - \tfrac{\epsilon}{3}\right)^{\bar{c}-j}\right]$$

At $\bar{c} = 30$ and $\epsilon = 0.003$ this is about $1.2 \times 10^{-5}$ per position. But a 20 kb read has 20,000 positions, so you expect a spurious informative site in roughly one read out of four. However, that's not as bad as you'd think: a false informative position throws away the three erring reads, and losing 3 of 30 votes changes no consensus call. The dangerous case runs the other way. If the *target* read carries an error at a genuinely heterozygous position, it matches neither allele, every overlapping read is inconsistent with it, and the read loses its entire correction support. A 20 kb human read spans about 20 het sites, so this hits

$$1 - (1-\epsilon)^{20} \approx 6\%$$

of reads on the first pass. That is the chicken-and-egg problem: identifying het sites needs corrected reads, and correcting reads needs the het sites. Hence `-r 3`. Round one corrects what it can, round two re-runs overlaps on partially-corrected reads so fewer targets carry errors at het positions, round three cleans up. Three rounds is not a magic number, it is enough iterations for that 6% to decay.

Notice the number falls out of heterozygosity, not just error rate. A wild outbred organism with several times human heterozygosity has proportionally more het sites per read, which both improves the phasing signal and worsens this failure mode at the same time.

## The graph, where bubbles are the point

Overlaps are recomputed on the corrected reads and a string graph is built: vertices are oriented reads ($r^+$ and $r^-$, so $|V| = 2n$), and **only consistent overlaps become edges**. Contained reads carry no unique sequence and drop out, as in Myers' original formulation. [Transitive reduction](https://en.wikipedia.org/wiki/Transitive_reduction) then removes any edge $(u,w)$ that is already implied by a path $u \to v \to w$, which strips the graph down to the edges that carry information.

What is left at a heterozygous locus is a [bubble](https://user-images.githubusercontent.com/9053403/110452767-7225e000-8100-11eb-926e-e0d67f144a8b.png). Reads on the two sides are mutually inconsistent, so no edge crosses between them. Reads at $s$ and $t$ overlap both sides because their overlaps are too short to reach a het allele. Every other assembler treats this bubble as a defect and pops it, keeping one allele and discarding the other. Hifiasm keeps it. Also, since I skipped them: Trio binning (you also have the parents' HiFi data) and Hi-C (proximity ligation data), when you have them, are just ways of deciding which side of each bubble belongs with which, so improved *phasing*. 

This is also why graph cleaning has to be careful. Corrected reads still have residual errors, so short spurious overlaps need cutting, and `-a` (4) rounds interpolate a drop ratio between `-x` (0.8) and `-y` (0.2) so that a short overlap is only kept when nothing better exists. But a naive length-ratio rule would shear off one side of a real bubble. That's why the cleaning is described as "topology-aware": it cuts overly short overlaps while refusing to
destroy substructures that carry local phasing.

## What I took away

Being in a lab that seems to runs hifiasm every other day, the thing worth internalising is that hifiasm does not phase after assembling. Phasing and error correction are *the same operation*, the decision of which reads may correct a target is already a haplotype assignment, and by the time a graph exists the haplotypes are separate objects in it. Everything downstream only chooses which side to print. 

---

*Sources: Cheng, Concepcion, Feng, Zhang & Li (2021), "Haplotype-resolved de novo
assembly using phased assembly graphs with hifiasm", Nature Methods 18:170–175;
Myers (2005), "The fragment assembly string graph"; Myers (1999), "A fast
bit-vector algorithm for approximate string matching"; hifiasm parameter
documentation.*
