#!/bin/bash
# Flattens the Vibeo token contract.
/usr/local/share/dotnet/dotnet "../SolidityFlattener/bin/Debug/netcoreapp2.1/SolidityFlattener.dll" "contracts/VibeoToken.sol" "contracts/VibeoTokenFlattened.sol" ".,../node_modules"
echo "Success!"