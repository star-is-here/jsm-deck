#!/bin/bash

for filename in img/*; do
    convert $filename -alpha on -channel a -evaluate set 20% ${filename:0:(${#filename}-4)}"_opaque.png"
done