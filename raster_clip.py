import ujson as json, pprint, csv, numpy as np, rasterio, rasterio.features, fiona, matplotlib.pyplot as plt, os, tarfile, gzip, glob, editdistance
from affine import Affine
from scipy.stats.mstats import mquantiles
from shapely.geometry import shape
from shapely.ops import unary_union
from tqdm import *

pp = pprint.PrettyPrinter(indent=2)

def clip_and_pull(vname, rdir, dumpCSV=False, dumpJSON=False, view=False):
    county, video, name, nation = {}, [], [], []
    rfiles = [ x for x in os.listdir(rdir) if 'tif' == x[-3:] ]
    rdates = [ x[10:16] for x in os.listdir(rdir) if 'tif' == x[-3:] ]
    for i, rname in enumerate(tqdm(rfiles)):
        with open(vname, 'r') as vector, rasterio.open(rdir + rname, 'r') as raster:
            for feature in tqdm(json.load(vector)['features']):
                # pp.pprint(feature['properties'])
                # create a shapely geometry
                # this is done for the convenience for the .bounds property only
                geometry = shape(feature['geometry'])
                nation.append(geometry)
                try:
                    cntyid = feature['properties'][u'name:en']
                except KeyError:
                    cntyid = feature['properties'][u'name']
                try:
                    county[cntyid][rdates[i]] = { 'name': cntyid }
                except KeyError:
                    county[cntyid] = { rdates[i]: { 'name': cntyid } }

                # get pixel coordinates of the geometry's bounding box
                ul = raster.index(*geometry.bounds[0:2])
                lr = raster.index(*geometry.bounds[2:4])

                # read the subset of the data into a numpy array
                window = ((lr[0], ul[0]+1), (ul[1], lr[1]+1))
                data = raster.read(1, window=window)

                # create an affine transform for the subset data
                t = raster.affine
                shifted_affine = Affine(t.a, t.b, t.c+ul[1]*t.a, t.d, t.e, t.f+lr[0]*t.e)

                # rasterize the geometry
                mask = rasterio.features.rasterize(
                    [(geometry, 0)],
                    out_shape=data.shape,
                    transform=shifted_affine,
                    fill=1,
                    all_touched=True,
                    dtype=np.uint8)

                # create a masked numpy array
                masked_data = np.ma.array(data=data, mask=mask.astype(bool))

                # plot area to review
                if view:
                    name.append((cntyid, rdates[i]))
                    video.append(masked_data)

                # calculate statistics at county level
                county[cntyid][rdates[i]]['sum'] = float(np.ma.sum(masked_data))
                county[cntyid][rdates[i]]['mean'] = float(np.ma.mean(masked_data))
                county[cntyid][rdates[i]]['std'] = float(np.ma.std(masked_data))
                county[cntyid][rdates[i]]['quantiles'] = [ float(x) for x in mquantiles(masked_data, prob=[0,0.05,.1, .2, 0.3,0.4,.5, 0.6,0.7, 0.8, 0.9,0.95, 1], alphap=1, betap=1).tolist() ]

    # pp.pprint(county)
    # save a copy
    if dumpJSON:
        with open('%s.json'%fname, 'wb') as f:
            json.dump(county, f)

    if dumpCSV:
        with open('%s.csv'%fname, 'wb') as f:
            writeme = csv.writer(f)
            writeme.writerow(['Name', 'ID', 'Radiance'])
            for muni in county.keys():
                writeme.writerow([county[muni]['name'], muni, county[muni]['sum']])

    if view:
        plt.ion()
        for i in range(len(video)):
            plt.imsave('data/image/%s-%s.jpg'%(name[i][0], name[i][1]), video[i], vmin=0, vmax=1, cmap='afmhot')
            # plt.figure()
            # plt.imshow(video[i], vmin=0, vmax=1, cmap='afmhot')
            # plt.show()
            # plt.pause(0.001)
            # plt.close()

    return county

def clip_and_pull_dmsp(vname, rname, dumpJSON=False, view=False):
    country, video, name, planet = {}, [], [], []
    year = rname[15:19]
    satellite = rname[12:15]
    with open(vname, 'r') as vector, rasterio.open(rname, 'r') as raster:
        for feature in tqdm(json.load(vector)['features']):
            if u'name:en' in feature['properties'].keys():
                tqdm.write('Processing nation: %s'%feature['properties'][u'name:en'])
                # pp.pprint(feature['properties'])
                # create a shapely geometry
                # this is done for the convenience for the .bounds property only
                geometry = shape(feature['geometry'])
                try:
                    natname = feature['properties'][u'name:en']
                except KeyError:
                    natname = feature['properties'][u'name']
                country = { 'name': natname, 'instrument': satellite }

                # get pixel coordinates of the geometry's bounding box
                ul = raster.index(*geometry.bounds[0:2])
                lr = raster.index(*geometry.bounds[2:4])

                # account for high north 
                if lr[0] < 0:
                    lr = (0, lr[1])

                # read the subset of the data into a numpy array
                window = ((lr[0], ul[0]+1), (ul[1], lr[1]+1))
                data = raster.read(1, window=window)

                # create an affine transform for the subset data
                t = raster.affine
                shifted_affine = Affine(t.a, t.b, t.c+ul[1]*t.a, t.d, t.e, t.f+lr[0]*t.e)

                # rasterize the geometry
                mask = rasterio.features.rasterize(
                    [(geometry, 0)],
                    out_shape=data.shape,
                    transform=shifted_affine,
                    fill=1,
                    all_touched=True,
                    dtype=np.uint8)

                # create a masked numpy array
                masked_data = np.ma.array(data=data, mask=mask.astype(bool))

                # plot area to review
                if view:
                    name.append(natname)
                    video.append(masked_data)

                # calculate statistics at country level
                country['sum'] = float(np.ma.sum(masked_data))
                country['mean'] = float(np.ma.mean(masked_data))
                country['std'] = float(np.ma.std(masked_data))
                country['quantiles'] = [ float(x) for x in mquantiles(masked_data, prob=[0,0.05,.1, .2, 0.3,0.4,.5, 0.6,0.7, 0.8, 0.9,0.95, 1], alphap=1, betap=1).tolist() ]

                planet.append(country)

    # pp.pprint(country)
    # save a copy
    if dumpJSON:
        with open('data/dmsp_timeseries.json', 'r') as f:
            jfile = json.load(f)
            jfile[year].extend(planet)
        with open('data/dmsp_timeseries.json', 'w') as f:
            json.dump(jfile, f)

    if view:
        plt.ion()
        for i in range(len(video)):
            plt.imsave('data/image/%s.jpg'%name[i], video[i], vmin=0, vmax=1, cmap='afmhot')
            # plt.figure()
            # plt.imshow(video[i], vmin=0, vmax=1, cmap='afmhot')
            # plt.show()
            # plt.pause(0.001)
            # plt.close()

    return planet

def chkcntry(cntry, cntrylist, stoplist = False):
    with open('data/swapnation.json', 'r') as f:
        swapnation = json.load(f)
    with open('data/ignorenation.json', 'r') as f:
        ignorenation = json.load(f)
    if cntry in swapnation.keys():
        return swapnation[cntry]
    elif cntry not in ignorenation:
        dist = [ editdistance.eval(cntry, x) for x in cntrylist ]
        suggestion = [ cntrylist[i] for i,x in enumerate(dist) if x == min(dist) ]
        return suggestion[0]
    else:
        return None

def correlateSeries(series1, series2):
    # Remove missing
    clean = [[],[]]
    for i in range(len(series1)):
        if series1[i] != None and series2[i] != None:
            clean[0].append(series1[i])
            clean[1].append(series2[i])
    if len(clean[0]) != 0:
        # return np.corrcoef(np.log(clean[0]), clean[1])[0][1]
        return np.corrcoef(clean[0], clean[1])[0][1]
    else:
        return None


if __name__=='__main__':
    ########################################################################################################################
    # Define nations and admin levels
    ########################################################################################################################
    # levels = [ 'admin_level_4.geojson', 'regions.geojson' ]
    # nations = [ 'china', 'north-korea', 'south-korea', 'bangladesh', 'india', 'japan', 'republic-of-china', 'thailand', 'vietnam' ]
    ########################################################################################################################
    # Process nations on VIIRS
    ########################################################################################################################
    # final_csv = []
    # for nation in nations:
    #     # print 'Processing %s\n'%nation
    #     # for level in levels:
    #     #     clip_and_pull('data/vector/' + nation + '/' + level, 'data/raster/', view=True, dumpJSON=True)
    #     with open('data/vector/' + nation + '/regions.geojson.json', 'rb') as f:
    #         national = json.load(f)
    #         if nation == 'china':
    #             date = [ x[:4] + '-' + x[4:] for x in national[nation].keys() ]
    #             final_csv.append(date)
    #         avgrad = [ national[nation][x[:4]+x[5:]]['mean'] for x in date ]
    #         # avgrad = [ x / max(avgrad) for x in avgrad ]
    #         final_csv.append(avgrad)
    # with open('data/time_series.csv', 'wb') as f:
    #     writeme = csv.writer(f)
    #     writeme.writerow(['date'] + nations)
    #     for row in zip(*final_csv):
    #         writeme.writerow(row)
    # final_csv = []
    # with open('data/vector/north-korea/admin_level_4.geojson.json', 'rb') as f:
    #     nk = json.load(f)
    #     provinces = nk.keys()
    #     for province in nk.keys():
    #         if province == u'North Hamgyong':
    #             date = [ x[:4] + '-' + x[4:] for x in nk[province].keys() ]
    #             final_csv.append(date)
    #         final_csv.append([ nk[province][x]['mean'] for x in nk[province].keys() ])
    # with open('data/vector/south-korea/admin_level_4.geojson.json', 'rb') as f:
    #     sk = json.load(f)
    #     provinces.append(sk.keys())
    #     for province in sk.keys():
    #         final_csv.append([ sk[province][x]['mean'] for x in sk[province].keys() ])
    # with open('data/time_series_kor.csv', 'wb') as f:
    #     writeme = csv.writer(f)
    #     writeme.writerow(['date'] + provinces)
    #     for row in zip(*final_csv):
    #         writeme.writerow(row)
    ########################################################################################################################
    # Create JSON for Leaflet
    ########################################################################################################################
    # parity = {}
    # with open('data/MDG611.csv', 'rb') as f:
    #     reader = csv.reader(f)
    #     for row in reader:
    #         parity[unicode(row[1])] = row[24:28]
    # with open('data/vector/countries.geo.json', 'rb') as f:
    #     planet = json.load(f)
    #     for country in planet['features']:
    #         try:
    #             country['properties']['parity1'] = parity[country['properties']['name']][0]
    #             country['properties']['parity2'] = parity[country['properties']['name']][1]
    #             country['properties']['parity3'] = parity[country['properties']['name']][2]
    #             country['properties']['parity4'] = parity[country['properties']['name']][3]
    #         except KeyError:
    #             country['properties']['parity1'] = None
    #             country['properties']['parity2'] = None
    #             country['properties']['parity3'] = None
    #             country['properties']['parity4'] = None
    # with open('data/vector/countries_parity.geo.json', 'wb') as f:
    #     json.dump(planet, f)
    ########################################################################################################################
    # Create DMSP Raw Time Series
    ########################################################################################################################
    # path = 'data/raster/'
    # rasters = glob.glob(path+'/*pct.tar')
    # # years = range(1992, 2014, 1)
    # # with open('data/dmsp_timeseries.json', 'w') as f:
    # #     json.dump({ year:[] for year in years }, f)
    # for farchive in tqdm(rasters[28:]):
    #     archive = tarfile.open(farchive)
    #     for i, raster in enumerate(archive.getnames()):
    #         if raster[-3:] == '.gz':
    #             archive.extract(raster)
    #             rname = path+raster[:-3]
    #             tqdm.write('Processing raster: %s'%rname)
    #             with gzip.open(raster, 'rb') as f:
    #                 # tqdm.write('Extract %s'%raster)
    #                 with open(path+raster[:-3], 'wb') as g:
    #                     # tqdm.write('Write %s'%(path+raster[:-3]))
    #                     g.write(f.read())
    #             vname = 'data/vector/planet/admin_level_2.geojson'
    #             tqdm.write('Processing vector: %s'%vname)
    #             clip_and_pull_dmsp(vname, rname, dumpJSON=True)
    #             os.remove(path+raster[:-3])
    # vname = 'data/vector/planet/admin_level_2.geojson'
    # rname = 'data/raster/F182010.v4c.avg_lights_x_pct/F182010.v4c.avg_lights_x_pct.tif'
    # clip_and_pull_dmsp(vname, rname, dumpJSON=True)
    ########################################################################################################################
    # Process DMSP and MDG
    ########################################################################################################################
    # with open('data/dmsp_timeseries.json', 'r') as f:
    #     dmsp = json.load(f)
    # cntrylist = []
    # with open('data/MDG_Export_cleaned.csv', 'r') as f:
    #     table = csv.reader(f)
    #     for i, row in enumerate(table):
    #         if i == 0:
    #             varname = row
    #             years = { x:i for i,x in enumerate(row[5:]) } 
    #             mdgdict = { x:{} for x in years.keys() }
    #         else:
    #             for year, i in years.items():
    #                 try:
    #                     ind = float(row[i+5])
    #                 except ValueError:
    #                     ind = None
    #                 try:
    #                     mdgdict[year][row[1]][row[2]] = ind
    #                 except KeyError:
    #                     try:                 
    #                         mdgdict[year][row[1]] = {row[2]:ind}
    #                     except KeyError:
    #                         mdgdict[year] = {row[1]: {row[2]:ind}}
    #             cntrylist.append(row[1])
    # cntrylist = list(set(cntrylist))
    # for year in tqdm(dmsp.keys()):
    #     nation_dict = {}
    #     for nation in dmsp[year]:
    #         try:
    #             nation_dict[nation['name']] += nation['mean']
    #             nation_dict[nation['name']] / 2 
    #         except KeyError:
    #             nation_dict[nation['name']] = nation['mean']
    #     for nationNm in nation_dict.keys():
    #         if chkcntry(nationNm, cntrylist) != None:
    #             mdgdict[year][chkcntry(nationNm, cntrylist)]['dmsp'] = nation_dict[nationNm]
    # with open('data/dmspMDG.json', 'w') as f:
    #     json.dump(mdgdict, f)
    # dmspMDGFlat = []
    # header = ['year', 'nation'] + [ x[0] for x in sorted(mdgdict['1999']['Zimbabwe'].items(), key=lambda y: y[0]) ]
    # dmspMDGFlat.append(header)
    # for year in mdgdict.keys():
    #     for nation in mdgdict[year].keys():
    #         if 'dmsp' in mdgdict[year][nation].keys():
    #             dmspMDGFlat.append([year, nation] + [ x[1] for x in sorted(mdgdict[year][nation].items(), key=lambda y: y[0]) ])
    # with open('data/dmspMDG.csv', 'w') as f:
    #     write = csv.writer(f)
    #     for line in dmspMDGFlat:
    #         write.writerow(line)
    ########################################################################################################################
    # Load DMSP and MDG and run correlation
    ########################################################################################################################
    with open('data/dmspMDG.csv', 'r') as f:
        table = csv.reader(f)
        for i, row in enumerate(table):
            if i == 0:
                header = row[2:]
                correlate = { x:[] for x in row[2:] }
            else:
                for i, series in enumerate(header):
                    try:
                        addme = float(row[i])
                    except ValueError:
                        addme = None
                    correlate[series].append(addme)
    # for series in correlate.keys():
    #     if series != 'dmsp':
    #         print(correlateSeries(correlate['dmsp'], correlate[series]))
    corrSeq = { x:correlateSeries(correlate['dmsp'], correlate[x]) for x in correlate.keys() if x != 'dmsp' and correlateSeries(correlate['dmsp'], correlate[x]) != None }
    with open('data/seriesName.json', 'r') as f:
        seriesName = json.load(f)
    # print(np.mean(corrSeq.values()))
    # for series in sorted(corrSeq.items(), key=lambda x: abs(x[1]), reverse=True)[:50]:
    #     print(series[1], seriesName[series[0]])
    with open('iframe/sortheat/seriesCorr.json', 'w') as f:
        json.dump([ {'series':x[0], 'name':seriesName[x[0]], 'value':x[1]} for x in sorted(corrSeq.items(), key=lambda x: x[0]) ], f)
    ########################################################################################################################
    # MDG 611 correlation
    ########################################################################################################################
    # mdg611 = []
    # with open('data/MDG611_clean2.csv', 'r') as f:
    #     table = csv.reader(f)
    #     for i, row in enumerate(table):
    #         if i == 0:
    #             header = row
    #             mdg611.append({ header[j]:row[j] for j,x in enumerate(row) })
    # with open('data/MDG611.json', 'w') as f:
    #     json.dump(mdg611, f)
