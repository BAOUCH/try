import rasterio
from rio_cogeo.cogeo import cog_translate

input_file = '10300500E4F91800visual13.tif'


output_file = 'cog_10300500E4F91800visual13.tif'

# Open the input GeoTIFF
with rasterio.open(input_file) as src:
    # Prepare destination file options (metadata and format settings)
    dst_kwargs = {
        'driver': 'GTiff',
        'count': src.count,  # number of bands
        'dtype': src.dtypes[0],  # data type of the first band
        'crs': src.crs,  # coordinate reference system
        'transform': src.transform,  # affine transform
        'width': src.width,  # width of the image
        'height': src.height,  # height of the image
        'blockxsize': 256,  # tile width (256 is a common choice)
        'blockysize': 256,  # tile height (256 is a common choice)
    }
    # Perform the conversion
    cog_translate(src, output_file, dst_kwargs=dst_kwargs)

