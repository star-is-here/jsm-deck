import ujson as json, pprint, csv, numpy as np, rasterio, rasterio.features, fiona, matplotlib.pyplot as plt, os, seaborn as sns
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
        with open('%s.json'%vname, 'wb') as f:
            json.dump(county, f)

    if dumpCSV:
        with open('%s.csv'%rname, 'wb') as f:
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


if __name__=='__main__':
    levels = [ 'admin_level_4.geojson', 'regions.geojson' ]
    nations = [ 'china', 'north-korea', 'south-korea', 'bangladesh', 'india', 'japan', 'republic-of-china', 'thailand', 'vietnam' ]
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
    parity = {}
    with open('data/MDG611.csv', 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            parity[unicode(row[1])] = row[24:28]
    with open('data/vector/countries.geo.json', 'rb') as f:
        planet = json.load(f)
        for country in planet['features']:
            try:
                country['properties']['parity1'] = parity[country['properties']['name']][0]
                country['properties']['parity2'] = parity[country['properties']['name']][1]
                country['properties']['parity3'] = parity[country['properties']['name']][2]
                country['properties']['parity4'] = parity[country['properties']['name']][3]
            except KeyError:
                country['properties']['parity1'] = None
                country['properties']['parity2'] = None
                country['properties']['parity3'] = None
                country['properties']['parity4'] = None
    with open('data/vector/countries_parity.geo.json', 'wb') as f:
        json.dump(planet, f)
