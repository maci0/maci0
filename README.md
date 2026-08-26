<div align="center">

<img src="banner.svg" width="860" alt="Marcel Wysocki, Senior Principal Architect @ Red Hat, Singapore" />

I build AI inference infrastructure and container runtimes, from WGSL compute kernels
to distributed GPU clusters, with side quests in binary reverse engineering.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-marcel--w--wysocki-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/marcel-w-wysocki)
![Zig](https://img.shields.io/badge/Zig-F7A41D?style=flat-square&logo=zig&logoColor=black)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![CUDA](https://img.shields.io/badge/GPU-76B900?style=flat-square&logo=nvidia&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)

</div>

## 🧠 AI inference, down to the metal

- [**agave**](https://github.com/maci0/agave): LLM inference engine written from scratch in Zig, no Python runtime, no framework tax
- [**cwen**](https://github.com/maci0/cwen): Qwen3 inference in pure C: mmap'd Q4 GGUF, AVX-512 kernels, speculative decoding, zero dependencies
- [**beam**](https://github.com/maci0/beam): Ray's API reimplemented in ~1,400 lines of pure Python, enough to run vLLM multi-node. NVIDIA and AMD, validated cross-node
- [**vllm-webgpu**](https://github.com/maci0/vllm-webgpu): vLLM platform plugin targeting WebGPU: WGSL compute kernels instead of CUDA
- [**vllm-spark-0731**](https://github.com/maci0/vllm-spark-0731): Serving DeepSeek-V4-Flash on a 2-node DGX Spark cluster: fp8 and nvfp4 MLA kernels, everything measured on real hardware
- [**muninn-sidecar**](https://github.com/maci0/muninn-sidecar): Persistent memory for AI agents, shipped as a Go sidecar
- [**gpustack-modelsync**](https://github.com/maci0/gpustack-modelsync): Declarative model placement across GPU cluster nodes
- [**toktop**](https://github.com/maci0/toktop): htop for LLM inference engines and the coding agents hammering them
- [**gb10-thermal-toolkit**](https://github.com/maci0/gb10-thermal-toolkit): Thermal-driven GPU clock governor for NVIDIA DGX Spark, fixes the under-load power-off
- [**gauntlet**](https://github.com/maci0/gauntlet): Auto-fix review loop, 50 specialized prompts dispatched to whatever AI coding agents you have installed
- [**clanker**](https://github.com/maci0/clanker): Self-improving agent harness in Zig, gated self-patch loop with sandboxed WASM tools

## 🕹️ Reverse engineering

- [**rebrew**](https://github.com/maci0/rebrew): Compiler-in-the-loop decompilation workbench for binary-matching reversing
- [**rebrew-toolchains**](https://github.com/maci0/rebrew-toolchains): Docker images for legacy Windows/DOS compilers, MSVC 1.0-11.0 through Borland, Watcom and Delphi
- [**europa1400-networkfix**](https://github.com/maci0/europa1400-networkfix): Fixed multiplayer in a 2001 game the vendor abandoned
- [**openmiles**](https://github.com/maci0/openmiles): Open reimplementation of the Miles Sound System
- [**ct-recomp**](https://github.com/maci0/ct-recomp): Byte-identical decompilation and asset rebuild of Chrono Trigger (SNES)
- [**resembl**](https://github.com/maci0/resembl): Assembly code similarity search
- [**recoverage**](https://github.com/maci0/recoverage): Coverage dashboard for binary-matching decompilation projects
- [**europa1400-lua**](https://github.com/maci0/europa1400-lua): Lua console injected into a running 2001 game, for reverse engineers and modders

## ⚙️ Runtimes and clusters

- [**katamaran**](https://github.com/maci0/katamaran): Live migration for Kata Containers
- [**vmetal-openshift**](https://github.com/maci0/vmetal-openshift): Virtual baremetal OpenShift lab: Redfish BMC emulation, bonded NICs, split-DNS, one Ansible topology

<div align="center">

*Zig for things that must be fast, Python for things that must exist by Friday.*

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/maci0/maci0/output/github-snake-dark.svg" />
  <img src="https://raw.githubusercontent.com/maci0/maci0/output/github-snake.svg" alt="contribution snake" />
</picture>

</div>
