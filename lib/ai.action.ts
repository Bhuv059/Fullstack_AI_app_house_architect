import {HOMEARCHI_RENDER_PROMPT} from "./constants";
import puter from "@heyputer/puter.js";

export const  fetchAsDataURL= async (url: string): Promise<string> => {
	return fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
			}
			return response.blob();
		})
		.then(blob => {
			return new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (reader.result) {
						resolve(reader.result as string);
					} else {
						reject(new Error('Failed to convert blob to data URL'));
					}
				};
				reader.onerror = () => reject(new Error('FileReader error'));
				reader.readAsDataURL(blob);
			});
		});
}

export const generate3DView = async ({sourceImage}: Generate3DViewParams) => {
	const dataUrl = sourceImage.startsWith('data')
		? sourceImage
		: await fetchAsDataURL(sourceImage);

	const base64Url = dataUrl.split(',')[1]
	const mimeType = dataUrl.split(';')[0].split(':')[1]

	if(!mimeType || !base64Url) throw new Error('Invalid source image payload');

	const response = await puter.ai.txt2img(HOMEARCHI_RENDER_PROMPT,{
		provider: 'gemini',
		model: "gemini-2.5-flash-image-preview",
		input_image: base64Url,
		input_image_mime_type: mimeType,
		ratio: {w:1024, h:1024},
	})

	const rawImageUrl =  (response as HTMLImageElement).src ?? null;

	if(!rawImageUrl) return { renderedImage: null, renderedPath: undefined }

	const renderedImage = rawImageUrl.startsWith('data')
		? rawImageUrl: await fetchAsDataURL(rawImageUrl)
	return  { renderedImage, renderedPath: undefined }

}