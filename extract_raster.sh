#!/bin/bash

for fname in data/raster/*.avg_lights_x_pct.tar; do
    # echo ${fname:12:28}'.tif.gz'
    tar -zxvf $fname ${fname:12:28}'.tif.gz'
    gunzip ${fname:12:28}'.tif.gz'
done
