const libIndoctrinateProcessingTask = require('../../Indoctrinate-Service-ProcessingTask.js');
const libChildProcess = require('child_process');

const AUDIO_EXTENSIONS =
{
	'mp3': true, 'wav': true, 'ogg': true, 'flac': true, 'aac': true,
	'm4a': true, 'wma': true, 'oga': true, 'opus': true, 'aiff': true,
	'aif': true, 'ape': true, 'wv': true, 'mka': true, 'ac3': true,
	'dts': true, 'mid': true, 'midi': true, 'ra': true, 'ram': true
};

class IndoctrinateUnderstandAudio extends libIndoctrinateProcessingTask
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateUnderstandAudio';
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

	_isAudioFile(pContentDescription)
	{
		// Check MIME type from magic bytes
		if (pContentDescription.ExtendedContent && pContentDescription.ExtendedContent.MB_MIME)
		{
			let tmpMimes = pContentDescription.ExtendedContent.MB_MIME;
			if (Array.isArray(tmpMimes))
			{
				for (let i = 0; i < tmpMimes.length; i++)
				{
					if (typeof (tmpMimes[i]) === 'string' && tmpMimes[i].startsWith('audio/'))
					{
						return true;
					}
				}
			}
		}
		// Fall back to extension
		let tmpExt = (pContentDescription.Name || '').split('.').pop().toLowerCase();
		return AUDIO_EXTENSIONS[tmpExt] === true;
	}

	processContentFile(fCallback, pContentDescription)
	{
		if (!this.hasFfprobe || !this._isAudioFile(pContentDescription))
		{
			return fCallback();
		}

		let tmpFileName = this.constructFileName(pContentDescription);
		console.log(`--> Probing audio metadata for ${tmpFileName}`);

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
				Tags: {},
				Audio: null,
				Chapters: []
			};

			// Parse format section
			if (tmpData.format)
			{
				tmpResult.FormatName = tmpData.format.format_name || null;
				tmpResult.Duration = parseFloat(tmpData.format.duration) || null;
				tmpResult.Bitrate = parseInt(tmpData.format.bit_rate, 10) || null;

				// Extract all format-level tags (ID3v2, Vorbis comments, etc.)
				if (tmpData.format.tags)
				{
					let tmpTagKeys = Object.keys(tmpData.format.tags);
					for (let t = 0; t < tmpTagKeys.length; t++)
					{
						tmpResult.Tags[tmpTagKeys[t].toLowerCase()] = tmpData.format.tags[tmpTagKeys[t]];
					}
				}
			}

			// Parse audio stream
			if (tmpData.streams)
			{
				for (let i = 0; i < tmpData.streams.length; i++)
				{
					let tmpStream = tmpData.streams[i];

					if (tmpStream.codec_type === 'audio' && !tmpResult.Audio)
					{
						tmpResult.Audio =
						{
							Codec: tmpStream.codec_name || null,
							Profile: tmpStream.profile || null,
							SampleRate: parseInt(tmpStream.sample_rate, 10) || null,
							Channels: tmpStream.channels || null,
							ChannelLayout: tmpStream.channel_layout || null,
							Bitrate: parseInt(tmpStream.bit_rate, 10) || null,
							BitsPerSample: parseInt(tmpStream.bits_per_raw_sample, 10) || null
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

			console.log(`  > Audio: ${tmpResult.Audio ? tmpResult.Audio.Codec : 'none'}, Duration: ${tmpResult.Duration}s, Tags: ${Object.keys(tmpResult.Tags).length}`);
			this.addContentToExtendedCatalogData(pContentDescription, tmpResult, 'AUD_META');
		}
		catch (pError)
		{
			console.log(`  > ffprobe failed for audio: ${pError.message}`);
		}

		return fCallback();
	}
}

module.exports = IndoctrinateUnderstandAudio;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandAudio';
