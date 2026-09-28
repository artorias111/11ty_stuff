---
date: 2026-09-23
title: Assembly (not the genome kind)
permalink: /notes/learning/assembly-not-the-genome-kind/
tags: ["programming"]
draft: true
---

# Assembly (not the genome kind)

Coding (or trying to code) in assembly gives me a certain kind of overconfidence that's hard to explain. There's a layer of abstraction between assembly and machine code, but I feel like I'm *talking* to the computer when it's assembly. I just don't get that bare-metal feeling when I'm coding up something in Python.

Anyway, I've been reading an excellent book, [programming from the ground up](https://archive.org/details/programming-from-the-ground-up), and it brings a certain kind of a mixture of both ancient joy and difficulty dread that's hard to explain. 

I made a neat note, like a smartass, on the side of a margin as I was reading one of the first chapters on different addressing modes.
> It's all just a bunch of bookkeeping

It's obviously more complicated than that. But, at the end of the day, we're moving around a bunch of numbers across different addressed bytes (or as the books tries to explain it to someone like me a "box" to store your number). And the key for any program (at least for the von Neumannesque), is to keep track of three things. The numbers, the addresses of these numbers, and finally, the operations you want to perform on these numbers. Many ways to do each of these. (But hey, I'm a biologist, I'm not getting paid to move numbers around).
