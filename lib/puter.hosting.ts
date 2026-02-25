import puter from "@heyputer/puter.js";
import {
	createHostingSlug,
	fetchBlobFromUrl, getHostedUrl,
	getImageExtension,
	HOSTING_CONFIG_KEY,
	imageUrlToPngBlob,
	isHostedUrl
} from "./utils";

type HostingConfig = { subdomain: string };
type HostedAsset = {url: string};

export const getOrCreateHostingConfig = async() : Promise<HostingConfig| null> => {
	const existing = (await puter.kv.get(HOSTING_CONFIG_KEY) as HostingConfig | null)
	//  If config exists, return it
	if (existing?.subdomain) {
		return existing;
	}

	//  Otherwise create a new one
	const subdomain = createHostingSlug();

	/*if(!existing?.subdomain) { // @ts-ignore
		 return {subdomain: existing.subdomain};
	}*/

	try{
		const created = await puter.hosting.create(subdomain, '.');
		const config = { subdomain: created.subdomain}
		// Optional but recommended: persist it
		await puter.kv.set(HOSTING_CONFIG_KEY, config);

		return config;
		//return { subdomain: created.subdomain };
	}catch(e){
		console.warn(`Could not find subdomain: ${e}`);
		return null;
	}

}

export const uploadImageToHosting = async ({hosting, url, projectId, label}: StoreHostedImageParams): Promise<HostedAsset | null> => {

	if(!hosting || !url) return null;
	if(isHostedUrl(url)) return {url};
	try{
		const resolved =label === "rendered"
			? await imageUrlToPngBlob(url)
				.then((blob) => blob? {blob, contentType: "image/png"}: null)
			: await fetchBlobFromUrl(url);
		if(!resolved) return null;
		const contentType =  resolved.contentType|| resolved.blob.type || ''
		const ext = getImageExtension(contentType, url)
		const dir = `projects/${projectId}`;
		const filePath = `${dir}/${label}.${ext}`;
		const uploadFile = new File([resolved.blob], `${label}.${ext}`,{
			type: contentType,
		});
		await puter.fs.mkdir(dir, { createMissingParents: true });
		await puter.fs.write(filePath, uploadFile)
		const hostedUrl = getHostedUrl({subdomain: hosting.subdomain}, filePath)
		return hostedUrl ? {url: hostedUrl} : null;
	}catch (e){
		console.warn(`Failed to store hosted image: ${e}`);
		return null;
	}
}