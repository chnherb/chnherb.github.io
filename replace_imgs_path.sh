#!/bin/bash

for file in `find . -name "*.md"`
do
  sed -i 's#./imgs/#../imgs/#g' $file
done