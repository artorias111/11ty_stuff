---
date: 2026-04-07
title: How I use AI coding assistants to learn Biology and Math
tags: ["learning"]
---

# How I use AI coding assistants to learn Biology and Math

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->

> The motivation for this whole ordeal started with me trying to figure out how Non-Allelic Homologous Recombination works, when we were trying to brainstorm ideas to explain a certain locus deletion on an evolutionary timescale in a lab meeting. As I kept going into the molecular genetics rabbit hole, I realized there's so many things I don't know, and yet I go around calling myself a "biologist". 

I do bioinformatics for work, and it's infamously a Venn Diagram of three fields: Biology, Statistics, and Computer Science. All three are necessary, and vast fields, we all end up blind spots. I can't read [all of statistics](https://www.stat.cmu.edu/~brian/valerie/617-2022/0%20-%20books/2004%20-%20wasserman%20-%20all%20of%20statistics.pdf) from start to finish, even if the first chapter reads well and it's tempting. 

I also have a habit of stacking up textbooks and other learning resources, such as papers and lecture notes (you'd be surprised how many things are given away for free by the authors, it's great!) into a "reading list". So many pages to read, so little time. 

And I'd recently set up Claude code to help with quick scripting for my projects. So I was thinking, why not use it to set up an AI tutor. I ask Claude to give me daily homework and reading lists from these valuable resources I've collected. And I capped it to max an hour a day. I type the answers out (I eventually started writing them out to reduce my screen time even if its just by an hour a day), and then give it back, and it "grades" me. I got a little more creative. I made it respond to how I answer, sort of like a difficulty knob. Questions were too hard $\rightarrow$ My answers would be graded bad $\rightarrow$ tomorrow's questions are slightly easier. And I also made it do a "SWOT analysis" on me, so over time I can gauge my strengths and weaknesses. **But You need to give a good background on yourself so Claude knows how much you already know**. I also made Claude keep a hidden `progress.md` (well, not really hidden, but I just don't read it, there's enough to read already) so it can keep track of my progress and how I'm doing. 




I eventually switched from Claude code to Antigravity (`agy` - not sure if it'll still be valid a few months from now, or if it'll join the [graveyard](https://killedbygoogle.com/)). Claude's tokens were the price of gold at the time of writing this post. But it's the same thing, you get the idea. 

And this takes a while, I stuck to it for a month, and it went from feeling like a chore to a nice break. Not too easy, but no too difficult either. Just the right amount of spaced repetitions to keep my mind fresh. Might not work for everyone, but if you'd rather answer questions than read textbooks, this is a way to keep yourself regularly coming back to what's important. 

I also plan to keep a running log of whatever I'm learning through `agy`'s tutoring to keep myself accountable. 

[Here](https://github.com/artorias111/molecular-genetics-notes) is the link to the repo if you want to fork and start a version of this for yourself.
