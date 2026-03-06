const libIndoctrinateProcessingTask = require('../../Indoctrinate-Service-ProcessingTask.js');
const libChildProcess = require('child_process');

const VIDEO_EXTENSIONS =
{
	'mp4': true, 'webm': true, 'mov': true, 'mkv': true, 'avi': true,
	'wmv': true, 'flv': true, 'm4v': true, 'ogv': true, 'mpg': true,
	'mpeg': true, 'mpe': true, 'mpv': true, 'm2v': true, 'ts': true,
	'mts': true, 'm2ts': true, 'vob': true, '3gp': true, '3g2': true,
	'f4v': true, 'rm': true, 'rmvb': true, 'divx': true, 'asf': true,
	'mxf': true, 'dv': true, 'nsv': true, 'nuv': true, 'y4m': true,
	'wtv': true, 'swf': true, 'dat': true
};

class IndoctrinateUnderstandVideo extends libIndoctrinateProcessingTask
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateUnderstandVideo';
		this.hasFfprobe = this._detectCommand('ffprobe');
	}

	_detectCommand(pCommand)
	{
		try
		{
			libChildProcess.execSync(`${pCommand} -version`, { stdio: 'ignore', timeout: 5000 });
			return true;
		}
		catch (pError)
		{
			return false;
		}
	}

	_isVideoFile(pContentDescription)
	{
		// Check MIME type from magic bytes
		if (pContentDescription.ExtendedContent && pContentDescription.ExtendedContent.MB_MIME)
		{
			let tmpMimes = pContentDescription.ExtendedContent.MB_MIME;
			if (Array.isArray(tmpMimes))
			{
				for (let i = 0; i < tmpMimes.length; i++)
				{
					if (typeof (tmpMimes[i]) === 'string' && tmpMimes[i].startsWith('video/'))
					{
						return true;
					}
				}
			}
		}
		// Fall back to extension
		let tmpExt = (pContentDescription.Name || '').split('.').pop().toLowerCase();
		return VIDEO_EXTENSIONS[tmpExt] === true;
	}

	processContentFile(fCallback, pContentDescription)
	{
		if (!this.hasFfprobe || !this._isVideoFile(pContentDescription))
		{
			return fCallback();
		}

		let tmpFileName = this.constructFileName(pContentDescription);
		console.log(`--> Probing video metadata for ${tmpFileName}`);

		try
		{
			let tmpCmd = `ffprobe -v quiet -print_format json -show_format -show_streams -show_chapters "${tmpFileName}"`;
			let tmpOutput = libChildProcess.execSync(tmpCmd, { maxBuffer: 2 * 1024 * 1024, timeout: 30000 });
			let tmpData = JSON.parse(tmpOutput.toString());

			let tmpResult =
			{
				FormatName: null,
				Duration: null,
				Bitrate: null,
				StreamCount: 0,
				Tags: {},
				Video: null,
				Audio: null,
				Chapters: []
			};

			// Parse format section
			if (tmpData.format)
			{
				tmpResult.FormatName = tmpData.format.format_name || null;
				tmpResult.Duration = parseFloat(tmpData.format.duration) || null;
				tmpResult.Bitrate = parseInt(tmpData.format.bit_rate, 10) || null;
				tmpResult.StreamCount = parseInt(tmpData.format.nb_streams, 10) || 0;

				if (tmpData.format.tags)
				{
					let tmpTagKeys = Object.keys(tmpData.format.tags);
					for (let t = 0; t < tmpTagKeys.length; t++)
					{
						tmpResult.Tags[tmpTagKeys[t].toLowerCase()] = tmpData.format.tags[tmpTagKeys[t]];
					}
				}
			}

			// Parse streams
			if (tmpData.streams)
			{
				for (let i = 0; i < tmpData.streams.length; i++)
				{
					let tmpStream = tmpData.streams[i];

					if (tmpStream.codec_type === 'video' && !tmpResult.Video)
					{
						// Skip attached pictures (album art)
						if (tmpStream.disposition && tmpStream.disposition.attached_pic)
						{
							continue;
						}

						tmpResult.Video =
						{
							Codec: tmpStream.codec_name || null,
							Profile: tmpStream.profile || null,
							Level: tmpStream.level || null,
							Width: tmpStream.width || null,
							Height: tmpStream.height || null,
							FrameRate: tmpStream.r_frame_rate || tmpStream.avg_frame_rate || null,
							PixelFormat: tmpStream.pix_fmt || null,
							ColorSpace: tmpStream.color_space || null,
							ColorRange: tmpStream.color_range || null,
							Bitrate: parseInt(tmpStream.bit_rate, 10) || null
						};
					}
					else if (tmpStream.codec_type === 'audio' && !tmpResult.Audio)
					{
						tmpResult.Audio =
						{
							Codec: tmpStream.codec_name || null,
							SampleRate: parseInt(tmpStream.sample_rate, 10) || null,
							Channels: tmpStream.channels || null,
							ChannelLayout: tmpStream.channel_layout || null,
							Bitrate: parseInt(tmpStream.bit_rate, 10) || null
						};
					}
				}
			}

			// Parse chapters
			if (tmpData.chapters && tmpData.chapters.length > 0)
			{
				for (let c = 0; c < tmpData.chapters.length; c++)
				{
					let tmpChapter = tmpData.chapters[c];
					tmpResult.Chapters.push(
					{
						Id: tmpChapter.id,
						StartTime: parseFloat(tmpChapter.start_time) || 0,
						EndTime: parseFloat(tmpChapter.end_time) || 0,
						Title: (tmpChapter.tags && tmpChapter.tags.title) || `Chapter ${tmpChapter.id + 1}`
					});
				}
			}

			console.log(`  > Video: ${tmpResult.Video ? tmpResult.Video.Width + 'x' + tmpResult.Video.Height : 'none'}, Duration: ${tmpResult.Duration}s`);
			this.addContentToExtendedCatalogData(pContentDescription, tmpResult, 'VID_META');
		}
		catch (pError)
		{
			console.log(`  > ffprobe failed for video: ${pError.message}`);
		}

		return fCallback();
	}
}

module.exports = IndoctrinateUnderstandVideo;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandVideo';
