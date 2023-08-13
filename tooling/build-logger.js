// Styles (Refer to https://tforgione.fr/posts/ansi-escape-codes/)
const reset = '\u001B[0m';
const bgRed = '\u001B[41m';
const fgBlue = '\u001B[34m';
const bgBlue = '\u001B[44m';
const fgGreen = '\u001B[32m';
const bgOrange = '\u001B[48;2;174;138;45m';
const bgMagenta = '\u001B[45m';
const fgWhite = '\u001B[37m';
const fgBlack = '\u001B[30m';
const bold = '\u001B[1m';
const bgRgbSwitch = '\u001B[48;2;';
const fgRgbSwitch = '\u001B[38;2;';

/**
 * Creates the banner color string to use for logging your banners.
 * Color codes comes either as string (e.g '\u001B[37m') or as array
 * symbolising RGB codes (e.g. [255,255,0]). If as array, length MUST be 3.
 *
 * @param {(number[]|string)} [bgColor='\u001B[44m'] - Background color code. Defaults to blue.
 * @param {(number[]|string)} [fgColor='\u001B[37m'] - Foreground color code. Defaults to white.
 */
function getBannerColors(bgColor, fgColor) {
	let backgroundColor = bgBlue;
	let foregroundColor = fgWhite;

	if (typeof bgColor === 'string') {
		backgroundColor = bgColor;
	} else if (Array.isArray(bgColor) && bgColor.length === 3) {
		backgroundColor = `${bgRgbSwitch}${bgColor.join(';')}m`;
	}

	if (typeof fgColor === 'string') {
		foregroundColor = fgColor;
	} else if (Array.isArray(fgColor) && fgColor.length === 3) {
		foregroundColor = `${fgRgbSwitch}${fgColor.join(';')}m`;
	}

	return `${backgroundColor}${foregroundColor}${bold}`;
}

const logger = {
	success: message => {
		console.log(`${fgGreen}${bold}`, '\n\bSUCCESS', `\b${reset}`, `${message}`);
	},
	warning: message => {
		console.log(`${fgBlack}${bgOrange}${bold}`, 'WARNING', `${reset}`, message);
	},
	failure: error => {
		console.log(`${fgBlack}${bgRed}${bold}`, 'FAILURE', `${reset}`, error);
	},
	info: message => {
		console.log(`${fgBlue}${fgBlue}${bold}`, '\bINFO', `\b${reset}`, message);
	},
	log: message => {
		console.log(message);
	},
	step: message => {
		console.log(`\t\u2714 ${message}`);
	},
	banner: (message, style = `${fgWhite}${bgMagenta}${bold}`) => {
		console.log(`\n${style}`, message, `${reset}\n`);
	}
};

function em(string) {
	return `${bold}${string}${reset}`;
}

const sassBannerBranding = getBannerColors([207, 100, 154], [248, 249, 250]);
const jsBannerBranding = getBannerColors([252, 220, 0], [24, 24, 24]);
const svgoBannerBranding = getBannerColors([46, 73, 177], [234, 237, 242]);
const dangerBannerBranding = getBannerColors(bgRed);
const nodeJSBannerBranding = getBannerColors([67, 133, 61]);

module.exports = {
	logger,
	em,
	sassBannerBranding,
	jsBannerBranding,
	svgoBannerBranding,
	dangerBannerBranding,
	nodeJSBannerBranding
};
