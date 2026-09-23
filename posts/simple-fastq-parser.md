---
date: 2025-05-24
title: Simple Fastq parser
tags: ["genomics", "programming"]
---

# Your Fastq parser probably breaks on high quality reads

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->

## The issue
I'm writing a small Rust tool to scan G4 quadruplex motifs in sequencing reads. It takes a FASTA or FASTQ (affectionately called FASTX by the community), either gzipped or not, and writes a BED. An MVP needed for my use case worked, until I ran into a weird edge case most FASTA/FASTQ parsers will probably meet sometime sooner or later. My BED file looked good most of the time, but for some reason, it silently returned nonsense for certain files. I (wrongly) diagnosed it as an issue with FASTQ files when `.gz` compressed. I could've just used a pre-written Rust FASTX parser library, but I thought it's a good exercise to get going with Rust, so I stuck with it. 
I just thought I'll avoid using it directly on any `*.fastq.gz` file and I should be good. I was running short on time and I just wanted some answers, not a edge-case tested flagship flagship G4 finding product. A few weeks later after my deadlines passed I decided to sit back on it. Turns out the trigger was actually high-quality reads, so in a weird way "better" data broke my code. 

## A quick description of the bug
FASTA file headers start with a `>`. FASTQ headers start with `@`. In Phred+33, used by Illumina, and my use case, PacBio, quality scores are $ASCII - 33$. So:
- `>` is ASCII 62 $\rightarrow$ Q29
- `@` is ASCII 64 $\rightarrow$ Q31

Both of these are ordinary, decent quality score values in PacBio/Illumina data. So, if a line happened to have its first nucleotide with Q29 or Q31 in a FASTQ file, searching by first character can create problems. 

## What my quick-and-dirty parser did
My v0.1 code decided to decide all downstream actions based on the first character alone, and unconditionally, no checking formats. I thought I was being clever and making an ultra-fast single-purpose parser (too naive). 
```rust
if line.starts_with(">") {
    // treat as a fasta header
    self.is_fastq = false;
    // fasta file actions
}
```
A quality line beginning with `>` was wrongly identified as a FASTA header, and flipped `is_fastq` to false. 


### Consequences of the wrong parsing logic
One misread line would be a small bug, *one* record with a silly name. But flipping `is_fastq` changed how every subsequent line was handled. From that point, the file was being read as a FASTA file. So the next entry's `@header` no longer matched anything, it fell into the sequence accumulator, and got concatenated onto the "nucleotide" sequence. 

Coordinates for the BED were then offset into a string made of header text and quality characters. Continuing downstream, the id parser did `split_whitespace().next()?` on that garbage. Which meant the iterator could return `None`, which to the caller is indistinguishable from "end of file", and truncating the rest of the file. Pretty severe consequences for a simple bug. So, sometimes, the truncation looked like a successful run, but my (potential) G-quadruplex motifs weren't a complete list. 

Here's an example garbage output line in the BEd file. 
```BED
read1                    0   18   G4   18   +
IIIIIIIIIIIIIIIIIIIII    6   24   G4   18   -
```

## Quick fix
My first instinct, going back after months, was to rewrite the whole thing. I felt like I was more comfortable with Rust this time. Instead I caught a single line change that essentially put a band-aid on this bug. Not an elegant fix but it worked. The main culprit was `is_fastq == false` while `fq_step != 0`. These two combinations decided the file is FASTA, and that we're partially through a FASTQ record. Since these two can't both be true at the same time, it's an illegal state, so adding a check for "is `fq_step == 0` along with checking if the line starts with `>` solved it. A lesson learnt: I don't need to rewrite everything when I come back to a project after a while. 

```rust
if line.starts_with(">") && self.fq_step == 0 { // the "this post could've been an e-mail" line
```

## Testing the fixes
This section is also a reference for my future self to write up Rust tests. Making the parser generic over `R: BufRead` rather than taking a `Box<dyn BufRead>` lets the test input live inline next to the assertion. Here's an example test (can check with `cargo test`). 

```rust
#[test]
fn fastq_quality_line_starting_with_gt_is_not_a_header() {
    let recs = parse("@r1\nGGG\n+\n>>>\n@r2\nCCC\n+\nIII\n");
    assert_eq!(recs.len(), 2);
    assert_eq!(recs[0].id, "r1");
    assert_eq!(recs[1].id, "r2");
}
```
I also built a fixture that walks the full printable Phred+33 range (` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGH `) so `>` and `@` aren't "special" when going through the quality score line of a FASTQ. They're just two bytes in the middle of a legal quality string line. 

## Take-away 
the strict four-line header is still the right architecture. And my lesson here is that if a well-tested third party library exists, check out their documentation to make sure you've covered all the edge cases. Something that looks simple and is a forethought when writing code and can screw up production code. It's nice to write my own code and lower my dependence on external libraries, but sometimes, especially if its used everywhere, maybe it's not the worst option. I would not create my own `flate2` alternative as a `gz` reader from scratch for this project, for instance. Not enough ROI for the time investment.
