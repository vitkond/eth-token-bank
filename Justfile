#!/usr/bin/env just --justfile
export PATH := join(justfile_directory(), "node_modules", "bin") + ":" + env_var('PATH')

alias rn := run-node
alias d := deploy
alias rs := run

run-node:
  npx hardhat node

deploy:
  npx hardhat compile
  npx hardhat ignition deploy ignition/modules/TokenBank.ts --network localhost --reset

run script:
  npx hardhat run scripts/{{script}}.ts --network localhost