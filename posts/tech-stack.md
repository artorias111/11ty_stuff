---
title: Tech stack
permalink: /notes/tech-stack/
updated: 2026-08-07
tags: ["programming"]
living: true
---

# Tech stack

An opinionated list of things I like and dislike in my daily work. 
## Notes
Obsidian. I was in on it way back before the "[second brain](https://youtu.be/6NukGtwJb7Y?si=ZkGXeENL2VFsrJ5_)" gigachads got into it. Thanks to them, I don't need to be afraid of Obsidian going bankrupt and closing down. It's big now. 

Please use Firefox/[Zen browser](https://zen-browser.app/) if possible. I think Google Chrome and its browser engine has enough market share already. 
## Editor, terminal and shell
I switch between [Neovim](https://neovim.io/), [Zed](https://zed.dev/) and [VSCodium](https://vscodium.com/). I wish I could only use Neovim full-time.  But somehow LSP on neovim has never been smooth. I tried [Helix](https://helix-editor.com/) but couldn't get used to the new keybindings. Also, the lack of plugins bothered me. 

I switch between [Ghostty](https://ghostty.org/) and [WezTerm](https://wezterm.org/) on MacOS. Once I started using Claude code, I switched to [cmux](https://cmux.com/) for a bit. And then, I found my home in [Herdr](https://herdr.dev/). So I've now stuck to Ghostty + Herdr. 

In the remote cluster (no [Slurm](https://slurm.schedmd.com/overview.html)), I use [tmux](https://github.com/tmux/tmux/wiki). I've also written a basic [guide](https://github.com/artorias111/tmux_quick_start) for using tmux early in grad school, and successfuly convinced some of my peers to switch to (or start using) tmux.  

I've taken bait to the rising list of rust-powered command line tools. I am a big fan of [starship](https://starship.rs/), [dust](https://github.com/bootandy/dust), [zoxide](https://crates.io/crates/zoxide), and [eza](https://eza.rocks/). They're all nice to have. 

Someone I know once said [Zsh](https://www.zsh.org/) is like a Tesla (I don't think he meant that in a good way), when I asked for it to be installed alongside bash in the remote cluster. 