const libIndoctrinateProcessingTask = require('../../Indoctrinate-Service-ProcessingTask.js');

const IMAGE_EXTENSIONS =
{
	'png': true, 'jpg': true, 'jpeg': true, 'gif': true, 'webp': true,
	'svg': true, 'bmp': true, 'ico': true, 'avif': true, 'tiff': true,
	'tif': true, 'heic': true, 'heif': true, 'jfif': true, 'psd': true,
	'cr2': true, 'nef': true, 'arw': true, 'dng': true, 'orf': true,
	'rw2': true, 'raw': true
};

class IndoctrinateUnderstandImage extends libIndoctrinateProcessingTask
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateUnderstandImage';
		this.hasExifr = this._detectExifr();
	}

	_detectExifr()
	{
		try
		{
			require('exifr');
			return true;
		}
		catch (pError)
		{
			return false;
		}
	}

	_isImageFile(pContentDescription)
	{
		// Check MIME type from magic bytes
		if (pContentDescription.ExtendedContent && pContentDescription.ExtendedContent.MB_MIME)
		{
			let tmpMimes = pContentDescription.ExtendedContent.MB_MIME;
			if (Array.isArray(tmpMimes))
			{
				for (let i = 0; i < tmpMimes.length; i++)
				{
					if (typeof (tmpMimes[i]) === 'string' && tmpMimes[i].startsWith('image/'))
					{
						return true;
					}
				}
			}
		}
		// Fall back to extension
		let tmpExt = (pContentDescription.Name || '').split('.').pop().toLowerCase();
		return IMAGE_EXTENSIONS[tmpExt] === true;
	}

	processContentFile(fCallback, pContentDescription)
	{
		if (!this.hasExifr || !this._isImageFile(pContentDescription))
		{
			return fCallback();
		}

		let tmpFileName = this.constructFileName(pContentDescription);
		console.log(`--> Probing image metadata for ${tmpFileName}`);

		let tmpExifr = require('exifr');

		tmpExifr.parse(tmpFileName,
		{
			// Enable all blocks for maximum metadata extraction
			tiff: true,
			exif: true,
			gps: true,
			ifd1: true,
			iptc: true,
			xmp: true,
			// Include image dimensions
			translateKeys: true,
			translateValues: true,
			reviveValues: true,
			mergeOutput: true
		})
		.then((pExifData) =>
		{
			if (!pExifData)
			{
				console.log(`  > No EXIF data found.`);
				return fCallback();
			}

			let tmpResult =
			{
				Width: pExifData.ImageWidth || pExifData.ExifImageWidth || null,
				Height: pExifData.ImageHeight || pExifData.ExifImageHeight || null,
				Orientation: pExifData.Orientation || null,
				Make: pExifData.Make || null,
				Model: pExifData.Model || null,
				LensModel: pExifData.LensModel || null,
				Software: pExifData.Software || null,
				ExposureTime: pExifData.ExposureTime || null,
				FNumber: pExifData.FNumber || null,
				ISO: pExifData.ISO || null,
				FocalLength: pExifData.FocalLength || null,
				DateTimeOriginal: pExifData.DateTimeOriginal ? pExifData.DateTimeOriginal.toISOString() : null,
				ColorSpace: pExifData.ColorSpace || null,
				WhiteBalance: pExifData.WhiteBalance || null,
				Flash: pExifData.Flash || null,
				GPS: null
			};

			// Extract GPS data
			if (pExifData.latitude !== undefined && pExifData.longitude !== undefined)
			{
				tmpResult.GPS =
				{
					Latitude: pExifData.latitude,
					Longitude: pExifData.longitude,
					Altitude: pExifData.GPSAltitude || null
				};
				console.log(`  > GPS: ${tmpResult.GPS.Latitude}, ${tmpResult.GPS.Longitude}`);
			}

			console.log(`  > Image: ${tmpResult.Width}x${tmpResult.Height}, Camera: ${tmpResult.Make || 'unknown'} ${tmpResult.Model || ''}`);
			this.addContentToExtendedCatalogData(pContentDescription, tmpResult, 'IMG_META');

			return fCallback();
		})
		.catch((pError) =>
		{
			console.log(`  > EXIF parse failed for image: ${pError.message}`);
			return fCallback();
		});
	}
}

module.exports = IndoctrinateUnderstandImage;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandImage';
